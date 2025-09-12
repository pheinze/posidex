import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';

const BACKUP_VERSION = 1;
const APP_NAME = 'R-Calculator';

/**
 * Defines the structure for the data payload within the backup file.
 * Data is stored as raw strings from localStorage.
 */
interface BackupData {
  /** A JSON string of the user's settings. */
  settings: string | null;
  /** A JSON string of the user's saved presets. */
  presets: string | null;
  /** A JSON string of the user's journal entries. */
  journal: string | null;
}

/**
 * Defines the overall structure of the backup JSON file.
 */
interface BackupFile {
  /** The version of the backup format. */
  backupVersion: number;
  /** The ISO 8601 timestamp of when the backup was created. */
  timestamp: string;
  /** The name of the application that created the backup. */
  appName: string;
  /** The container for the actual user data. */
  data: BackupData;
}

/**
 * Retrieves raw data directly from localStorage.
 * @param key The localStorage key.
 * @returns The raw string data or null if not found.
 */
function getDataFromLocalStorage(key: string): string | null {
  if (!browser) return null;
  return localStorage.getItem(key);
}

/**
 * Creates a JSON backup file of all user data (settings, presets, journal)
 * and triggers a download in the user's browser.
 */
export function createBackup() {
  if (!browser) return;

  const backupFile: BackupFile = {
    backupVersion: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    appName: APP_NAME,
    data: {
      settings: getDataFromLocalStorage(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY),
      presets: getDataFromLocalStorage(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY),
      journal: getDataFromLocalStorage(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY),
    }
  };

  const jsonString = JSON.stringify(backupFile, null, 2);
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
 * Restores user data from the content of a JSON backup file.
 * This function validates the backup, writes the data to localStorage,
 * and returns the data for reactive updates in the UI.
 * @param jsonContent The string content of the uploaded JSON backup file.
 * @returns An object indicating success or failure, a message, and the restored data.
 */
export function restoreFromBackup(jsonContent: string): { success: boolean; message: string; data?: BackupData } {
  if (!browser) {
    return { success: false, message: 'Backup can only be restored in a browser environment.' };
  }

  try {
    const backup: BackupFile = JSON.parse(jsonContent);

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

    // --- Restore to localStorage ---
    if (backup.data.settings) {
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, backup.data.settings);
    }
    if (backup.data.presets) {
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, backup.data.presets);
    }
    if (backup.data.journal) {
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, backup.data.journal);
    }

    // Return the data for reactive updates.
    return { success: true, message: 'Restore successful!', data: backup.data };

  } catch (error) {
    console.error('Failed to parse or restore backup file.', error);
    return { success: false, message: 'The selected file is not a valid backup file.' };
  }
}
