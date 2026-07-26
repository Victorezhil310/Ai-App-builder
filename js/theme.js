/* ==========================================================================
   THEME MANAGER (DARK / LIGHT MODE)
   ========================================================================== */

export class ThemeManager {
  constructor() {
    this.storageKey = 'ai_app_builder_theme';
    this.currentTheme = localStorage.getItem(this.storageKey) || 'dark';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    
    // Bind toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTheme());
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);

    // Update button icons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? '<i class="fas fa-sun" title="Switch to Light Theme"></i>' 
        : '<i class="fas fa-moon" title="Switch to Dark Theme"></i>';
    });
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }
}
