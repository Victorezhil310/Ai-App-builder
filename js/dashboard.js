/* ==========================================================================
   USER DASHBOARD CONTROLLER
   Manages user projects, saved templates, deployments, settings & profile
   ========================================================================== */

export class UserDashboardManager {
  constructor() {
    this.projectsKey = 'ai_app_builder_projects';
    this.savedKey = 'ai_app_builder_saved';

    this.projects = JSON.parse(localStorage.getItem(this.projectsKey)) || [
      {
        id: 'proj_01',
        title: 'Modern Developer Portfolio',
        builderType: 'Portfolio',
        prompt: 'Create a modern developer portfolio with neon hero section and project showcase',
        createdAt: '2026-07-25',
        updatedAt: '2026-07-26',
        files: {
          'index.html': `<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>Alex Vance Portfolio</h1></body></html>`,
          'style.css': `body { background: #090d16; color: #fff; }`,
          'script.js': `console.log('Portfolio loaded');`
        }
      },
      {
        id: 'proj_02',
        title: 'Gourmet Bistro Restaurant',
        builderType: 'Restaurant',
        prompt: 'Build a luxury bistro website with table booking modal',
        createdAt: '2026-07-22',
        updatedAt: '2026-07-24',
        files: {
          'index.html': `<!DOCTYPE html><html><head><title>Bistro</title></head><body><h1>Gourmet Bistro</h1></body></html>`,
          'style.css': `body { background: #0f172a; color: #f8fafc; }`,
          'script.js': `console.log('Bistro loaded');`
        }
      }
    ];

    this.savedProjects = JSON.parse(localStorage.getItem(this.savedKey)) || [];
  }

  saveProjects() {
    localStorage.setItem(this.projectsKey, JSON.stringify(this.projects));
  }

  saveSaved() {
    localStorage.setItem(this.savedKey, JSON.stringify(this.savedProjects));
  }

  addProject(project) {
    this.projects.unshift(project);
    this.saveProjects();
  }

  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.saveProjects();
  }

  getProject(id) {
    return this.projects.find(p => p.id === id);
  }

  toggleSaveTemplate(templateId) {
    if (this.savedProjects.includes(templateId)) {
      this.savedProjects = this.savedProjects.filter(id => id !== templateId);
    } else {
      this.savedProjects.push(templateId);
    }
    this.saveSaved();
  }
}
