/* ==========================================================================
   LIVE PREVIEW CONTROLLER (SANDBOX IFRAME & VIEWPORT SWITCHER)
   ========================================================================== */

export class PreviewManager {
  constructor(iframeElementId) {
    this.iframe = document.getElementById(iframeElementId);
    this.currentViewport = 'desktop';
  }

  /**
   * Render raw HTML, CSS, and JS into iframe using Blob URL or srcdoc
   */
  updatePreview(html, css, js) {
    if (!this.iframe) return;

    // Inject CSS and JS into HTML
    let fullHTML = html;
    if (css && !fullHTML.includes(css)) {
      fullHTML = fullHTML.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    }
    if (js && !fullHTML.includes(js)) {
      fullHTML = fullHTML.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    }

    // Use srcdoc for instant safe rendering
    this.iframe.srcdoc = fullHTML;
  }

  setViewport(viewportMode) {
    if (!this.iframe) return;

    this.currentViewport = viewportMode;
    this.iframe.className = `preview-iframe viewport-${viewportMode}`;

    // Highlight active viewport button
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      if (btn.dataset.viewport === viewportMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  reload() {
    if (this.iframe && this.iframe.srcdoc) {
      const temp = this.iframe.srcdoc;
      this.iframe.srcdoc = '';
      setTimeout(() => { this.iframe.srcdoc = temp; }, 100);
    }
  }
}
