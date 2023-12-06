export enum KINDS_OF_THEME {
  DARK = 'dark',
  LIGHT = 'light',
}

export class Theme {
  static changeTheme(theme: KINDS_OF_THEME): void {
    if (theme === KINDS_OF_THEME.DARK) {
      document.body.setAttribute('data-theme', KINDS_OF_THEME.DARK);
      localStorage.setItem('theme', KINDS_OF_THEME.DARK);
    } else if (theme === KINDS_OF_THEME.LIGHT) {
      document.body.setAttribute('data-theme', KINDS_OF_THEME.LIGHT);
      localStorage.setItem('theme', KINDS_OF_THEME.LIGHT);
    }

  }

  static getCurrentTheme(): string {
    const currentTheme: string | null = document.body.getAttribute('data-theme');
    if (currentTheme !== null) {
      return currentTheme;
    } else {
      return 'Нельзя получить текущую тему';
    }
  }

  static setThemeFromLocalStorage(): void {
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme) {
      if (storedTheme === KINDS_OF_THEME.LIGHT) {
        Theme.changeTheme(KINDS_OF_THEME.LIGHT);
      } else if (storedTheme === KINDS_OF_THEME.DARK) {
        Theme.changeTheme(KINDS_OF_THEME.DARK);
      }
    }
  }
}
