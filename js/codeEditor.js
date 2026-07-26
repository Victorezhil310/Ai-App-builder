/* ==========================================================================
   CODE EDITOR CONTROLLER
   Manages HTML, CSS, JS code tabs, editing, and copying
   ========================================================================== */

export class CodeEditorManager {
  constructor(containerId, onChangeCallback) {
    this.container = document.getElementById(containerId);
    this.onChangeCallback = onChangeCallback;
    this.activeTab = 'html';
    this.files = {
      html: '',
      css: '',
      js: ''
    };
    this.init();
  }

  init() {
    if (!this.container) return;
    this.textarea = this.container.querySelector('.code-textarea');
    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

    // Tab switcher
    this.container.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        this.switchTab(lang);
      });
    });

    // Real-time editor update
    if (this.textarea) {
      this.textarea.addEventListener('input', () => {
        this.files[this.activeTab] = this.textarea.value;
        if (this.onChangeCallback) {
          this.onChangeCallback(this.files);
        }
      });
    }

    // Copy Code Button
    const copyBtn = this.container.querySelector('#copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
  }

  setFiles(files) {
    this.files = {
      html: files['index.html'] || files.html || '',
      css: files['style.css'] || files.css || '',
      js: files['script.js'] || files.js || ''
    };
    this.switchTab(this.activeTab);
  }

  switchTab(lang) {
    this.activeTab = lang;
    
    // Update active tab buttons
    this.container.querySelectorAll('.code-tab').forEach(tab => {
      if (tab.dataset.lang === lang) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Load content into textarea
    if (this.textarea) {
      this.textarea.value = this.files[lang] || '';
    }
  }

  copyToClipboard() {
    const text = this.textarea ? this.textarea.value : '';
    navigator.clipboard.writeText(text).then(() => {
      if (window.toast) {
        window.toast.success(`Copied ${this.activeTab.toUpperCase()} code to clipboard!`);
      }
    });
  }
}
