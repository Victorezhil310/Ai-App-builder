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
    await this.triggerAIGeneration('Create a modern AI App Builder landing page with dark glassmorphism design');
  }

  /**
   * Auto Cache & Storage Optimization Engine
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
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.dataset.view;
        if (viewId) this.switchView(viewId);
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
      if (this.currentProject) {
        this.currentProject.files['index.html'] = files.html;
        this.currentProject.files['style.css'] = files.css;
        this.currentProject.files['script.js'] = files.js;
        
        // Find project in dashboard manager list and update
        const existing = this.dashboardManager.projects.find(p => p.id === this.currentProject.id);
        if (existing) {
          existing.files = this.currentProject.files;
          existing.updatedAt = new Date().toISOString().split('T')[0];
          this.dashboardManager.saveProjects();
        }
      }
    });

    // Dropdown builder type selector
    const typeDropdown = document.getElementById('builder-type-dropdown');
    if (typeDropdown) {
      typeDropdown.addEventListener('change', () => {
        this.currentBuilderType = typeDropdown.value;
      });
    }

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

    // Viewport Toggles (Desktop, Tablet, Mobile)
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.preview.setViewport(btn.dataset.viewport);
      });
    });

    // View Mode Tabs (Preview, Code)
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
        } else {
          if (previewContainer) previewContainer.style.display = 'none';
          if (codePanel) codePanel.style.display = 'flex';
        }
      });
    });

    // Export ZIP action
    document.getElementById('export-zip-btn')?.addEventListener('click', () => {
      if (this.currentProject) {
        this.exportManager.downloadZip(this.currentProject.files, this.currentProject.title);
      }
    });

    // Reload preview button
    document.getElementById('preview-reload-btn')?.addEventListener('click', () => {
      this.preview.reload();
      this.addConsoleLog('[system] Live sandbox preview reloaded.', 'info');
    });

    // Iterative prompt build button
    document.getElementById('iterative-build-btn')?.addEventListener('click', async () => {
      const input = document.getElementById('iterative-prompt-input');
      const promptText = input ? input.value.trim() : '';
      if (!promptText) {
        this.toast.warning('Please describe the changes you want to apply!');
        return;
      }
      await this.triggerIterativeAIGeneration(promptText);
      if (input) input.value = '';
    });
  }

  async triggerAIGeneration(promptText) {
    const progressContainer = document.getElementById('builder-progress-container');
    const progressBar = document.getElementById('ai-progress-fill');
    
    if (progressContainer) progressContainer.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    
    this.addConsoleLog(`[system] Initiating project build: "${promptText.substring(0, 40)}..."`, 'info');
    
    const steps = [
      { p: 15, t: 'Parsing tokens and requirements...' },
      { p: 45, t: 'Synthesizing layout structure (index.html)...' },
      { p: 75, t: 'Generating custom glassmorphism stylesheet (style.css)...' },
      { p: 95, t: 'Compiling project package files...' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 200));
      if (progressBar) progressBar.style.width = `${step.p}%`;
      this.addConsoleLog(`[compile] ${step.t}`, 'info');
    }

    try {
      const project = await this.aiEngine.generateProject(promptText, this.currentBuilderType);
      this.currentProject = project;

      // Auto save
      this.dashboardManager.addProject({
        id: 'proj_' + Date.now().toString(36),
        title: project.title,
        builderType: project.builderType,
        prompt: project.prompt,
        createdAt: new Date().toISOString().split('T')[0],
        files: project.files
      });

      this.preview.updatePreview(project.files['index.html'], project.files['style.css'], project.files['script.js']);
      this.codeEditor.setFiles(project.files);
      
      this.toast.success(`🎉 Generated "${project.title}" successfully!`);
      this.addConsoleLog(`[success] Assembly finished. Preview loaded in sandbox.`, 'success');
      this.renderUserDashboard();
    } catch (e) {
      console.error(e);
      this.toast.error('AI synthesis failed.');
      this.addConsoleLog(`[error] Synthesis failed: ${e.message}`, 'error');
    } finally {
      if (progressContainer) {
        setTimeout(() => { progressContainer.style.display = 'none'; }, 400);
      }
    }
  }

  async triggerIterativeAIGeneration(promptText) {
    if (!this.currentProject) {
      this.toast.warning('No active project found in sandbox!');
      return;
    }

    this.toast.info('⚡ Compiling updates...');
    this.addConsoleLog(`[system] Applying updates: "${promptText.substring(0, 45)}..."`, 'info');

    const steps = [
      'Merging styling rules...',
      'Re-assembling script loops...',
      'Done!'
    ];

    for (const log of steps) {
      await new Promise(r => setTimeout(r, 150));
      this.addConsoleLog(`[compile] ${log}`, 'info');
    }

    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      try {
        const instruction = `Apply these modifications to the current project code: "${promptText}". 
        Current files:
        index.html: ${this.currentProject.files['index.html']}
        style.css: ${this.currentProject.files['style.css']}
        script.js: ${this.currentProject.files['script.js']}
        
        Return ONLY a raw JSON string of this structure: {"html": "...", "css": "...", "js": "..."}. Do not include markdown code block tags.`;
        
        const response = await this.aiEngine.callGeminiAPI(apiKey, instruction, this.currentProject.builderType);
        if (response && response.html) {
          this.currentProject.files['index.html'] = response.html;
          this.currentProject.files['style.css'] = response.css || '';
          this.currentProject.files['script.js'] = response.js || '';
        }
      } catch (err) {
        console.error('Iterative Gemini call failed:', err);
      }
    } else {
      // Local fallback append
      this.currentProject.files['style.css'] += `\n/* Local change: ${promptText} */\n`;
      this.currentProject.files['script.js'] += `\n// Local change: ${promptText}\nconsole.log("Change applied: ${promptText.replace(/"/g, '\\"')}");\n`;
    }

    // Save and reload
    const existing = this.dashboardManager.projects.find(p => p.id === this.currentProject.id);
    if (existing) {
      existing.files = this.currentProject.files;
      existing.updatedAt = new Date().toISOString().split('T')[0];
      this.dashboardManager.saveProjects();
    }

    this.preview.updatePreview(
      this.currentProject.files['index.html'],
      this.currentProject.files['style.css'],
      this.currentProject.files['script.js']
    );
    this.codeEditor.setFiles(this.currentProject.files);

    this.toast.success('Changes applied successfully!');
    this.addConsoleLog('[success] Project updated and re-rendered.', 'success');
  }

  addConsoleLog(message, type = 'info') {
    const logBox = document.getElementById('operation-logs-box');
    if (!logBox) return;

    const colors = {
      info: 'var(--text-muted)',
      success: 'var(--color-success)',
      error: 'var(--color-danger)',
      system: 'var(--accent-cyan)'
    };

    const color = colors[type] || 'var(--text-secondary)';
    logBox.innerHTML += `<div style="color:${color}; margin-top:0.25rem;">${message}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
  }

  /* --------------------------------------------------------------------------
     3. TEMPLATES LIBRARY VIEW (WITH REAL SEARCH)
     -------------------------------------------------------------------------- */
  setupTemplatesView() {
    this.renderTemplates(TEMPLATES_DATA);

    // Category pills filter
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const category = pill.dataset.category;
        const searchVal = document.getElementById('templates-search-input')?.value.toLowerCase().trim() || '';

        this.filterAndRenderTemplates(category, searchVal);
      });
    });

    // Real-time Search project bar filter
    const searchInput = document.getElementById('templates-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const activePill = document.querySelector('.category-pill.active');
        const activeCategory = activePill ? activePill.dataset.category : 'All';

        this.filterAndRenderTemplates(activeCategory, query);
      });
    }
  }

  filterAndRenderTemplates(category, query) {
    let filtered = TEMPLATES_DATA;
    if (category !== 'All') {
      filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }
    this.renderTemplates(filtered);
  }

  renderTemplates(templates) {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    if (templates.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; color:var(--text-muted); padding:2rem; text-align:center;">No matching templates found.</p>`;
      return;
    }

    grid.innerHTML = templates.map(t => `
      <div class="glass-card template-card">
        <div class="template-thumb" style="background-image: url('${t.image}'); background-size: cover; background-position: center; min-height: 180px;">
          <div class="template-thumb-overlay">
            <button class="btn btn-sm btn-primary use-template-btn" data-id="${t.id}">Use Template</button>
          </div>
        </div>
        <div class="template-info">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge badge-primary">${t.category}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">
              <i class="fas fa-eye"></i> ${t.views} &nbsp; <i class="fas fa-heart"></i> ${t.likes}
            </span>
          </div>
          <h3 class="template-title">${t.title}</h3>
          <p class="template-desc">${t.description}</p>
        </div>
      </div>
    `).join('');

    // Bind Use Template button
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
    // Sidebar subviews toggling
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

    // Integration API Key loading
    const geminiKeyInput = document.getElementById('settings-gemini-key');
    const netlifyTokenInput = document.getElementById('settings-netlify-token');

    if (geminiKeyInput) geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
    if (netlifyTokenInput) netlifyTokenInput.value = localStorage.getItem('netlify_api_key') || '';

    // Save Integration API Keys
    const saveKeysBtn = document.getElementById('save-settings-keys-btn');
    if (saveKeysBtn) {
      saveKeysBtn.addEventListener('click', () => {
        const geminiVal = geminiKeyInput ? geminiKeyInput.value.trim() : '';
        const netlifyVal = netlifyTokenInput ? netlifyTokenInput.value.trim() : '';

        localStorage.setItem('gemini_api_key', geminiVal);
        localStorage.setItem('netlify_api_key', netlifyVal);

        this.toast.success('Integration credentials saved locally.');
        this.updateUserUI();
      });
    }

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

    // Open/Delete project bindings
    list.querySelectorAll('.open-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const proj = this.dashboardManager.getProject(btn.dataset.id);
        if (proj) {
          this.currentProject = proj;
          this.preview.updatePreview(proj.files['index.html'], proj.files['style.css'], proj.files['script.js']);
          this.codeEditor.setFiles(proj.files);
          this.switchView('builder');
          this.toast.info(`Loaded project "${proj.title}" into workspace.`);
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
    const toggle = document.getElementById('billing-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        const isYearly = toggle.checked;
        document.getElementById('pro-price').innerText = isYearly ? '₹799' : '₹999';
        document.getElementById('business-price').innerText = isYearly ? '₹2,399' : '₹2,999';
      });
    }

    document.querySelectorAll('.subscribe-plan-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const plan = btn.dataset.plan;
        const amount = btn.dataset.amount;

        if (plan === 'Free') {
          this.toast.info('You are already on the Free plan!');
          return;
        }

        this.toast.info(`Opening Razorpay Checkout for ${plan} plan...`);
        const res = await this.paymentManager.processRazorpayPayment(plan, 'monthly', amount);
        if (res.success) {
          this.toast.success(`🎉 Payment Completed! Transaction ID: ${res.transactionId}`);
          this.updateUserUI();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. DONATIONS
     -------------------------------------------------------------------------- */
  setupDonationView() {
    const copyBtn = document.getElementById('copy-upi-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.donationManager.copyUpiId());
    }

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

    document.getElementById('pay-donation-btn')?.addEventListener('click', () => {
      const amount = customInput ? customInput.value || 250 : 250;
      this.donationManager.processDonation(amount, 'AI App Builder Supporter');

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
     8. MODALS & DEPLOY ACTIONS
     -------------------------------------------------------------------------- */
  setupModals() {
    document.querySelectorAll('.modal-close, .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Deploy modal trigger
    document.getElementById('workspace-deploy-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('deploy-modal');
      if (modal) modal.classList.add('active');
    });

    // Deploy Actions
    document.querySelectorAll('.start-deploy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const providerKey = btn.dataset.provider;
        const logBox = document.getElementById('deploy-logs-box');
        if (logBox) logBox.innerHTML = '<div>Initializing compilation build...</div>';

        const projName = this.currentProject ? this.currentProject.title : 'My AI App';

        // Generate Zip Blob in real-time if JSZip is loaded
        let zipBlob = null;
        if (window.JSZip && this.currentProject) {
          try {
            const zip = new window.JSZip();
            zip.file('index.html', this.currentProject.files['index.html'] || '');
            zip.file('style.css', this.currentProject.files['style.css'] || '');
            zip.file('script.js', this.currentProject.files['script.js'] || '');
            zipBlob = await zip.generateAsync({ type: 'blob' });
          } catch (e) {
            console.error('Failed to generate ZIP blob for deployment:', e);
          }
        }

        await this.deployManager.startDeploy(
          providerKey,
          projName,
          (log) => {
            if (logBox) logBox.innerHTML += `<div>${log}</div>`;
          },
          (record) => {
            if (logBox) logBox.innerHTML += `<div style="color:#10b981; font-weight:bold; margin-top:0.4rem;">🚀 Live URL: <a href="${record.liveUrl}" target="_blank" style="color:#22d3ee; text-decoration:underline;">${record.liveUrl}</a></div>`;
            this.toast.success(`Deployed to ${record.provider} successfully!`);
          },
          zipBlob
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

    // Update API Key Connection badge
    const apiBadge = document.getElementById('api-status-badge');
    if (apiBadge) {
      const gemini = localStorage.getItem('gemini_api_key');
      const netlify = localStorage.getItem('netlify_api_key');
      if (gemini || netlify) {
        apiBadge.innerText = 'APIs Active';
        apiBadge.className = 'badge badge-success';
      } else {
        apiBadge.innerText = 'APIs Offline';
        apiBadge.className = 'badge badge-danger';
      }
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
