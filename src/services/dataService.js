import { isFirebaseConfigured } from '../firebase/firebase';
import { createFirestoreDataService } from './firestoreDataService';
import { localDataService } from './localDataService';

export function createDataService({ user, localOnlyMode }) {
  let service = localDataService;
  let mode = 'local';

  if (user && isFirebaseConfigured && !localOnlyMode) {
    try {
      service = createFirestoreDataService(user.uid);
      mode = 'firestore';
    } catch {
      service = localDataService;
      mode = 'local';
    }
  }

  return {
    mode,
    service,
    getSettings: () => service.getSettings(),
    saveSettings: (settings) => service.saveSettings(settings),
    updateSettings: (partialSettings) => service.updateSettings(partialSettings),
  };
}
