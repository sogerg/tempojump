/**
 * Isolement bidirectionnel (LRI … PDI) : un nombre, une unité ou un enchaînement « 4a → 4b »
 * glissé dans une phrase arabe garde son ordre de gauche à droite (« 22,5 m » ne devient pas
 * « m 22,5 », « 3 → 4 » ne s'inverse pas). Invisible dans les langues de gauche à droite.
 */
export function isoler(texte: string | number): string {
  return `⁦${texte}⁩`;
}
