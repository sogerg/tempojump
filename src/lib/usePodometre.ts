import { useCallback, useEffect, useRef, useState } from 'react';
import { Pedometer } from 'expo-sensors';

export type EtatPodometre = 'attente' | 'actif' | 'refuse' | 'indisponible';

/**
 * Podomètre en direct pour la reco (expo-sensors, Pedometer.watchStepCount).
 *
 * `watchStepCount` rend le nombre de pas CUMULÉ depuis l'abonnement. Pour la pause, on se
 * désabonne et on garde le total déjà marché dans `base` : à la reprise, le nouveau compteur
 * repart de 0 et s'ajoute. `lire()` donne la valeur à l'instant (lue au moment de l'appui sur
 * « Obstacle », cahier §5 : le compte peut avoir une seconde de retard, d'où la correction +/−).
 *
 * Sans podomètre (refusé, absent, simulateur) : état « refuse » / « indisponible », l'écran passe
 * en saisie manuelle.
 */
export function usePodometre(enMarche: boolean) {
  const [etat, setEtat] = useState<EtatPodometre>('attente');
  const [total, setTotal] = useState(0);
  const base = useRef(0);
  const courant = useRef(0);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const disponible = await Pedometer.isAvailableAsync();
        if (annule) return;
        if (!disponible) {
          setEtat('indisponible');
          return;
        }
        const permission = await Pedometer.requestPermissionsAsync();
        if (annule) return;
        setEtat(permission.granted ? 'actif' : 'refuse');
      } catch {
        if (!annule) setEtat('indisponible');
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    if (etat !== 'actif' || !enMarche) return;
    courant.current = 0;
    let abonnement: { remove: () => void } | null = null;
    try {
      abonnement = Pedometer.watchStepCount((resultat) => {
        courant.current = resultat.steps;
        setTotal(base.current + resultat.steps);
      });
    } catch {
      setEtat('indisponible');
    }
    return () => {
      abonnement?.remove();
      base.current += courant.current;
      courant.current = 0;
    };
  }, [etat, enMarche]);

  /** Total de pas marchés depuis l'ouverture de l'écran (pauses exclues), à l'instant. */
  const lire = useCallback(() => base.current + courant.current, []);

  return { etat, total, lire };
}
