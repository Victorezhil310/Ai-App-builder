/* ==========================================================================
   MAIN APPLICATION CONTROLLER (SPA ROUTER & EVENT BINDINGS)
   ========================================================================== */

import { ThemeManager } from './theme.js';
import { ToastManager } from './toast.js';
import { TEMPLATES_DATA } from './templates.js';
import { AIEngine } from './aiEngine.js';
import { PreviewManager } from './preview.js';
import { CodeEditorManager } from './codeEditor.js';
import { ExportManager } from './export.js';
import { DeployManager } from './deploy.js';
import { PaymentManager } from './payment.js';
import { DonationManager } from './donation.js';
import { UserDashboardManager } from './dashboard.js';
import { AdminDashboardManager } from './admin.js';
import { AuthManager } from './auth.js';

class AppController {
  constructor() {
    this.theme = new ThemeManager();
    this.toast = new ToastManager();
    window.toast = this.toast;

    this.aiEngine = new AIEngine();
    this.exportManager = new ExportManager();
    this.deployManager = new DeployManager();
    this.paymentManager = new PaymentManager();
    this.donationManager = new DonationManager();
    this.dashboardManager = new UserDashboardManager();
    this.adminManager = new AdminDashboardManager();
    this.authManager = new AuthManager();

    this.currentProject = null;
    this.currentBuilderType = 'App';

    this.init();
  }

  async init() {
    this.autoCleanCache();
    this.setupNavigation();
    this.setupBuilderView();
    this.setupTemplatesView();
    this.setupDashboardView();
    this.setupAdminView();
    this.setupPricingView();
    this.setupDonationView();
    this.setupModals();
    this.updateUserUI();

    // Initial default generation so AI Builder isn't blank
    await this.triggerAIGeneration('Create a modern AI App Builder Free landing page with dark glassmorphism design');
  }

  /**
   * Auto Cache & Storage Optimization Engine
   * Removes stale temporary files & ensures zero lag
   */
  autoCleanCache() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      keys.forEach(k => {
        if (k.startsWith('ai_temp_cache_')) {
          const item = JSON.parse(localStorage.getItem(k));
          if (item && item.expiry && item.expiry < now) {
            localStorage.removeItem(k);
          }
        }
      });
      console.log('⚡ Cache auto-cleanup completed successfully.');
    } catch (e) {
      console.warn('Cache cleanup non-critical warning:', e);
    }
  }

  /* --------------------------------------------------------------------------
     1. SPA NAVIGATION & ROUTING
     -------------------------------------------------------------------------- */
  setupNavigation() {
    document.querySelectorAll('.nav-link[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.dataset.view;
        this.switchView(viewId);
      });
    });
  }

  switchView(viewId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Deactivate header links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Activate target section & link
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* --------------------------------------------------------------------------
     2. AI BUILDER WORKSPACE
     -------------------------------------------------------------------------- */
  setupBuilderView() {
    this.preview = new PreviewManager('live-preview-iframe');
    this.codeEditor = new CodeEditorManager('code-editor-panel', (files) => {
      // Realtime live update on code edit
      this.preview.updatePreview(files.html, files.css, files.js);
    });

    // Builder Type Selector buttons
    document.querySelectorAll('.builder-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.builder-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentBuilderType = btn.dataset.type;
      });
    });

    // Prompt Submit Form
    const generateBtn = document.getElementById('generate-ai-btn');
    const promptInput = document.getElementById('prompt-input');

    const handleGenerate = async () => {
      const promptText = promptInput ? promptInput.value.trim() : '';
      if (!promptText) {
        this.toast.warning('Please enter a description for your app or website!');
        return;
      }
      await this.triggerAIGeneration(promptText);
    };

    if (generateBtn) generateBtn.addEventListener('click', handleGenerate);

    // Enter Key Handler on prompt input (Shift+Enter for new line, Enter to generate)
    if (promptInput) {
      promptInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          await handleGenerate();
        }
      });
    }

    // Suggested Chips
    document.querySelectorAll('.suggested-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (promptInput) {
          promptInput.value = chip.dataset.prompt || chip.innerText;
        }
      });
    });

    // Viewport Toggles (Desktop, Tablet, Mobile)
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.preview.setViewport(btn.dataset.viewport);
      });
    });

    // View Mode Tabs (Split, Preview, Code)
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        
        const previewContainer = document.querySelector('.preview-container');
        const codePanel = document.getElementById('code-editor-panel');

        if (mode === 'preview') {
          if (previewContainer) previewContainer.style.display = 'flex';
          if (codePanel) codePanel.style.display = 'none';
        } else if (mode === 'code') {
          if (previewContainer) previewContainer.style.display = 'none';
          if (codePanel) codePanel.style.display = 'flex';
        } else {
          if (previewContainer) previewContainer.style.display = 'flex';
          if (codePanel) codePanel.style.display = 'flex';
        }
      });
    });

    // Export Dropdown actions
    document.getElementById('export-zip-btn')?.addEventListener('click', () => {
      if (this.currentProject) {
        this.exportManager.downloadZip(this.currentProject.files, this.currentProject.title);
      }
    });

    document.getElementById('export-html-btn')?.addEventListener('click', () => {
      if (this.currentProject) {
        this.exportManager.downloadHTML(this.currentProject.files['index.html'], this.currentProject.title);
      }
    });

    document.getElementById('export-css-btn')?.addEventListener('click', () => {
      if (this.currentProject) {
        this.exportManager.downloadCSS(this.currentProject.files['style.css'], this.currentProject.title);
      }
    });

    document.getElementById('export-js-btn')?.addEventListener('click', () => {
      if (this.currentProject) {
        this.exportManager.downloadJS(this.currentProject.files['script.js'], this.currentProject.title);
      }
    });
  }

  async triggerAIGeneration(promptText) {
    this.toast.info('⚡ AI Synthesis Engine started... Generating code...');
    const progressFill = document.getElementById('ai-progress-fill');
    if (progressFill) progressFill.style.width = '20%';

    setTimeout(() => { if (progressFill) progressFill.style.width = '60%'; }, 250);

    const project = await this.aiEngine.generateProject(promptText, this.currentBuilderType);
    this.currentProject = project;

    // Auto Save to user projects
    this.dashboardManager.addProject({
      id: 'proj_' + Date.now().toString(36),
      title: project.title,
      builderType: project.builderType,
      prompt: project.prompt,
      createdAt: new Date().toISOString().split('T')[0],
      files: project.files
    });

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
      this.preview.updatePreview(project.files['index.html'], project.files['style.css'], project.files['script.js']);
      this.codeEditor.setFiles(project.files);
      
      this.toast.success(`🎉 Generated & Auto-Saved "${project.title}" successfully!`);
      setTimeout(() => { if (progressFill) progressFill.style.width = '0%'; }, 500);
      this.renderUserDashboard();
    }, 450);
  }

  /* --------------------------------------------------------------------------
     3. TEMPLATES LIBRARY VIEW
     -------------------------------------------------------------------------- */
  setupTemplatesView() {
    this.renderTemplates(TEMPLATES_DATA);

    // Category filter pills
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const category = pill.dataset.category;
        if (category === 'All') {
          this.renderTemplates(TEMPLATES_DATA);
        } else {
          const filtered = TEMPLATES_DATA.filter(t => t.category.toLowerCase() === category.toLowerCase());
          this.renderTemplates(filtered);
        }
      });
    });
  }

  renderTemplates(templates) {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    grid.innerHTML = templates.map(t => `
      <div class="glass-card template-card">
        <div class="template-thumb" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(236, 72, 153, 0.4)), url('https://picsum.photos/seed/${t.id}/400/220'); background-size:cover;">
          <div class="template-thumb-overlay">
            <button class="btn btn-sm btn-primary use-template-btn" data-id="${t.id}">Use Template</button>
          </div>
        </div>
        <div class="template-info">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge badge-primary">${t.category}</span>
          </div>
          <h3 class="template-title">${t.title}</h3>
          <p class="template-desc">${t.description}</p>
        </div>
      </div>
    `).join('');

    // Attach "Use Template" action
    grid.querySelectorAll('.use-template-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const tmpl = TEMPLATES_DATA.find(t => t.id === id);
        if (tmpl) {
          const promptInput = document.getElementById('prompt-input');
          if (promptInput) promptInput.value = tmpl.prompt;
          this.switchView('builder');
          await this.triggerAIGeneration(tmpl.prompt);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. USER DASHBOARD
     -------------------------------------------------------------------------- */
  setupDashboardView() {
    // Sidebar tabs navigation inside user dashboard
    document.querySelectorAll('.dash-sidebar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dash-sidebar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const subview = tab.dataset.subview;
        document.querySelectorAll('.dash-subview').forEach(sub => sub.style.display = 'none');
        const target = document.getElementById(`dash-subview-${subview}`);
        if (target) target.style.display = 'block';
      });
    });

    this.renderUserDashboard();
  }

  renderUserDashboard() {
    const list = document.getElementById('user-projects-list');
    if (!list) return;

    const projects = this.dashboardManager.projects;
    if (projects.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); padding: 1.5rem;">No projects built yet. Start building with AI!</p>`;
      return;
    }

    list.innerHTML = projects.map(p => `
      <div class="glass-card" style="padding: 1.25rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-info">${p.builderType}</span>
          <h4 style="margin: 0.4rem 0;">${p.title}</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">${p.prompt}</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-sm btn-secondary open-project-btn" data-id="${p.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-sm btn-outline delete-project-btn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');

    // Bind edit / delete
    list.querySelectorAll('.open-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const proj = this.dashboardManager.getProject(btn.dataset.id);
        if (proj) {
          this.currentProject = proj;
          this.preview.updatePreview(proj.files['index.html'], proj.files['style.css'], proj.files['script.js']);
          this.codeEditor.setFiles(proj.files);
          this.switchView('builder');
          this.toast.info(`Loaded project "${proj.title}" into AI Builder.`);
        }
      });
    });

    list.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dashboardManager.deleteProject(btn.dataset.id);
        this.renderUserDashboard();
        this.toast.success('Project deleted.');
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. ADMIN DASHBOARD
     -------------------------------------------------------------------------- */
  setupAdminView() {
    this.renderAdminStats();
    this.renderAdminUsers();
  }

  renderAdminStats() {
    const stats = this.adminManager.stats;
    const totalUsersEl = document.getElementById('stat-total-users');
    const activeUsersEl = document.getElementById('stat-active-users');
    const totalProjectsEl = document.getElementById('stat-total-projects');
    const revenueEl = document.getElementById('stat-revenue');

    if (totalUsersEl) totalUsersEl.innerText = stats.totalUsers.toLocaleString();
    if (activeUsersEl) activeUsersEl.innerText = stats.activeUsers.toLocaleString();
    if (totalProjectsEl) totalProjectsEl.innerText = stats.totalProjects.toLocaleString();
    if (revenueEl) revenueEl.innerText = `₹${stats.monthlyRevenue.toLocaleString()}`;
  }

  renderAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.adminManager.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong><br><small style="color:var(--text-muted);">${u.email}</small></td>
        <td><span class="badge ${u.plan === 'Business' ? 'badge-primary' : u.plan === 'Pro' ? 'badge-info' : 'badge-secondary'}">${u.plan}</span></td>
        <td>${u.projects}</td>
        <td><span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
        <td>${u.joined}</td>
        <td>
          <button class="btn btn-sm btn-secondary toggle-user-btn" data-id="${u.id}">
            ${u.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.toggle-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.adminManager.toggleUserStatus(btn.dataset.id);
        this.renderAdminUsers();
        this.toast.info('User status updated.');
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. PRICING & RAZORPAY PAYMENT
     -------------------------------------------------------------------------- */
  setupPricingView() {
    // Billing Cycle toggle (Monthly / Yearly)
    const toggle = document.getElementById('billing-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        const isYearly = toggle.checked;
        document.getElementById('pro-price').innerText = isYearly ? '₹799' : '₹999';
        document.getElementById('business-price').innerText = isYearly ? '₹2,399' : '₹2,999';
      });
    }

    // Subscribe Buttons
    document.querySelectorAll('.subscribe-plan-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const plan = btn.dataset.plan;
        const amount = btn.dataset.amount;
        
        if (plan === 'Free') {
          this.toast.info('You are currently on the Free plan!');
          return;
        }

        this.toast.info(`Opening Razorpay Checkout for ${plan} Plan...`);
        const res = await this.paymentManager.processRazorpayPayment(plan, 'monthly', amount);
        if (res.success) {
          this.toast.success(`🎉 Payment Successful! Transaction: ${res.transactionId}`);
          this.updateUserUI();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. DONATIONS SECTION (UPI ID: arasu9629hf@okhdfcbank)
     -------------------------------------------------------------------------- */
  setupDonationView() {
    const copyBtn = document.getElementById('copy-upi-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.donationManager.copyUpiId());
    }

    // Preset donation amount buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const amount = btn.dataset.amount;
        const customInput = document.getElementById('custom-donation-input');
        if (customInput) customInput.value = amount;
        
        this.updateQrCode(amount);
      });
    });

    const customInput = document.getElementById('custom-donation-input');
    if (customInput) {
      customInput.addEventListener('input', () => {
        this.updateQrCode(customInput.value || 100);
      });
    }

    // Donate Submit Button
    document.getElementById('pay-donation-btn')?.addEventListener('click', () => {
      const amount = customInput ? customInput.value || 250 : 250;
      this.donationManager.processDonation(amount, 'Support Developer');

      // Show Thank You Modal
      const modal = document.getElementById('thank-you-modal');
      if (modal) modal.classList.add('active');
    });
  }

  updateQrCode(amount) {
    const qrImg = document.getElementById('upi-qr-img');
    if (qrImg) {
      qrImg.src = this.donationManager.getUpiQrUrl(amount);
    }
  }

  /* --------------------------------------------------------------------------
     8. MODALS CONTROLLER
     -------------------------------------------------------------------------- */
  setupModals() {
    document.querySelectorAll('.modal-close, .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Deploy Modal Trigger
    document.getElementById('open-deploy-modal-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('deploy-modal');
      if (modal) modal.classList.add('active');
    });

    // Deploy Actions
    document.querySelectorAll('.start-deploy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const providerKey = btn.dataset.provider;
        const logBox = document.getElementById('deploy-logs-box');
        if (logBox) logBox.innerHTML = '<div>Starting build...</div>';

        const projName = this.currentProject ? this.currentProject.title : 'My AI App';
        
        await this.deployManager.startDeploy(
          providerKey,
          projName,
          (log) => {
            if (logBox) logBox.innerHTML += `<div>${log}</div>`;
          },
          (record) => {
            if (logBox) logBox.innerHTML += `<div style="color:#10b981; font-weight:bold;">🚀 Live URL: <a href="${record.liveUrl}" target="_blank" style="color:#22d3ee;">${record.liveUrl}</a></div>`;
            this.toast.success(`Successfully deployed to ${record.provider}!`);
          }
        );
      });
    });
  }

  updateUserUI() {
    const sub = this.paymentManager.subscription;
    const badge = document.getElementById('user-plan-badge');
    if (badge) {
      badge.innerText = `${sub.plan} Plan`;
      badge.className = `badge ${sub.plan === 'Pro' ? 'badge-info' : sub.plan === 'Business' ? 'badge-primary' : 'badge-secondary'}`;
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
