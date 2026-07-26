/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

export class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    const icons = {
      success: '<i class="fas fa-check-circle" style="color: #10b981;"></i>',
      error: '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>',
      warning: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>',
      info: '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg" style="flex:1; font-weight: 500; font-size: 0.9rem;">${message}</span>
      <button class="toast-close" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  dismiss(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error'); }
  warning(msg) { this.show(msg, 'warning'); }
  info(msg) { this.show(msg, 'info'); }
}
