import { LocalStorageDatabase } from '../database/index';

export const USER_PREFERENCES_STORAGE_KEY = 'vetcare_user_preferences';

/**
 * Repositório de preferências e cache de estado do cliente web
 */
export class UserPreferencesRepository {
  private static readonly PREF_KEY = USER_PREFERENCES_STORAGE_KEY;

  static getTheme(): 'light' | 'dark' {
    const theme = LocalStorageDatabase.get<unknown>(this.PREF_KEY, 'light');
    return theme === 'dark' ? 'dark' : 'light';
  }

  static setTheme(theme: 'light' | 'dark'): void {
    LocalStorageDatabase.set(this.PREF_KEY, theme);
  }
}
