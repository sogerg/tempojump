import {
  adressesNoterApp,
  avecMomentDeSatisfaction,
  avecPremiereOuverture,
  doitDemanderAvis,
  ETAT_AVIS_INITIAL,
  lireEtatAvis,
} from "./avisDecision";

const JOUR = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 8);

describe("demande d'avis in-app", () => {
  const pret = { moments: 3, premiereOuverture: T0, derniereDemande: null };

  it("demande après 3 moments et 2 jours depuis la première ouverture", () => {
    expect(doitDemanderAvis(pret, T0 + 2 * JOUR)).toBe(true);
  });

  it("ne demande pas avant 3 moments", () => {
    expect(doitDemanderAvis({ ...pret, moments: 2 }, T0 + 10 * JOUR)).toBe(false);
  });

  it("ne demande pas avant 2 jours depuis la première ouverture", () => {
    expect(doitDemanderAvis(pret, T0 + 2 * JOUR - 1)).toBe(false);
    expect(doitDemanderAvis({ ...pret, premiereOuverture: null }, T0 + 10 * JOUR)).toBe(false);
  });

  it("attend 120 jours après la dernière demande", () => {
    const demande = { ...pret, moments: 9, derniereDemande: T0 + 5 * JOUR };
    expect(doitDemanderAvis(demande, T0 + 124 * JOUR)).toBe(false);
    expect(doitDemanderAvis(demande, T0 + 125 * JOUR)).toBe(true);
  });

  it("compte les moments et garde la première ouverture", () => {
    let e = avecPremiereOuverture(ETAT_AVIS_INITIAL, T0);
    e = avecPremiereOuverture(e, T0 + JOUR);
    e = avecMomentDeSatisfaction(e, T0 + 2 * JOUR);
    expect(e).toEqual({ moments: 1, premiereOuverture: T0, derniereDemande: null });
  });

  it("relit un état absent ou illisible comme l'état initial", () => {
    expect(lireEtatAvis(null)).toEqual(ETAT_AVIS_INITIAL);
    expect(lireEtatAvis("{pas du json")).toEqual(ETAT_AVIS_INITIAL);
    expect(lireEtatAvis(JSON.stringify({ moments: 4, premiereOuverture: T0, derniereDemande: "x" }))).toEqual({
      moments: 4,
      premiereOuverture: T0,
      derniereDemande: null,
    });
  });

  it("lien Noter l'app : masqué sur iOS sans ID, market:// avec repli sur Android", () => {
    expect(adressesNoterApp("ios", "", "com.exemple")).toBeNull();
    expect(adressesNoterApp("ios", "123", "com.exemple")?.principale).toBe(
      "https://apps.apple.com/app/id123?action=write-review",
    );
    expect(adressesNoterApp("android", "", "com.exemple")).toEqual({
      principale: "market://details?id=com.exemple",
      repli: "https://play.google.com/store/apps/details?id=com.exemple",
    });
    expect(adressesNoterApp("web", "123", "com.exemple")).toBeNull();
  });
});
