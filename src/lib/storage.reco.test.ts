// Stockage des recos (1.1) : un téléphone qui passe de la 1.0.5 à la 1.1 n'a pas la clé
// « @cavalier/courseWalks » ; ses autres données (montures, plans, carnet) ne doivent pas bouger.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-file-system', () => ({ File: class {}, Paths: {} }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteCourseWalk,
  isRiderStepCalibrated,
  loadCourseWalks,
  loadHorses,
  loadJournalEntries,
  upsertCourseWalk,
} from './storage';
import { nouvelleReco } from './reco';

const cheval = { id: 'h1', name: 'Voltigeur', withersHeight: 160 };
const reco = (id: string) =>
  nouvelleReco({ id, date: '2026-10-28T09:00:00.000Z', horse: cheval, terrain: 'Plat', speed: 'Standard', speedMetersPerMinute: 350, longueurPas: 0.9 });

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('données d’une 1.0.5 (sans recos) : liste vide, le reste intact', async () => {
  await AsyncStorage.multiSet([
    ['@cavalier/horses', JSON.stringify([cheval])],
    ['@cavalier/journalEntries', JSON.stringify([{ id: 'j1', name: 'CSO Lamotte', date: '2026-10-12' }])],
    ['@cavalier/riderStepLength', '0.92'],
  ]);
  expect(await loadCourseWalks()).toEqual([]);
  expect(await loadHorses()).toEqual([cheval]);
  expect((await loadJournalEntries())[0].name).toBe('CSO Lamotte');
  expect(await isRiderStepCalibrated()).toBe(true);
});

test('pas jamais étalonné', async () => {
  expect(await isRiderStepCalibrated()).toBe(false);
});

test('ajouter, remplacer, supprimer une reco', async () => {
  await upsertCourseWalk(reco('a'));
  await upsertCourseWalk(reco('b'));
  await upsertCourseWalk({ ...reco('a'), eventName: 'Finale' });
  let walks = await loadCourseWalks();
  expect(walks.map((w) => w.id)).toEqual(['a', 'b']);
  expect(walks[0].eventName).toBe('Finale');
  walks = await deleteCourseWalk('a');
  expect(walks.map((w) => w.id)).toEqual(['b']);
  expect((await loadCourseWalks()).map((w) => w.id)).toEqual(['b']);
});
