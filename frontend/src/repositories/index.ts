import { LocalStorageDatabase } from '../database/index';

/**
 * Repositório de preferências e cache de estado do cliente web
 */
export class UserPreferencesRepository {
  private static readonly PREF_KEY = 'vetcare_user_preferences';

  static getTheme(): 'light' | 'dark' {
    return LocalStorageDatabase.get<'light' | 'dark'>(this.PREF_KEY, 'light');
  }

  static setTheme(theme: 'light' | 'dark'): void {
    LocalStorageDatabase.set(this.PREF_KEY, theme);
  }
}
