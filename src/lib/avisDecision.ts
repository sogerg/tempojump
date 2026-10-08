// Demande d'avis in-app : la décision, sans aucun module natif (testable sous Node).
// Procédure du portefeuille : docs/procedure/avis-in-app.md (08/10/2026).
// On ne demande l'avis qu'après 3 moments de satisfaction, au moins 2 jours après la première
// ouverture de l'app et au moins 120 jours après la dernière demande faite par l'app. C'est
// ensuite le système (Apple : 3 fois par an au plus) qui décide d'afficher ou non la fenêtre.

export const AVIS_MOMENTS_MIN = 3;
export const AVIS_JOURS_APRES_PREMIERE_OUVERTURE = 2;
export const AVIS_JOURS_ENTRE_DEMANDES = 120;
const JOUR_MS = 24 * 60 * 60 * 1000;

export interface EtatAvis {
  /** Nombre de moments de satisfaction depuis l'installation. */
  moments: number;
  /** Première ouverture de l'app (ms depuis 1970), null si inconnue. */
  premiereOuverture: number | null;
  /** Dernière demande d'avis faite par l'app (ms), null si jamais. */
  derniereDemande: number | null;
}

export const ETAT_AVIS_INITIAL: EtatAvis = { moments: 0, premiereOuverture: null, derniereDemande: null };

function nombreOuNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Relit l'état stocké ; un contenu absent ou illisible redonne l'état initial. */
export function lireEtatAvis(brut: string | null | undefined): EtatAvis {
  if (!brut) return { ...ETAT_AVIS_INITIAL };
  try {
    const o = JSON.parse(brut) as Record<string, unknown>;
    const moments = nombreOuNull(o?.moments);
    return {
      moments: moments !== null && moments > 0 ? Math.floor(moments) : 0,
      premiereOuverture: nombreOuNull(o?.premiereOuverture),
      derniereDemande: nombreOuNull(o?.derniereDemande),
    };
  } catch {
    return { ...ETAT_AVIS_INITIAL };
  }
}

/** Mémorise la première ouverture (sans jamais la déplacer ensuite). */
export function avecPremiereOuverture(etat: EtatAvis, maintenant: number): EtatAvis {
  return etat.premiereOuverture === null ? { ...etat, premiereOuverture: maintenant } : etat;
}

/** Compte un moment de satisfaction de plus. */
export function avecMomentDeSatisfaction(etat: EtatAvis, maintenant: number): EtatAvis {
  return { ...avecPremiereOuverture(etat, maintenant), moments: etat.moments + 1 };
}

/** Vrai si l'app peut demander l'avis maintenant (hors disponibilité du module natif). */
export function doitDemanderAvis(etat: EtatAvis, maintenant: number): boolean {
  if (etat.moments < AVIS_MOMENTS_MIN) return false;
  if (etat.premiereOuverture === null) return false;
  if (maintenant - etat.premiereOuverture < AVIS_JOURS_APRES_PREMIERE_OUVERTURE * JOUR_MS) return false;
  if (etat.derniereDemande !== null && maintenant - etat.derniereDemande < AVIS_JOURS_ENTRE_DEMANDES * JOUR_MS) {
    return false;
  }
  return true;
}

/**
 * Adresses du lien « Noter l'app » des Réglages. iOS : formulaire d'avis de l'App Store, ou null
 * tant que l'app n'a pas d'ID App Store (la ligne n'est alors pas affichée). Android : la fiche
 * Google Play (market://), avec un repli https si aucune app ne sait ouvrir market://.
 */
export function adressesNoterApp(
  plateforme: string,
  idAppStore: string,
  packageAndroid: string,
): { principale: string; repli: string | null } | null {
  if (plateforme === 'ios') {
    const id = idAppStore.trim();
    return /^\d+$/.test(id) ? { principale: `https://apps.apple.com/app/id${id}?action=write-review`, repli: null } : null;
  }
  if (plateforme === 'android') {
    if (!packageAndroid) return null;
    return {
      principale: `market://details?id=${packageAndroid}`,
      repli: `https://play.google.com/store/apps/details?id=${packageAndroid}`,
    };
  }
  return null;
}
