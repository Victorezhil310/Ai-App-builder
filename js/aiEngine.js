/* ==========================================================================
   AI CODE SYNTHESIZER ENGINE
   Generates rich HTML, CSS, and JS code based on user prompt and category
   ========================================================================== */

export class AIEngine {
  constructor() {
    this.generationSpeed = 30; // Simulated streaming interval ms
  }

  /**
   * Synthesize full project files (HTML, CSS, JS) based on prompt & builder type
   */
  async generateProject(promptText, builderType = 'App') {
    const cleanPrompt = promptText.trim() || 'Modern AI Web Application';
    const title = this.extractTitle(cleanPrompt, builderType);
    
    // Generate specialized template code based on prompt keywords & type
    const html = this.buildHTML(title, cleanPrompt, builderType);
    const css = this.buildCSS(cleanPrompt, builderType);
    const js = this.buildJS(cleanPrompt, builderType);

    return {
      title,
      builderType,
      prompt: cleanPrompt,
      createdAt: new Date().toISOString(),
      files: {
        'index.html': html,
        'style.css': css,
        'script.js': js
      }
    };
  }

  extractTitle(prompt, builderType) {
    const words = prompt.split(' ');
    if (words.length > 1 && words.length <= 4) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return `AI ${builderType} - ${words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
  }

  buildHTML(title, prompt, builderType) {
    const lower = prompt.toLowerCase();
    
    // Dynamic component sections based on prompt keywords
    let navLinks = `
      <a href="#features">Features</a>
      <a href="#showcase">Showcase</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact" class="nav-btn">Contact Us</a>
    `;

    let heroContent = `
      <div class="badge-tag">✨ Generated with AI App Builder</div>
      <h1>${title}</h1>
      <p class="hero-subtext">Empowering your digital presence with next-gen automated intelligence. Built seamlessly with zero coding required.</p>
      <div class="hero-cta-group">
        <button class="primary-btn" onclick="handleAction('Get Started')">Get Started Free <i class="fas fa-arrow-right"></i></button>
        <button class="secondary-btn" onclick="handleAction('Learn More')">Explore Features</button>
      </div>
    `;

    if (lower.includes('restaurant') || lower.includes('food')) {
      navLinks = `<a href="#menu">Menu</a><a href="#story">About Us</a><a href="#booking" class="nav-btn">Book Table</a>`;
      heroContent = `
        <div class="badge-tag">🍷 Culinary Excellence</div>
        <h1>${title}</h1>
        <p class="hero-subtext">Savor exquisite gourmet dishes crafted with fresh organic ingredients by world-class chefs.</p>
        <div class="hero-cta-group">
          <button class="primary-btn" onclick="handleAction('Book Table')">Reserve Table <i class="fas fa-utensils"></i></button>
          <button class="secondary-btn" onclick="handleAction('View Menu')">Browse Menu</button>
        </div>
      `;
    } else if (lower.includes('portfolio') || lower.includes('developer') || lower.includes('designer')) {
      navLinks = `<a href="#about">About</a><a href="#projects">Work</a><a href="#skills">Skills</a><a href="#contact" class="nav-btn">Hire Me</a>`;
      heroContent = `
        <div class="badge-tag">🚀 Full-Stack Specialist</div>
        <h1>Hello, I'm <span class="highlight-text">Alex Vance</span></h1>
        <p class="hero-subtext">Crafting beautiful user interfaces, scalable backend systems, and cutting-edge digital experiences.</p>
        <div class="hero-cta-group">
          <button class="primary-btn" onclick="handleAction('View Projects')">View My Work <i class="fas fa-briefcase"></i></button>
          <button class="secondary-btn" onclick="handleAction('Download CV')">Download CV</button>
        </div>
      `;
    } else if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical')) {
      navLinks = `<a href="#services">Services</a><a href="#doctors">Doctors</a><a href="#appointment" class="nav-btn">Book Appointment</a>`;
      heroContent = `
        <div class="badge-tag">🏥 24/7 Compassionate Care</div>
        <h1>Your Health & Wellness First</h1>
        <p class="hero-subtext">Advanced medical diagnostics, experienced specialist doctors, and comprehensive healthcare services.</p>
        <div class="hero-cta-group">
          <button class="primary-btn" onclick="handleAction('Book Appointment')">Schedule Appointment <i class="fas fa-calendar-check"></i></button>
          <button class="secondary-btn" onclick="handleAction('Emergency Call')">Emergency 24/7</button>
        </div>
      `;
    } else if (lower.includes('store') || lower.includes('shop') || lower.includes('ecommerce') || lower.includes('fashion')) {
      navLinks = `<a href="#products">Products</a><a href="#categories">Categories</a><a href="#deals">Deals</a><a href="#cart" class="nav-btn">Cart (<span id="cart-count">0</span>)</a>`;
      heroContent = `
        <div class="badge-tag">🔥 New Season Arrival</div>
        <h1>Discover Premium Quality Trends</h1>
        <p class="hero-subtext">Upgrade your style with top-rated minimalist aesthetics, delivered fast to your doorstep.</p>
        <div class="hero-cta-group">
          <button class="primary-btn" onclick="handleAction('Shop Now')">Shop New Collection <i class="fas fa-shopping-bag"></i></button>
          <button class="secondary-btn" onclick="handleAction('Offers')">Explore 30% Off Deals</button>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Navigation Bar -->
  <header class="header">
    <div class="container nav-box">
      <a href="#" class="brand"><i class="fas fa-cube"></i> ${title}</a>
      <nav class="nav-links">
        ${navLinks}
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container hero-grid">
      <div class="hero-text-block">
        ${heroContent}
      </div>
      <div class="hero-visual-card">
        <div class="glass-window">
          <div class="window-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="window-title">Live Preview Window</span>
          </div>
          <div class="window-body">
            <div class="stat-row">
              <div class="mini-stat">
                <i class="fas fa-bolt"></i>
                <div>
                  <h4 id="counter-1">99.9%</h4>
                  <p>Performance</p>
                </div>
              </div>
              <div class="mini-stat">
                <i class="fas fa-users"></i>
                <div>
                  <h4 id="counter-2">45.2K</h4>
                  <p>Active Users</p>
                </div>
              </div>
            </div>
            <div class="code-snippet-box">
              <code>// Generated dynamically with AI App Builder Free</code>
              <br>
              <code>const app = new AIApp({ liveStatus: true });</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="features-section">
    <div class="container">
      <div class="section-title">
        <h2>Key Highlights & Capabilities</h2>
        <p>Engineered for ultimate scalability, responsiveness, and performance.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-wand-magic-sparkles"></i></div>
          <h3>AI Generation</h3>
          <p>Instant smart layout generation tailored to your exact custom prompts and industry standards.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-mobile-screen"></i></div>
          <h3>Fully Responsive</h3>
          <p>Pixel-perfect display across Mobile, Tablet, and Ultra-wide Desktop viewports automatically.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-rocket"></i></div>
          <h3>Blazing Fast Speed</h3>
          <p>Optimized DOM structure and CSS variables guaranteeing light-speed load times.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <p>&copy; ${new Date().getFullYear()} ${title}. Built with AI App Builder Free.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
  }

  buildCSS(prompt, builderType) {
    return `/* Custom CSS for Generated App */
:root {
  --primary-bg: #090d16;
  --card-bg: rgba(15, 23, 42, 0.75);
  --accent-color: #6366f1;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-glass: rgba(255, 255, 255, 0.12);
  --font-sans: 'Plus Jakarta Sans', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--primary-bg);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-glass);
}

.nav-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand i { color: var(--accent-color); }

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--text-main); }

.nav-btn {
  background: var(--accent-gradient);
  color: #fff !important;
  padding: 0.5rem 1.2rem;
  border-radius: 99px;
}

/* Hero Section */
.hero-section {
  padding: 5rem 0 4rem 0;
  position: relative;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.badge-tag {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-text-block h1 {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.2rem;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.highlight-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtext {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.hero-cta-group {
  display: flex;
  gap: 1rem;
}

.primary-btn {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid var(--border-glass);
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

/* Glass Window Visual */
.glass-window {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.window-header {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }
.window-title { margin-left: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }

.window-body { padding: 1.5rem; }

.stat-row { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }

.mini-stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mini-stat i { font-size: 1.5rem; color: var(--accent-color); }
.mini-stat h4 { font-size: 1.25rem; font-weight: 800; }
.mini-stat p { font-size: 0.75rem; color: var(--text-muted); }

.code-snippet-box {
  background: #000;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #a855f7;
}

/* Features */
.features-section { padding: 4rem 0; }
.section-title { text-align: center; margin-bottom: 3rem; }
.section-title h2 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
.section-title p { color: var(--text-muted); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: var(--card-bg);
  border: 1px solid var(--border-glass);
  padding: 2rem;
  border-radius: 16px;
  transition: transform 0.2s;
}

.feature-card:hover { transform: translateY(-5px); border-color: var(--accent-color); }

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1.2rem;
}

.feature-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
.feature-card p { color: var(--text-muted); font-size: 0.9rem; }

/* Footer */
.footer { border-top: 1px solid var(--border-glass); padding: 2rem 0; text-align: center; color: var(--text-muted); font-size: 0.9rem; }

@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-text-block h1 { font-size: 2.2rem; }
}
`;
  }

  buildJS(prompt, builderType) {
    return `// Dynamic JavaScript Controller for ${builderType}
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI App initialized successfully!');
});

function handleAction(actionName) {
  alert('Action triggered: ' + actionName + '\\nThis app is live and interactive!');
}

// Interactive Counter Animation Simulation
let counter = 0;
setInterval(() => {
  const counterEl = document.getElementById('counter-1');
  if (counterEl) {
    counter = (counter + 0.1) % 100;
    counterEl.innerText = counter > 99.5 ? '99.9%' : (99.0 + (counter % 0.9)).toFixed(1) + '%';
  }
}, 3000);
`;
  }
}
