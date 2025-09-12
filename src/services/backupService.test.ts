import { describe, it, expect, beforeEach, vi } from 'vitest';
import { restoreFromBackup } from './backupService';
import { CONSTANTS } from '../lib/constants';
import superjson from '../lib/superjson';
import * as journalStoreModule from '../stores/journalStore';
import * as presetStoreModule from '../stores/presetStore';
import { Decimal } from 'decimal.js';

// Mock the SvelteKit environment module
vi.mock('$app/environment', () => ({
  browser: true,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock for createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', { value: vi.fn() });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: vi.fn() });


describe('backupService', () => {

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('restoreFromBackup', () => {
    it('should successfully restore a valid backup file and update stores', () => {
        const journalSetSpy = vi.spyOn(journalStoreModule.journalStore, 'set');
        const presetUpdateSpy = vi.spyOn(presetStoreModule, 'updatePresetStore');

        const mockJournal = [{ id: 1, symbol: 'BTCUSDT', entryPrice: new Decimal(50000) }];
        const mockPresets = { myPreset: { symbol: 'ETHUSDT' } };
        const mockSettings = { theme: 'dark' };

        const backupContent = superjson.stringify({
            backupVersion: 2,
            appName: 'R-Calculator',
            data: {
              settings: mockSettings,
              presets: mockPresets,
              journal: mockJournal,
            },
        });

      const result = restoreFromBackup(backupContent);

      expect(result.success).toBe(true);
      expect(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY)).toBe(JSON.stringify(mockSettings));
      expect(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY)).toBe(JSON.stringify(mockPresets));

      expect(journalSetSpy).toHaveBeenCalledWith(mockJournal);
      expect(presetUpdateSpy).toHaveBeenCalled();
    });

    it('should fail if the JSON is invalid', () => {
      const result = restoreFromBackup('not a json');
      expect(result.success).toBe(false);
      expect(result.message).toContain('valid backup file');
    });

    it('should fail if the app name is incorrect', () => {
      const backupContent = superjson.stringify({
        backupVersion: 2,
        appName: 'WrongApp',
        data: {},
      });
      const result = restoreFromBackup(backupContent);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not for this application');
    });

    it('should fail if the backup version is unsupported', () => {
        const backupContent = superjson.stringify({
            backupVersion: 99,
            appName: 'R-Calculator',
            data: {},
        });
        const result = restoreFromBackup(backupContent);
        expect(result.success).toBe(false);
        expect(result.message).toContain('Unsupported backup version');
    });

    it('should fail if the data object is missing', () => {
        const backupContent = superjson.stringify({
            backupVersion: 2,
            appName: 'R-Calculator',
        });
        const result = restoreFromBackup(backupContent);
        expect(result.success).toBe(false);
        expect(result.message).toContain('Missing data');
    });

    it('should handle missing non-critical data gracefully', () => {
        const journalSetSpy = vi.spyOn(journalStoreModule.journalStore, 'set');
        const mockSettings = { theme: 'light' };
        const backupContent = superjson.stringify({
            backupVersion: 2,
            appName: 'R-Calculator',
            data: {
              settings: mockSettings,
              presets: null,
              journal: null,
            },
        });

        const result = restoreFromBackup(backupContent);
        expect(result.success).toBe(true);
        expect(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY)).toBe(JSON.stringify(mockSettings));
        expect(journalSetSpy).not.toHaveBeenCalled();
    });
  });
});
