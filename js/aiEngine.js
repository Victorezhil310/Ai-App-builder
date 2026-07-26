/* ==========================================================================
   AI CODE SYNTHESIZER ENGINE (HIGH-FIDELITY LOCAL CODES)
   ========================================================================== */

export class AIEngine {
  constructor() {
    this.generationSpeed = 30;
  }

  /**
   * Check for illegal/harmful words to ensure legal generation only
   */
  isIllegalPrompt(prompt) {
    const blackList = ['hack', 'bypass', 'exploit', 'phishing', 'malware', 'ddos', 'steal', 'spyware'];
    const lower = prompt.toLowerCase();
    return blackList.some(bad => lower.includes(bad));
  }

  /**
   * Synthesize full project files (HTML, CSS, JS) based on prompt & builder type
   */
  async generateProject(promptText, builderType = 'App') {
    const cleanPrompt = promptText.trim() || 'Modern AI Web Application';
    
    // Safety check
    if (this.isIllegalPrompt(cleanPrompt)) {
      throw new Error("Content blocked by security filters: Prompt contains potentially harmful or unauthorized keywords.");
    }

    const title = this.extractTitle(cleanPrompt, builderType);

    // Call real Gemini API if key is present
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      try {
        const response = await this.callGeminiAPI(apiKey, cleanPrompt, builderType);
        if (response && response.html) {
          return {
            title,
            builderType,
            prompt: cleanPrompt,
            createdAt: new Date().toISOString(),
            files: {
              'index.html': response.html,
              'style.css': response.css || '',
              'script.js': response.js || ''
            }
          };
        }
      } catch (err) {
        console.error('Real Gemini API call failed:', err);
        if (window.toast) {
          window.toast.warning('Gemini API call failed (check settings key). Using local mock builder...');
        }
      }
    }

    // High-Fidelity Local Custom Generator based on keyword matching
    const lower = cleanPrompt.toLowerCase();
    let html, css, js;

    if (lower.includes('flipkart') || lower.includes('shop') || lower.includes('ecommerce') || lower.includes('store') || lower.includes('amazon')) {
      // 1. High-Fidelity Flipkart E-commerce clone
      html = this.buildFlipkartHTML(title);
      css = this.buildFlipkartCSS();
      js = this.buildFlipkartJS();
    } else if (lower.includes('restaurant') || lower.includes('bistro') || lower.includes('food') || lower.includes('dining')) {
      // 2. High-Fidelity Restaurant Booking site
      html = this.buildRestaurantHTML(title);
      css = this.buildRestaurantCSS();
      js = this.buildRestaurantJS();
    } else if (lower.includes('portfolio') || lower.includes('resume') || lower.includes('developer') || lower.includes('designer')) {
      // 3. High-Fidelity Developer Portfolio
      html = this.buildPortfolioHTML(title);
      css = this.buildPortfolioCSS();
      js = this.buildPortfolioJS();
    } else {
      // 4. Default Clean SaaS Landing Page template
      html = this.buildLandingHTML(title);
      css = this.buildLandingCSS();
      js = this.buildLandingJS();
    }

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

  async callGeminiAPI(apiKey, prompt, builderType) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemInstruction = `You are an expert full-stack web developer. You must design and build a modern, high-quality, beautiful, and fully responsive website or app according to the user's prompt. 
    You must output a JSON object containing exactly three string fields:
    - "html": Complete index.html document with head, embedded CSS stylesheet reference (<link rel="stylesheet" href="style.css">), and script reference (<script src="script.js"></script>). Do not include CSS inside style tags or JS inside script tags in the HTML.
    - "css": Full, beautiful stylesheet (style.css) containing variables, custom glassmorphic elements, modern gradients, styling for all components, typography, layout grid/flex, animations, responsive media queries.
    - "js": Responsive script.js code containing interactive elements, events, functions, and simulated data updates.
    
    Make the app look premium, using curated colors, glass cards, hover effects, nice layout, icons from fontawesome, and fonts from Google Fonts. Include realistic sample data/images from Unsplash/Picsum.
    Return ONLY a raw JSON string of this structure: {"html": "...", "css": "...", "js": "..."}. Do not include markdown code block tags in your response.`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Build a ${builderType} based on this prompt: "${prompt}". Return only the JSON object with html, css, and js keys.` }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Empty response from model');
    }

    return JSON.parse(textContent.trim());
  }

  /* ==========================================================================
     1. FLIPKART E-COMMERCE CLONE
     ========================================================================== */
  buildFlipkartHTML(title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Online Shopping</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Top Blue Header -->
  <header class="header">
    <div class="header-container">
      <div class="brand-logo">
        <a href="#">
          <span class="logo-main">${title}</span>
          <span class="logo-sub">Plus <i class="fas fa-plus"></i></span>
        </a>
      </div>
      <div class="search-bar-wrap">
        <input type="text" id="search-input" placeholder="Search for products, brands and more">
        <button id="search-btn"><i class="fas fa-search"></i></button>
      </div>
      <div class="nav-links">
        <button class="login-btn">Login</button>
        <a href="#seller" class="nav-item">Become a Seller</a>
        <a href="#more" class="nav-item">More <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></a>
        <a href="#" class="nav-item cart-btn" id="open-cart-btn">
          <i class="fas fa-shopping-cart"></i> Cart (<span id="cart-count">0</span>)
        </a>
      </div>
    </div>
  </header>

  <!-- Categories Bar -->
  <div class="categories-bar">
    <div class="cat-item"><img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100" alt="Electronics"><span>Electronics</span></div>
    <div class="cat-item"><img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100" alt="Fashion"><span>Fashion</span></div>
    <div class="cat-item"><img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=100" alt="Home"><span>Home</span></div>
    <div class="cat-item"><img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100" alt="Appliances"><span>Appliances</span></div>
    <div class="cat-item"><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100" alt="Gadgets"><span>Beauty & Toys</span></div>
  </div>

  <!-- Main Banner Slider -->
  <div class="promo-banner">
    <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80" alt="Sale Offer" class="banner-img">
    <div class="banner-text">
      <h2>Big Billion Deals Live!</h2>
      <p>Up to 70% Off on Top Gadgets & Apparel</p>
    </div>
  </div>

  <!-- Products Section -->
  <section class="products-section">
    <h3>Trending Products & Offers</h3>
    <div class="products-grid" id="products-grid">
      <!-- Injected by script -->
    </div>
  </section>

  <!-- Slide-out Shopping Cart Drawer -->
  <div class="cart-drawer" id="cart-drawer">
    <div class="cart-header">
      <h4>My Shopping Cart</h4>
      <button class="close-cart" id="close-cart-btn">&times;</button>
    </div>
    <div class="cart-items" id="cart-items-container">
      <p style="color: #878787; text-align: center; margin-top: 2rem;">Your cart is empty.</p>
    </div>
    <div class="cart-footer">
      <div class="cart-total">Total: ₹<span id="cart-total-price">0</span></div>
      <button class="checkout-btn" onclick="checkoutOrder()">Proceed to Buy</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
  }

  buildFlipkartCSS() {
    return `/* Flipkart CSS styling */
:root {
  --blue-primary: #2874f0;
  --blue-dark: #1f5cb8;
  --yellow-accent: #ffe500;
  --bg-light: #f1f3f6;
  --text-dark: #212121;
}

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  background-color: var(--bg-light);
  color: var(--text-dark);
}

.header {
  background-color: var(--blue-primary);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1rem;
}

.brand-logo a {
  text-decoration: none;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo-main {
  font-weight: 700;
  font-size: 1.3rem;
  font-style: italic;
}

.logo-sub {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--yellow-accent);
  font-style: italic;
}

.search-bar-wrap {
  flex: 1;
  display: flex;
  background: #fff;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.search-bar-wrap input {
  flex: 1;
  border: none;
  padding: 8px 12px;
  font-size: 0.9rem;
  outline: none;
}

.search-bar-wrap button {
  background: transparent;
  border: none;
  padding: 0 15px;
  color: var(--blue-primary);
  cursor: pointer;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
}

.login-btn {
  background: #fff;
  color: var(--blue-primary);
  border: 1px solid #fff;
  padding: 5px 25px;
  border-radius: 2px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--blue-dark);
  color: #fff;
  border-color: var(--blue-dark);
}

/* Categories */
.categories-bar {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.05);
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.cat-item img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 4px;
}

.cat-item span {
  font-size: 0.8rem;
  font-weight: 500;
}

/* Banner */
.promo-banner {
  max-width: 1200px;
  margin: 0 auto 1.5rem auto;
  position: relative;
  height: 250px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.85));
  color: #fff;
  padding: 20px;
}

.banner-text h2 { margin: 0; }
.banner-text p { margin: 5px 0 0 0; }

/* Products Grid */
.products-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.product-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.prod-img {
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
}

.prod-info {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prod-title { font-weight: 500; font-size: 0.95rem; margin: 0; }
.prod-price { font-weight: 700; color: #388e3c; }

.add-to-cart-btn {
  background: #ff9f00;
  color: #fff;
  border: none;
  padding: 8px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 2px;
  margin-top: auto;
  transition: background 0.2s;
}

.add-to-cart-btn:hover { background: #e68f00; }

/* Cart Drawer */
.cart-drawer {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
}

.cart-drawer.active { right: 0; }

.cart-header {
  padding: 15px;
  background: var(--blue-primary);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h4 { margin: 0; }

.close-cart {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.cart-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.cart-footer {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  background: #fcfcfc;
}

.cart-total {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.checkout-btn {
  width: 100%;
  background: #fb641b;
  color: #fff;
  border: none;
  padding: 10px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 2px;
}

.checkout-btn:hover { background: #e25814; }
`;
  }

  buildFlipkartJS() {
    return `// Flipkart interactive scripting
const products = [
  { id: 1, title: 'Realme Smart Watch X', price: 2999, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400' },
  { id: 2, title: 'Premium Wireless Headphone', price: 1999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { id: 3, title: 'Minimalist Leather Jacket', price: 4499, img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
  { id: 4, title: 'Ergonomic Office Chair', price: 8999, img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400' }
];

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  document.getElementById('open-cart-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('cart-drawer').classList.add('active');
  });

  document.getElementById('close-cart-btn').addEventListener('click', () => {
    document.getElementById('cart-drawer').classList.remove('active');
  });
});

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  grid.innerHTML = products.map(p => \`
    <div class="product-card">
      <div class="prod-img" style="background-image: url('\${p.img}');"></div>
      <div class="prod-info">
        <h4 class="prod-title">\${p.title}</h4>
        <span class="prod-price">₹\${p.price.toLocaleString()}</span>
        <button class="add-to-cart-btn" onclick="addToCart(\${p.id})">Add to Cart</button>
      </div>
    </div>
  \`).join('');
}

function addToCart(productId) {
  const prod = products.find(p => p.id === productId);
  if (prod) {
    cart.push(prod);
    updateCartUI();
    alert(prod.title + ' added to your shopping cart!');
  }
}

function updateCartUI() {
  document.getElementById('cart-count').innerText = cart.length;
  
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = \`<p style="color: #878787; text-align: center; margin-top: 2rem;">Your cart is empty.</p>\`;
    document.getElementById('cart-total-price').innerText = '0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, idx) => {
    total += item.price;
    return \`
      <div class="cart-item-row">
        <div>
          <span style="font-size: 0.85rem; font-weight:500;">\${item.title}</span>
          <br>
          <span style="color:#388e3c; font-size: 0.8rem; font-weight:700;">₹\${item.price}</span>
        </div>
        <button style="border:none; background:none; color:red; cursor:pointer;" onclick="removeFromCart(\${idx})">&times;</button>
      </div>
    \`;
  }).join('');

  document.getElementById('cart-total-price').innerText = total.toLocaleString();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartUI();
}

function checkoutOrder() {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  alert('Thank you for your order! Simulated purchase successful.');
  cart = [];
  updateCartUI();
  document.getElementById('cart-drawer').classList.remove('active');
}
`;
  }

  /* ==========================================================================
     2. LUXURY RESTAURANT SITE
     ========================================================================== */
  buildRestaurantHTML(title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Gourmet Bistro</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #07070a; color: #f1f1f1; margin: 0; }
    h1, h2, h3 { font-family: 'Playfair Display', serif; }
    .hero { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000') center; background-size: cover; }
    .menu { max-width: 800px; margin: 3rem auto; padding: 0 1rem; }
    .menu-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #333; padding: 1rem 0; }
    .booking-form { max-width: 500px; margin: 3rem auto; padding: 2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
    .form-group { margin-bottom: 1rem; display:flex; flex-direction:column; gap:0.35rem; }
    .form-group input, .form-group select { padding: 10px; border-radius: 4px; border: 1px solid #333; background: #111; color: #fff; }
    .btn { background: #bfa37a; color: #fff; padding: 12px; border: none; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%; }
    .btn:hover { background: #a68c65; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Welcome to ${title}</h1>
    <p>A symphony of flavor and sensory culinary delight</p>
  </div>
  <div class="menu">
    <h2>Our Culinary Specials</h2>
    <div class="menu-item"><div><strong>Truffle Gnocchi</strong><br><small>Wild mushroom ragout, parmesan curls</small></div><div>₹1,250</div></div>
    <div class="menu-item"><div><strong>Pan Seared Salmon</strong><br><small>Asparagus tips, lemon saffron butter</small></div><div>₹1,450</div></div>
    <div class="menu-item"><div><strong>Slow Cooked Lamb Shank</strong><br><small>Rosemary mash, red wine reduction</small></div><div>₹1,850</div></div>
  </div>
  <div class="booking-form">
    <h3>Book a Dining Table</h3>
    <form id="reservation-form">
      <div class="form-group"><label>Date</label><input type="date" required></div>
      <div class="form-group"><label>Time Slot</label><select><option>7:00 PM</option><option>8:30 PM</option><option>10:00 PM</option></select></div>
      <div class="form-group"><label>Guests</label><input type="number" min="1" max="10" value="2"></div>
      <button class="btn" type="submit">Submit Reservation</button>
    </form>
  </div>
  <script>
    document.getElementById('reservation-form').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Reservation received! We look forward to hosting you.');
    });
  </script>
</body>
</html>`;
  }
  buildRestaurantCSS() { return ``; }
  buildRestaurantJS() { return ``; }

  /* ==========================================================================
     3. DEVELOPER PORTFOLIO
     ========================================================================== */
  buildPortfolioHTML(title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Designer & Developer</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0d0f14; color: #fff; margin: 0; padding: 2rem 0; }
    .container { max-width: 750px; margin: 0 auto; padding: 0 1rem; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; }
    .card h3 { margin-top: 0; color: #22d3ee; }
    .contact-form { margin-top: 3rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
    .form-group input, .form-group textarea { padding: 10px; background: #161a22; border: 1px solid #333; color: #fff; border-radius: 4px; }
    .btn { background: #a855f7; color: #fff; border: none; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: bold; }
    .btn:hover { background: #9333ea; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Hi, I'm ${title}</h1>
      <p>Building beautiful interactive user experiences & web portals</p>
    </header>
    <h2>Projects Showcase</h2>
    <div class="grid">
      <div class="card"><h3>AI Analytics Dashboard</h3><p>Full stack SaaS application using React & ChartJS.</p></div>
      <div class="card"><h3>Crypto Pay System</h3><p>Blockchain integration portal for seamless payments.</p></div>
    </div>
    <div class="contact-form">
      <h2>Let's Connect</h2>
      <form id="contact-form">
        <div class="form-group"><label>Email</label><input type="email" required></div>
        <div class="form-group"><label>Message</label><textarea rows="4" required></textarea></div>
        <button class="btn" type="submit">Send Message</button>
      </form>
    </div>
  </div>
  <script>
    document.getElementById('contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Message sent! I will get back to you shortly.');
    });
  </script>
</body>
</html>`;
  }
  buildPortfolioCSS() { return ``; }
  buildPortfolioJS() { return ``; }

  /* ==========================================================================
     4. GENERIC SAAS LANDING PAGE (DEFAULT FALLBACK)
     ========================================================================== */
  buildLandingHTML(title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Automated Growth Platform</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: sans-serif; background: #090d16; color: #e2e8f0; text-align: center; margin: 0; padding: 4rem 1rem; }
    h1 { font-size: 3rem; color: #fff; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem auto; }
    .btn { background: #3b82f6; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Automate your tasks, build databases, and generate layouts effortlessly in one interface.</p>
  <a href="#" class="btn" onclick="alert('Started!')">Get Started Free</a>
</body>
</html>`;
  }
  buildLandingCSS() { return ``; }
  buildLandingJS() { return ``; }
}
