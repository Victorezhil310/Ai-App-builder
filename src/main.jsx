import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Check if rendering a locally hosted site
const checkHostedSite = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const siteSlug = urlParams.get('site');
  if (siteSlug) {
    const hostedKey = `hosted_site_${siteSlug}`;
    const projectData = localStorage.getItem(hostedKey);
    if (projectData) {
      try {
        const project = JSON.parse(projectData);
        let fullHTML = project.files['index.html'] || '';
        if (project.files['style.css']) {
          fullHTML = fullHTML.replace('</head>', `<style>\n${project.files['style.css']}\n</style>\n</head>`);
        }
        if (project.files['script.js']) {
          fullHTML = fullHTML.replace('</body>', `<script>\n${project.files['script.js']}\n</script>\n</body>`);
        }
        document.open();
        document.write(fullHTML);
        document.close();
        return true;
      } catch (e) {
        console.error('Local hosting render error:', e);
      }
    }
    document.body.innerHTML = `
      <div style="background:#090d16; color:#f8fafc; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; padding:1rem;">
        <h2 style="font-size:2.5rem; font-weight:800; background:linear-gradient(135deg,#f43f5e,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">404 - App Not Found</h2>
        <p style="color:#64748b; margin-top:0.5rem; margin-bottom:1.5rem;">The application you are trying to view does not exist in local database hosting.</p>
        <a href="${window.location.pathname}" style="background:#6366f1; color:#fff; text-decoration:none; padding:10px 20px; border-radius:8px; font-weight:bold;">Launch AI App Builder Buddy Pro</a>
      </div>
    `;
    return true;
  }
  return false;
};

if (!checkHostedSite()) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
