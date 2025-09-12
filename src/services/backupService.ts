import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';
import superjson from '$lib/superjson';
import type { JournalEntry } from '../stores/types';
import type { getInputsAsObject } from '../services/app';

const BACKUP_VERSION = 2; // Incremented version due to data structure change (superjson)
const APP_NAME = 'R-Calculator';

interface BackupData {
  settings: string | null;
  presets: string | null;
  journal: string | null;
}

interface BackupFile {
  backupVersion: number;
  timestamp: string;
  appName: string;
  data: BackupData;
}

export interface RestoredData {
    settings: ReturnType<typeof getInputsAsObject>;
    presets: Record<string, ReturnType<typeof getInputsAsObject>>;
    journal: JournalEntry[];
}

function getDataFromLocalStorage(key: string): string | null {
  if (!browser) return null;
  return localStorage.getItem(key);
}

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

export function restoreFromBackup(jsonContent: string): { success: boolean; message: string; data?: RestoredData } {
  if (!browser) {
    return { success: false, message: 'Backup can only be restored in a browser environment.' };
  }

  try {
    const backup: BackupFile = JSON.parse(jsonContent);

    if (backup.appName !== APP_NAME) {
      return { success: false, message: 'This backup file is not for this application.' };
    }
    if (!backup.backupVersion || backup.backupVersion > BACKUP_VERSION) {
      return { success: false, message: `Unsupported backup version. This app supports up to version ${BACKUP_VERSION}.` };
    }
    if (!backup.data) {
      return { success: false, message: 'Invalid backup file format: Missing data.' };
    }

    const restoredData: Partial<RestoredData> = {};

    if (backup.data.settings) {
        restoredData.settings = superjson.parse(backup.data.settings);
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, backup.data.settings);
    }
    if (backup.data.presets) {
        restoredData.presets = superjson.parse(backup.data.presets);
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, backup.data.presets);
    }
    if (backup.data.journal) {
        restoredData.journal = superjson.parse(backup.data.journal);
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, backup.data.journal);
    }

    if (!restoredData.settings || !restoredData.presets || !restoredData.journal) {
        return { success: false, message: 'Backup data is incomplete or corrupted.' };
    }

    return { success: true, message: 'Restore successful!', data: restoredData as RestoredData };

  } catch (error) {
    console.error('Failed to parse or restore backup file.', error);
    return { success: false, message: 'The selected file is not a valid backup file or is corrupted.' };
  }
}
