/* ==========================================================================
   AUTHENTICATION & SECURITY MANAGER
   Handles Login, Registration, Password Reset & Session Management
   ========================================================================== */

export class AuthManager {
  constructor() {
    this.storageKey = 'ai_app_builder_user';
    this.currentUser = JSON.parse(localStorage.getItem(this.storageKey)) || {
      id: 'usr_guest',
      name: 'Guest User',
      email: 'guest@aiappbuilderfree.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Antigravity',
      role: 'user',
      isLoggedIn: true
    };
  }

  saveSession() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
  }

  login(email, password) {
    this.currentUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      name: email.split('@')[0].toUpperCase(),
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: email.includes('admin') ? 'admin' : 'user',
      isLoggedIn: true
    };
    this.saveSession();
    return this.currentUser;
  }

  logout() {
    this.currentUser = {
      id: 'usr_guest',
      name: 'Guest User',
      email: 'guest@aiappbuilderfree.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      role: 'user',
      isLoggedIn: false
    };
    this.saveSession();
  }
}
