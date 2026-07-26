/* ==========================================================================
   EXPORT & DOWNLOAD MANAGER (HTML, CSS, JS, ZIP)
   ========================================================================== */

export class ExportManager {
  /**
   * Single file download helper
   */
  downloadFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.toast) {
      window.toast.success(`Downloaded ${filename} successfully!`);
    }
  }

  downloadHTML(htmlContent, projectName = 'index') {
    this.downloadFile(`${this.sanitizeName(projectName)}.html`, htmlContent, 'text/html');
  }

  downloadCSS(cssContent, projectName = 'style') {
    this.downloadFile(`${this.sanitizeName(projectName)}.css`, cssContent, 'text/css');
  }

  downloadJS(jsContent, projectName = 'script') {
    this.downloadFile(`${this.sanitizeName(projectName)}.js`, jsContent, 'text/javascript');
  }

  /**
   * ZIP Package Exporter using JSZip or Blob
   */
  async downloadZip(files, projectName = 'ai-app-project') {
    const safeName = this.sanitizeName(projectName);

    if (window.JSZip) {
      const zip = new window.JSZip();
      
      // Add HTML, CSS, JS to zip structure
      zip.file('index.html', files['index.html'] || files.html || '');
      zip.file('style.css', files['style.css'] || files.css || '');
      zip.file('script.js', files['script.js'] || files.js || '');
      
      // Add README.md file
      zip.file('README.md', `# ${projectName}\n\nGenerated with AI App Builder Free.\n\n## How to run locally\n1. Open \`index.html\` in any web browser.\n2. Or use live server: \`npx serve\`\n`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.toast) {
        window.toast.success(`Generated and downloaded ${safeName}.zip package!`);
      }
    } else {
      // Fallback if JSZip CDN isn't loaded: download full bundled HTML file
      let bundled = files['index.html'] || '';
      bundled = bundled.replace('</head>', `<style>\n${files['style.css'] || ''}\n</style>\n</head>`);
      bundled = bundled.replace('</body>', `<script>\n${files['script.js'] || ''}\n</script>\n</body>`);
      this.downloadFile(`${safeName}-bundle.html`, bundled, 'text/html');
    }
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  }
}
