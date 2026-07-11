import { File } from 'expo-file-system';

interface BoxInfo {
  type: string;
  start: number;
  size: number;
  headerSize: number;
}

function readBoxHeader(data: Uint8Array, view: DataView, offset: number, limit: number): BoxInfo | null {
  if (offset + 8 > limit) return null;
  let size = view.getUint32(offset);
  const type = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);
  let headerSize = 8;
  if (size === 1) {
    if (offset + 16 > limit) return null;
    const hi = view.getUint32(offset + 8);
    const lo = view.getUint32(offset + 12);
    size = hi * 2 ** 32 + lo;
    headerSize = 16;
  } else if (size === 0) {
    size = limit - offset;
  }
  if (size < headerSize || offset + size > limit) return null;
  return { type, start: offset, size, headerSize };
}

function parseTopLevelBoxes(data: Uint8Array, view: DataView): BoxInfo[] {
  const boxes: BoxInfo[] = [];
  let offset = 0;
  while (offset < data.length) {
    const box = readBoxHeader(data, view, offset, data.length);
    if (!box) break;
    boxes.push(box);
    offset += box.size;
  }
  return boxes;
}

// Les tables stco/co64 stockent des offsets absolus (depuis le début du fichier) vers les
// échantillons dans mdat. Déplacer moov avant mdat décale mdat de exactement moov.size
// octets : il faut donc corriger chaque offset stocké du même montant.
const CONTAINER_BOX_TYPES = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts']);

function patchChunkOffsets(data: Uint8Array, view: DataView, start: number, end: number, shift: number): void {
  let offset = start;
  while (offset < end) {
    const box = readBoxHeader(data, view, offset, end);
    if (!box) break;
    const bodyStart = box.start + box.headerSize;

    if (CONTAINER_BOX_TYPES.has(box.type)) {
      patchChunkOffsets(data, view, bodyStart, box.start + box.size, shift);
    } else if (box.type === 'stco') {
      const entryCount = view.getUint32(bodyStart + 4);
      let p = bodyStart + 8;
      for (let i = 0; i < entryCount && p + 4 <= end; i++) {
        view.setUint32(p, view.getUint32(p) + shift);
        p += 4;
      }
    } else if (box.type === 'co64') {
      const entryCount = view.getUint32(bodyStart + 4);
      let p = bodyStart + 8;
      for (let i = 0; i < entryCount && p + 8 <= end; i++) {
        const value = view.getUint32(p) * 2 ** 32 + view.getUint32(p + 4) + shift;
        view.setUint32(p, Math.floor(value / 2 ** 32));
        view.setUint32(p + 4, value >>> 0);
        p += 8;
      }
    }

    offset += box.size;
  }
}

/**
 * Réordonne un fichier MP4 pour placer l'index moov avant mdat ("faststart"), sans
 * ré-encodage. Les enregistrements caméra Android placent moov en fin de fichier, ce que
 * certains lecteurs vidéo web (aperçu Gmail, par exemple) refusent de prévisualiser en
 * streaming — alors que le fichier n'est pas corrompu (il se lit très bien une fois
 * téléchargé, ou dans un lecteur natif). Retourne `true` si le fichier a été réordonné.
 */
export function remuxToFastStart(uri: string): boolean {
  try {
    const file = new File(uri);
    const data = file.bytesSync();
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const boxes = parseTopLevelBoxes(data, view);

    const ftyp = boxes.find((b) => b.type === 'ftyp');
    const moov = boxes.find((b) => b.type === 'moov');
    const mdat = boxes.find((b) => b.type === 'mdat');
    if (!ftyp || !moov || !mdat) return false;
    if (moov.start < mdat.start) return false;

    const moovBytes = data.slice(moov.start, moov.start + moov.size);
    const moovView = new DataView(moovBytes.buffer, moovBytes.byteOffset, moovBytes.byteLength);
    patchChunkOffsets(moovBytes, moovView, moov.headerSize, moovBytes.length, moov.size);

    const ftypEnd = ftyp.start + ftyp.size;
    const beforeMoov = data.slice(ftypEnd, moov.start);
    const afterMoov = data.slice(moov.start + moov.size);

    const result = new Uint8Array(data.length);
    let pos = 0;
    result.set(data.subarray(0, ftypEnd), pos);
    pos += ftypEnd;
    result.set(moovBytes, pos);
    pos += moovBytes.length;
    result.set(beforeMoov, pos);
    pos += beforeMoov.length;
    result.set(afterMoov, pos);

    file.write(result);
    return true;
  } catch {
    return false;
  }
}
