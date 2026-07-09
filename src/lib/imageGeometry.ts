export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point, Size {}

/** Rectangle occupé par la photo à l'intérieur de son conteneur en mode resizeMode="contain". */
export function getContainRect(container: Size, natural: Size): Rect {
  if (!container.width || !container.height || !natural.width || !natural.height) {
    return { x: 0, y: 0, width: container.width, height: container.height };
  }
  const scale = Math.min(container.width / natural.width, container.height / natural.height);
  const width = natural.width * scale;
  const height = natural.height * scale;
  return { x: (container.width - width) / 2, y: (container.height - height) / 2, width, height };
}

/** Convertit un point en pixels (dans un conteneur) en fraction [0,1] relative à la photo affichée. */
export function pixelToFraction(point: Point, rect: Rect): Point {
  if (!rect.width || !rect.height) return { x: 0, y: 0 };
  return { x: (point.x - rect.x) / rect.width, y: (point.y - rect.y) / rect.height };
}

/** Convertit une fraction [0,1] relative à la photo en pixels dans le conteneur donné. */
export function fractionToPixel(point: Point, rect: Rect): Point {
  return { x: rect.x + point.x * rect.width, y: rect.y + point.y * rect.height };
}
