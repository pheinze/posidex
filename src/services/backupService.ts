import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';
import superjson from '../lib/superjson';
import { journalStore } from '../stores/journalStore';
import { updatePresetStore } from '../stores/presetStore';
import type { JournalEntry } from '../stores/types';
import { app } from './app';

const BACKUP_VERSION = 2; // Incremented version due to new superjson format
const APP_NAME = 'R-Calculator';

// The structure for the data payload in the backup
interface BackupData {
  settings: object | null; // Stored as JS object
  presets: object | null;  // Stored as JS object
  journal: JournalEntry[] | null;  // Stored as typed array
}

// The overall structure of the backup file
interface BackupFile {
  backupVersion: number;
  timestamp: string;
  appName: string;
  data: BackupData;
}

/**
 * Creates a JSON backup file of the user's data and triggers a download.
 */
export function createBackup() {
  if (!browser) return;

  const backupFile: BackupFile = {
    backupVersion: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    appName: APP_NAME,
    data: {
      settings: JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY) || '{}'),
      presets: JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}'),
      journal: superjson.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY) || '[]'),
    }
  };

  const jsonString = superjson.stringify(backupFile);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  link.download = `${APP_NAME}-Backup-${date}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Restores user data from a JSON backup file content.
 * This function writes the data to localStorage and updates the live Svelte stores.
 * @param jsonContent The string content of the uploaded JSON file.
 * @returns An object indicating success or failure with a message.
 */
export function restoreFromBackup(jsonContent: string): { success: boolean; message: string } {
  if (!browser) {
    return { success: false, message: 'Backup can only be restored in a browser environment.' };
  }

  try {
    const backup: BackupFile = superjson.parse(jsonContent);

    // --- Validation ---
    if (backup.appName !== APP_NAME) {
      return { success: false, message: 'This backup file is not for this application.' };
    }
    if (!backup.backupVersion || backup.backupVersion > BACKUP_VERSION) {
      return { success: false, message: `Unsupported backup version. This app supports up to version ${BACKUP_VERSION}.` };
    }
    if (!backup.data) {
      return { success: false, message: 'Invalid backup file format: Missing data.' };
    }

    // --- Restore to localStorage AND Stores ---
    if (backup.data.settings) {
      const settingsString = JSON.stringify(backup.data.settings);
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, settingsString);
    }
    if (backup.data.presets) {
      const presetsString = JSON.stringify(backup.data.presets);
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, presetsString);
      updatePresetStore(s => ({...s, availablePresets: Object.keys(backup.data.presets as object)}));
    }
    if (backup.data.journal) {
      const journalString = superjson.stringify(backup.data.journal);
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, journalString);
      journalStore.set(backup.data.journal);
    }

    return { success: true, message: 'Restore successful!' };

  } catch (error) {
    console.error('Failed to parse or restore backup file.', error);
    return { success: false, message: 'The selected file is not a valid backup file or is corrupted.' };
  }
}
