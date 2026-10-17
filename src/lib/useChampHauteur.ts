import { useEffect, useRef, useState } from 'react';
import { hauteurInitiale, toMeters, type UnitSystem } from './units';

/**
 * Champ de hauteur d'obstacle qui suit l'unité choisie : passer de métrique à impérial convertit la
 * valeur saisie au lieu de la garder telle quelle (« 1,10 » devenait 1,10 PIED, soit 33 cm — S24
 * 17/10/2026). Une saisie illisible est laissée intacte.
 */
export function useChampHauteur(defautMetres: number, unitSystem: UnitSystem): [string, (v: string) => void] {
  const [texte, setTexte] = useState(() => hauteurInitiale(defautMetres, unitSystem));
  const unitePrecedente = useRef(unitSystem);
  useEffect(() => {
    const avant = unitePrecedente.current;
    unitePrecedente.current = unitSystem;
    if (avant === unitSystem) return;
    setTexte((t) => {
      const lu = Number(t.replace(',', '.'));
      if (!t.trim() || !Number.isFinite(lu)) return t;
      return hauteurInitiale(toMeters(lu, avant), unitSystem);
    });
  }, [unitSystem]);
  return [texte, setTexte];
}
