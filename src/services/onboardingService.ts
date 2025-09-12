import { trackCustomEvent } from './trackingService';
import { browser } from '$app/environment';

const FIRST_INPUT_KEY = 'cachy-onboarding-first-input';
const FIRST_CALC_KEY = 'cachy-onboarding-first-calc';
const FIRST_SAVE_KEY = 'cachy-onboarding-first-save';

/**
 * A private helper function to track a one-time event using localStorage to prevent duplicates.
 * @param key The localStorage key to check and set.
 * @param category The category for the tracking event.
 * @param action The action for the tracking event.
 * @param name The name/label for the tracking event.
 */
function checkAndTrack(key: string, category: string, action: string, name: string) {
  if (!browser) return;

  try {
    if (!localStorage.getItem(key)) {
      trackCustomEvent(category, action, name);
      localStorage.setItem(key, 'true');
    }
  } catch (e) {
    console.warn(`Could not access localStorage for onboarding tracking: ${e}`);
  }
}

/**
 * A service to track key "first-time" user interactions for onboarding analytics.
 * It ensures that each onboarding event is tracked only once per user/browser.
 */
export const onboardingService = {
  /**
   * Tracks the user's very first input into any of the calculator fields.
   */
  trackFirstInput: () => {
    checkAndTrack(FIRST_INPUT_KEY, 'Onboarding', 'FirstInteraction', 'FirstInput');
  },
  /**
   * Tracks the user's first successful calculation.
   */
  trackFirstCalculation: () => {
    checkAndTrack(FIRST_CALC_KEY, 'Onboarding', 'FirstInteraction', 'FirstCalculation');
  },
  /**
   * Tracks the user's first time saving a trade to the journal.
   */
  trackFirstJournalSave: () => {
    checkAndTrack(FIRST_SAVE_KEY, 'Onboarding', 'FirstInteraction', 'FirstJournalSave');
  }
};
