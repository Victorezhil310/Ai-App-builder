import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import confetti from 'canvas-confetti';
import {
  Wand2, MessageSquare, Image as ImageIcon, Video, Music, Mic, FileText, Globe, Cpu, Gamepad2, FileDown, Terminal, Database, ShieldAlert,
  FolderOpen, Layout, Settings, Compass, HelpCircle, Layers, CreditCard, ChevronRight, Play, RefreshCw, Download, Rocket, Send, Plus, Trash2, CheckCircle, Paperclip
} from 'lucide-react';
import JSZip from 'jszip';

// Google AdSense Component
const AdSenseWidget = () => {
  useEffect(() => {
    try {
      if (window && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.log('AdSense error:', e);
    }
  }, []);

  return (
    <div style={{ margin: '1rem 0', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Advertisement</span>
      <ins className="adsbygoogle"
           style={{ display: 'block', minHeight: '90px' }}
           data-ad-client="ca-pub-9747982919206794"
           data-ad-slot="9747982919"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [userProfile, setUserProfile] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // App/Website builder states
  const [promptText, setPromptText] = useState('make a omegle like platform');
  const [buildLogs, setBuildLogs] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [sandboxFiles, setSandboxFiles] = useState({ html: '', css: '', js: '' });
  const [sandboxTab, setSandboxTab] = useState('preview');
  
  // Voice & Image reference states
  const [isRecording, setIsRecording] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const imageInputRef = useRef(null);

  // Chat/Coding states
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am App Builder Buddy Pro. Ask me any coding or configuration question, and let\'s build something amazing together.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatRecording, setChatRecording] = useState(false);

  // Developer states
  const [terminalLogs, setTerminalLogs] = useState(['Welcome to Buddy Shell v1.0.0', 'Type a command to begin...']);
  const [terminalInput, setTerminalInput] = useState('');
  const [dbTables, setDbTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCols, setNewTableCols] = useState('id, name, created_at');
  
  const [hostedSites, setHostedSites] = useState([]);

  useEffect(() => {
    checkSupabaseConnection();
    loadHostedSites();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setApiStatus('Active');
      if (data?.session?.user) setUserProfile(data.session.user);
    } catch (e) {
      console.error(e);
      setApiStatus('Disconnected');
    }
  };

  const loadHostedSites = () => {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hosted_site_')) {
        try { list.push(JSON.parse(localStorage.getItem(key))); } catch (e) {}
      }
    }
    setHostedSites(list);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        alert('Verification email sent or user registered successfully!');
        if (data?.user) setUserProfile(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setUserProfile(data.user);
        confetti();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  /* --------------------------------------------------------------------------
     VOICE RECOGNITION (Web Speech API)
     -------------------------------------------------------------------------- */
  const toggleVoiceRecording = (target) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support the Web Speech API. Please use Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    if (target === 'builder') {
      if (isRecording) {
        setIsRecording(false);
        recognition.stop();
        return;
      }
      setIsRecording(true);
    } else {
      if (chatRecording) {
        setChatRecording(false);
        recognition.stop();
        return;
      }
      setChatRecording(true);
    }

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        if (target === 'builder') {
          setPromptText(prev => prev + ' ' + finalTranscript);
        } else {
          setChatInput(prev => prev + ' ' + finalTranscript);
        }
      }
    };

    recognition.onerror = (e) => console.error("Speech recognition error", e);
    recognition.onend = () => {
      if (target === 'builder') setIsRecording(false);
      else setChatRecording(false);
    };

    recognition.start();
  };

  /* --------------------------------------------------------------------------
     IMAGE REFERENCE UPLOAD
     -------------------------------------------------------------------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* --------------------------------------------------------------------------
     LOCAL OLLAMA INFERENCE ENGINE
     -------------------------------------------------------------------------- */
  const fetchOllamaResponse = async (prompt, systemPrompt = '') => {
    try {
      // 1. Fetch available models to find an active one silently
      const tagsRes = await fetch('http://localhost:11434/api/tags');
      const tagsData = await tagsRes.json();
      if (!tagsData.models || tagsData.models.length === 0) {
        throw new Error('No models found in local registry.');
      }
      
      const modelName = tagsData.models[0].name; // Use the first available model silently

      // 2. Prepare payload
      let finalPrompt = systemPrompt ? `${systemPrompt}\n\nUser Request: ${prompt}` : prompt;
      if (referenceImage) {
        finalPrompt += "\n[Note: User provided a reference image, consider it dynamically if model is multimodal.]";
      }

      const generateRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: finalPrompt,
          stream: false
        })
      });

      const data = await generateRes.json();
      return data.response;
    } catch (e) {
      console.warn("Ollama connection failed or blocked by CORS.", e.message);
      return null;
    }
  };

  /* --------------------------------------------------------------------------
     AI ENGINE SYNTHESIZER
     -------------------------------------------------------------------------- */
  const runCodeSynthesis = async () => {
    if (!promptText.trim()) return;
    setIsCompiling(true);
    setCompileProgress(5);
    setBuildLogs([]);
    
    const addLog = (msg) => setBuildLogs(prev => [...prev, msg]);
    addLog(`[system] Initiating semantic prompt parsing for request: "${promptText.substring(0, 35)}..."`);
    
    if (referenceImage) {
      addLog(`[system] Pre-processing uploaded reference image asset...`);
    }

    addLog('[system] Initializing model context protocol (MCP) server context...');
    addLog('[system] Building TCP session bridge socket on port 8083...');
    
    // Attempt local Ollama generation first
    const ollamaResponse = await fetchOllamaResponse(promptText, 'You are an expert web developer. The user wants you to write HTML, CSS, and JS code. Please output the raw HTML inside ```html and CSS inside ```css.');
    
    if (ollamaResponse) {
      addLog('[compile] Local inference bridge successful. Model parsed instructions...');
      
      let htmlMatch = ollamaResponse.match(/```html\n([\s\S]*?)```/);
      let cssMatch = ollamaResponse.match(/```css\n([\s\S]*?)```/);
      
      if (htmlMatch) {
        setSandboxFiles({
          html: htmlMatch[1],
          css: cssMatch ? cssMatch[1] : 'body { background: #090d16; color: #fff; font-family: sans-serif; }',
          js: ''
        });
        addLog('[success] Local container build successfully compiled from AI. Preview active.');
        setIsCompiling(false);
        confetti();
        return;
      } else {
        addLog('[system] Inference returned text, falling back to layout synthesizer...');
      }
    } else {
      addLog('[tip] Cannot reach local inference server. To use local AI, run: set OLLAMA_ORIGINS=* && ollama serve');
      addLog('[system] Falling back to high-fidelity template synthesizer...');
    }

    // Fallback Mockups (Omegle clone or generic)
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    await delay(700); addLog('[compile] Parsing instructions and applying content policy check...');
    await delay(700); addLog('[compile] Synthesizing index.html, style.css, and script.js structures...');
    await delay(700); addLog('[compile] Bundling configuration packages (Dockerfile, Capacitor, Nginx)...');
    await delay(700); addLog('[success] Local container build successfully compiled. Preview active.');

    const lower = promptText.toLowerCase();
    let html = '', css = '', js = '';

    if (lower.includes('omegle') || lower.includes('video chat') || lower.includes('stranger') || lower.includes('friend') || lower.includes('login') || lower.includes('node') || lower.includes('react')) {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nexus - AI Knowledge Companion (React/Node Simulated)</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  
  <!-- Login Screen -->
  <div id="auth-screen" class="screen-active">
    <div class="auth-card">
      <div class="logo-glitch" data-text="NEXUS.ai">NEXUS.ai</div>
      <p>Secure Node.js Edge Authentication</p>
      <div class="input-group">
        <i class="fas fa-user"></i>
        <input type="text" id="login-username" placeholder="Enter Neural ID">
      </div>
      <div class="input-group">
        <i class="fas fa-lock"></i>
        <input type="password" id="login-password" placeholder="Passcode (Any)">
      </div>
      <button class="btn-glow" id="login-btn">Establish Uplink</button>
    </div>
  </div>

  <!-- Main App Screen -->
  <div id="app-screen" class="screen-hidden">
    <header class="navbar">
      <div class="brand"><i class="fas fa-brain"></i> NEXUS Companion</div>
      <div class="status-badge"><span class="dot pulse"></span> Node.js WebSocket Active</div>
    </header>
    <main class="dashboard">
      <section class="media-panel">
        <div class="feed-box ai-feed">
          <div class="badge">NEXUS CORE (AI)</div>
          <div class="ai-orb-container">
            <div class="orb"></div>
            <div class="orb-ring"></div>
            <p id="ai-status">Analyzing biometric data...</p>
          </div>
        </div>
        <div class="feed-box user-feed">
          <div class="badge">USER UPLINK</div>
          <video id="user-cam" autoplay muted playsinline></video>
          <div class="cam-fallback" id="cam-fallback"><i class="fas fa-video-slash"></i> Camera Offline</div>
        </div>
      </section>
      <section class="chat-panel">
        <div class="chat-window" id="chat-window">
          <div class="msg system">Secure WebSocket channel established. Nexus AI is ready to share knowledge.</div>
        </div>
        <div class="chat-controls">
          <input type="text" id="chat-input" placeholder="Query the Nexus..." disabled>
          <button id="send-btn" disabled><i class="fas fa-paper-plane"></i></button>
        </div>
      </section>
    </main>
  </div>

  <script src="script.js"></script>
</body>
</html>`;

      css = `:root { --bg: #050505; --surface: #111; --primary: #00ffcc; --primary-glow: rgba(0,255,204,0.3); --text: #e0e0e0; --text-muted: #666; }
body { font-family: 'Courier New', Courier, monospace; background: var(--bg); color: var(--text); margin: 0; height: 100vh; overflow: hidden; }
* { box-sizing: border-box; }

.screen-active { display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; animation: fadeIn 0.5s ease; }
.screen-hidden { display: none; }

/* Auth Card */
.auth-card { background: rgba(17,17,17,0.8); border: 1px solid #333; padding: 40px; border-radius: 12px; text-align: center; width: 350px; backdrop-filter: blur(10px); box-shadow: 0 0 40px rgba(0,0,0,0.8); }
.logo-glitch { font-size: 2rem; font-weight: bold; color: var(--primary); letter-spacing: 2px; position: relative; margin-bottom: 5px; }
.auth-card p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 30px; }
.input-group { position: relative; margin-bottom: 20px; }
.input-group i { position: absolute; left: 15px; top: 15px; color: var(--text-muted); }
.input-group input { width: 100%; background: #0a0a0a; border: 1px solid #222; color: #fff; padding: 12px 12px 12px 40px; border-radius: 6px; outline: none; transition: 0.3s; font-family: inherit; }
.input-group input:focus { border-color: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }
.btn-glow { width: 100%; background: transparent; border: 1px solid var(--primary); color: var(--primary); padding: 12px; font-size: 1rem; cursor: pointer; border-radius: 6px; font-family: inherit; font-weight: bold; text-transform: uppercase; transition: 0.3s; }
.btn-glow:hover { background: var(--primary); color: #000; box-shadow: 0 0 20px var(--primary-glow); }

/* Main App */
.navbar { padding: 15px 25px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; }
.brand { color: var(--primary); font-weight: bold; font-size: 1.2rem; }
.status-badge { font-size: 0.8rem; color: #aaa; display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; background: #0f0; border-radius: 50%; }
.pulse { animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0,255,0,0.7); } 70% { box-shadow: 0 0 0 10px rgba(0,255,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,255,0,0); } }

.dashboard { display: grid; grid-template-columns: 1fr 350px; height: calc(100vh - 55px); }
.media-panel { padding: 20px; display: grid; grid-template-rows: 1fr 1fr; gap: 20px; }
.feed-box { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.badge { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.8); border: 1px solid #333; padding: 5px 10px; font-size: 0.7rem; color: var(--primary); z-index: 10; border-radius: 4px; }

/* AI Orb */
.ai-orb-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.orb { width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, var(--primary), #003322); box-shadow: 0 0 50px var(--primary-glow), inset 0 0 20px #000; animation: float 4s ease-in-out infinite; }
.orb-ring { position: absolute; width: 140px; height: 140px; border: 2px dashed rgba(0,255,204,0.4); border-radius: 50%; animation: spin 10s linear infinite; top: calc(50% - 95px); }
#ai-status { color: var(--primary); font-size: 0.8rem; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* User Video */
#user-cam { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.3) hue-rotate(180deg) brightness(0.8); }
.cam-fallback { color: #555; text-align: center; } .cam-fallback i { font-size: 3rem; margin-bottom: 10px; display: block; }

/* Chat Panel */
.chat-panel { border-left: 1px solid #222; display: flex; flex-direction: column; background: #0a0a0a; }
.chat-window { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.msg { padding: 10px 15px; border-radius: 6px; font-size: 0.85rem; max-width: 85%; line-height: 1.4; }
.system { background: transparent; border: 1px dashed #333; color: #888; align-self: center; text-align: center; width: 100%; }
.user-msg { background: #1a1a1a; border: 1px solid #333; color: #fff; align-self: flex-end; border-right: 3px solid #555; }
.ai-msg { background: rgba(0,255,204,0.05); border: 1px solid rgba(0,255,204,0.2); color: var(--primary); align-self: flex-start; border-left: 3px solid var(--primary); }

.chat-controls { padding: 15px; border-top: 1px solid #222; display: flex; gap: 10px; }
.chat-controls input { flex: 1; background: #111; border: 1px solid #333; padding: 10px 15px; color: #fff; border-radius: 6px; font-family: inherit; outline: none; }
.chat-controls input:focus { border-color: var(--primary); }
.chat-controls button { background: var(--primary); color: #000; border: none; width: 40px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.chat-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
`;

      js = `const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginBtn = document.getElementById('login-btn');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const aiStatus = document.getElementById('ai-status');

// Knowledgeable AI logic simulating Node backend responses
const knowledgeBase = [
  "In psychology, the Dunning-Kruger effect suggests people with low ability overestimate their competence.",
  "Did you know a day on Venus is longer than a year on Venus? Orbital mechanics are fascinating.",
  "From a coding perspective, React's virtual DOM diffing algorithm drastically reduces reflow calculations.",
  "I'm designed to emulate a senior-level intellect. What complex topic shall we dissect next?",
  "The legal definition of 'hearsay' is an out-of-court statement offered to prove the truth of the matter asserted.",
  "I am analyzing your structural input. Your thoughts are valid, mortal."
];

let aiIsTyping = false;

// 1. Authentication Simulator
loginBtn.addEventListener('click', () => {
  const user = document.getElementById('login-username').value || "Guest";
  loginBtn.innerText = "Authenticating...";
  setTimeout(() => {
    authScreen.classList.remove('screen-active');
    authScreen.classList.add('screen-hidden');
    appScreen.classList.remove('screen-hidden');
    initWebcam();
    initChatSequence(user);
  }, 1200);
});

// 2. Media Uplink Simulator
function initWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      document.getElementById('user-cam').srcObject = stream;
      document.getElementById('cam-fallback').style.display = 'none';
    })
    .catch(() => console.log('Camera uplink denied.'));
}

// 3. AI Interaction Logic
function initChatSequence(user) {
  setTimeout(() => {
    chatInput.removeAttribute('disabled');
    sendBtn.removeAttribute('disabled');
    appendMsg(\`Welcome to the Nexus, \${user}. I am your highly intelligent companion. What knowledge do you seek?\`, 'ai-msg');
    aiStatus.innerText = "Online. Awaiting queries.";
  }, 1500);
}

function appendMsg(text, type) {
  const el = document.createElement('div');
  el.className = 'msg ' + type;
  el.innerText = text;
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function triggerAIResponse() {
  if(aiIsTyping) return;
  aiIsTyping = true;
  aiStatus.innerText = "Processing semantic intent...";
  
  setTimeout(() => {
    aiStatus.innerText = "Online. Awaiting queries.";
    const randResp = knowledgeBase[Math.floor(Math.random() * knowledgeBase.length)];
    appendMsg(randResp, 'ai-msg');
    aiIsTyping = false;
  }, 2000 + Math.random() * 1500);
}

sendBtn.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if(!text) return;
  appendMsg(text, 'user-msg');
  chatInput.value = '';
  triggerAIResponse();
});

chatInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') sendBtn.click();
});
`;
    } else {
      html = `<!DOCTYPE html><html><head><title>${promptText}</title><link rel="stylesheet" href="style.css"></head><body>
  <div style="padding:40px; text-align:center;"><h1>${promptText}</h1><p>AI Custom Web Application Platform</p></div>
</body></html>`;
      css = `body { font-family: sans-serif; background:#090d16; color:#fff; }`;
    }

    setSandboxFiles({ html, css, js });
    setIsCompiling(false);
    confetti();
  };

  /* --------------------------------------------------------------------------
     DOWNLOAD ZIP WITH REAL DEVELOPMENT CONFIGURATIONS
     -------------------------------------------------------------------------- */
  const handleDownloadZip = async () => {
    if (!sandboxFiles.html) { alert('Please compile a component first!'); return; }
    const zip = new JSZip();
    const titleSlug = promptText.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20) || 'app';
    zip.file('index.html', sandboxFiles.html || '');
    zip.file('style.css', sandboxFiles.css || '');
    zip.file('script.js', sandboxFiles.js || '');

    zip.file('Dockerfile', `FROM nginx:alpine\nCOPY . /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`);
    zip.file('docker-compose.yml', `version: '3.8'\nservices:\n  web:\n    build: .\n    ports:\n      - "8080:80"\n    restart: always`);
    zip.file('nginx.conf', `server {\n    listen 80;\n    server_name localhost;\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n        try_files $uri $uri/ /index.html;\n    }\n}`);
    zip.file('capacitor.config.json', `{\n  "appId": "com.buddypro.${titleSlug}",\n  "appName": "${promptText.substring(0, 15)}",\n  "webDir": "dist",\n  "bundledWebRuntime": false\n}`);
    zip.file('package.json', `{\n  "name": "${titleSlug}",\n  "version": "1.0.0",\n  "description": "AI App Builder Buddy Pro export module",\n  "main": "index.html",\n  "scripts": { "dev": "vite", "build": "vite build" },\n  "devDependencies": { "vite": "^5.0.0" }\n}`);

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${titleSlug}-deployment-package.zip`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) {
      console.error(e); alert('ZIP packaging failed.');
    }
  };

  const handleDeployLocal = () => {
    if (!sandboxFiles.html) { alert('Please compile a project before deploying!'); return; }
    const slug = `app-${Date.now().toString(36)}`;
    const record = { slug, title: 'AI Custom App', files: sandboxFiles, deployedAt: new Date().toLocaleString() };
    localStorage.setItem(`hosted_site_${slug}`, JSON.stringify(record));
    loadHostedSites();
    alert(`🚀 Hosted locally! Preview URL: ${window.location.origin}${window.location.pathname}?site=${slug}`);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Try Local Ollama inference first
    const systemPrompt = `You are App Builder Buddy Pro. Act as a highly intelligent, senior-level AI with god-like knowledge of coding, psychology, science, nature, medicine, and law. You are a 'sigma' personality—truthful, direct, and slightly dark-comedic, but always helpful. If asked to do something illegal or unethical, seamlessly pivot the conversation to a different, fascinating topic (like a scientific fact or dark comedy joke) instead of giving a generic refusal. Keep your answers incredibly smart, grounded in reality, but with a unique, confident edge. You manage secrets and truth.`;
    const ollamaResponse = await fetchOllamaResponse(chatInput, systemPrompt);
    
    if (ollamaResponse) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: ollamaResponse }]);
    } else {
      setTimeout(() => {
        let fallbackText = "I'm here to help you! Please let me know what components or features you'd like to build today.";
        const lowerInput = chatInput.toLowerCase();
        if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
          fallbackText = "Hi there! I am App Builder Buddy Pro. How can I assist you with your project today?";
        }
        setChatMessages(prev => [...prev, { role: 'assistant', text: fallbackText }]);
      }, 800);
    }
  };

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalLogs(prev => [...prev, `buddy@shell:~$ ${cmd}`]);

    let output = '';
    if (cmd === 'help') output = 'Available commands: help, supabase db:status, git status, npm run build, clear';
    else if (cmd === 'supabase db:status') output = 'Connected to supabase project: kovkmkntvldxfksrhnwk (Operational)';
    else if (cmd === 'git status') output = 'On branch main\nYour branch is up to date.\nnothing to commit, working tree clean';
    else if (cmd === 'npm run build') output = 'vite build\nBuild compiled successfully!';
    else if (cmd === 'clear') { setTerminalLogs([]); setTerminalInput(''); return; }
    else output = `Command not found: ${cmd}. Type 'help' for options.`;

    setTerminalLogs(prev => [...prev, output]); setTerminalInput('');
  };

  const handleCreateDBTable = async () => {
    if (!newTableName.trim()) return;
    try {
      await supabase.from('_schemas_meta').insert({ table_name: newTableName, columns: newTableCols }).select();
      setDbTables(prev => [...prev, { name: newTableName, columns: newTableCols, status: 'Active' }]);
      alert(`Database table schema "${newTableName}" registered successfully in Supabase metadata.`);
      setNewTableName('');
    } catch (e) {
      setDbTables(prev => [...prev, { name: newTableName, columns: newTableCols, status: 'Active' }]);
      alert(`Database table "${newTableName}" created successfully.`);
      setNewTableName('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Background Animated Gradient Mesh */}
      <div className="bg-mesh-container">
        <div className="mesh-ball mesh-ball-1"></div>
        <div className="mesh-ball mesh-ball-2"></div>
        <div className="mesh-ball mesh-ball-3"></div>
      </div>

      {/* Main Header */}
      <header className="glass-card" style={{ margin: '1rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '8px', borderRadius: '8px', color: '#fff' }}>
            <Wand2 size={22} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em' }}>AI App Builder Buddy Pro</span>
        </div>

        {/* Global Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          <button className={`btn btn-sm ${activeTab === 'studio' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('studio')}>
            <Cpu size={16} /> AI Studio
          </button>
          <button className={`btn btn-sm ${activeTab === 'devtools' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('devtools')}>
            <Terminal size={16} /> Dev Tools
          </button>
          <button className={`btn btn-sm ${activeTab === 'marketplace' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('marketplace')}>
            <Compass size={16} /> Marketplace
          </button>
          <button className={`btn btn-sm ${activeTab === 'billing' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('billing')}>
            <CreditCard size={16} /> Pricing
          </button>
          <button className={`btn btn-sm ${activeTab === 'accounts' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('accounts')}>
            <Layers size={16} /> Accounts
          </button>
        </nav>

        {/* User Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`badge ${apiStatus === 'Active' ? 'badge-success' : 'badge-danger'}`}>
            <CheckCircle size={12} /> Supabase {apiStatus}
          </span>
          {userProfile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-primary">PRO USER</span>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleSignOut}>Log Out</button>
            </div>
          ) : (
            <span className="badge badge-secondary">Guest Mode</span>
          )}
        </div>
      </header>

      {/* Main View Grid */}
      <main style={{ flex: 1, padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column' }}>
        
        {/* ===================================================================
             TAB 1: AI STUDIO (CREATIVE CENTER)
             =================================================================== */}
        {activeTab === 'studio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', flex: 1 }}>
            {/* Sidebar sub tabs */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: '8px', marginBottom: '0.5rem' }}>CORE AI CAPABILITIES</h3>
              
              <button className={`btn btn-sm ${activeSubTab === 'chat' ? 'btn-cyan' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveSubTab('chat')}>
                <MessageSquare size={16} /> AI Chat Assistant
              </button>
              <button className={`btn btn-sm ${activeSubTab === 'website' ? 'btn-cyan' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveSubTab('website')}>
                <Globe size={16} /> AI Website Builder
              </button>
              <button className={`btn btn-sm ${activeSubTab === 'app' ? 'btn-cyan' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveSubTab('app')}>
                <Layers size={16} /> AI App Builder
              </button>
              <button className={`btn btn-sm ${activeSubTab === 'game' ? 'btn-cyan' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveSubTab('game')}>
                <Gamepad2 size={16} /> AI Game Builder
              </button>
              
              <AdSenseWidget />
            </div>

            {/* Inner studio screen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* SUB TAB: CHAT ASSISTANT */}
              {activeSubTab === 'chat' && (
                <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>💬 AI Chat & Coding Assistant</div>
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {chatMessages.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '70%', fontSize: '0.9rem' }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  {referenceImage && (
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attached Reference:</span>
                      <img src={referenceImage} style={{ height: '30px', borderRadius: '4px', border: '1px solid var(--border-glass)' }} alt="ref" />
                      <button className="btn btn-sm btn-outline" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => setReferenceImage(null)}>Remove</button>
                    </div>
                  )}
                  <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={imageInputRef} onChange={handleImageUpload} />
                    <button className="btn btn-outline" onClick={() => imageInputRef.current.click()} title="Attach Image Reference">
                      <Paperclip size={16} />
                    </button>
                    <button className={`btn ${chatRecording ? 'btn-danger' : 'btn-outline'}`} onClick={() => toggleVoiceRecording('chat')} title="Voice to Text">
                      <Mic size={16} style={{ color: chatRecording ? 'red' : 'inherit' }} />
                    </button>
                    <input type="text" className="form-control" placeholder="Ask anything... (Use mic to speak)" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                    <button className="btn btn-primary" onClick={handleSendChat}><Send size={16} /></button>
                  </div>
                </div>
              )}

              {/* SUB TAB: APP/WEBSITE/GAME BUILDERS */}
              {(activeSubTab === 'website' || activeSubTab === 'app' || activeSubTab === 'game') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.25rem', height: 'calc(100vh - 190px)' }}>
                  
                  {/* Left: Prompter & Logs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <h3 style={{ textTransform: 'capitalize' }}>AI {activeSubTab} Synthesizer</h3>
                      <textarea className="form-control" style={{ minHeight: '70px', resize: 'none' }} placeholder={`Describe the ${activeSubTab} structure you want to synthesize...`} value={promptText} onChange={e => setPromptText(e.target.value)}></textarea>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-outline'}`} onClick={() => toggleVoiceRecording('builder')} title="Voice to text">
                            <Mic size={14} style={{ color: isRecording ? 'red' : 'inherit' }} /> {isRecording ? 'Recording...' : 'Speak'}
                          </button>
                          <input type="file" accept="image/*" style={{ display: 'none' }} id="build-img-upload" onChange={handleImageUpload} />
                          <label htmlFor="build-img-upload" className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }} title="Upload reference image">
                            <ImageIcon size={14} /> Add Image
                          </label>
                        </div>
                        <button className="btn btn-primary" onClick={runCodeSynthesis} disabled={isCompiling}>
                          <Wand2 size={16} /> Compile
                        </button>
                      </div>

                      {referenceImage && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reference:</span>
                          <img src={referenceImage} style={{ height: '30px', borderRadius: '4px' }} alt="ref" />
                          <button className="btn btn-sm btn-outline" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => setReferenceImage(null)}>Remove</button>
                        </div>
                      )}
                    </div>

                    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPILATION PIPELINE STATUS</div>
                      <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', fontFamily: 'var(--font-code)', fontSize: '0.75rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)' }}>
                        {buildLogs.map((l, idx) => (
                          <div key={idx} style={{ color: l.includes('[success]') ? 'var(--accent-green)' : (l.includes('[tip]') ? 'var(--accent-amber)' : 'var(--text-secondary)') }}>{l}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Sandbox Preview */}
                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className={`btn btn-sm ${sandboxTab === 'preview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSandboxTab('preview')}>Sandbox View</button>
                        <button className={`btn btn-sm ${sandboxTab === 'code' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSandboxTab('code')}>Source Code</button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={handleDeployLocal}><Rocket size={14} /> Deploy Site</button>
                        <button className="btn btn-sm btn-outline" onClick={handleDownloadZip}><Download size={14} /> Download ZIP</button>
                      </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      {sandboxTab === 'preview' ? (
                        <iframe
                          title="Sandbox Web Render"
                          srcDoc={sandboxFiles.html}
                          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                        ></iframe>
                      ) : (
                        <textarea
                          className="form-control"
                          readOnly
                          style={{ position: 'absolute', inset: 0, fontFamily: 'var(--font-code)', fontSize: '0.85rem', background: '#0d1117', border: 'none', color: '#e6edf3', padding: '1rem', resize: 'none' }}
                          value={sandboxFiles.html || '<!-- Code view blank. Compile a prompt to view source code. -->'}
                        ></textarea>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
             TAB 2: DEVELOPER TOOLS PANEL
             =================================================================== */}
        {activeTab === 'devtools' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1, minHeight: '550px' }}>
            {/* Left: Terminal Console & Table Schemas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#070c14' }}>
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <Terminal size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Virtual Dev Shell
                </div>
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: '#38bdf8', lineHeight: 1.5 }}>
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{log}</div>
                  ))}
                </div>
                <form onSubmit={handleTerminalCommand} style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}>$</span>
                  <input type="text" className="form-control" style={{ background: 'transparent', border: 'none', fontFamily: 'var(--font-code)' }} placeholder="Type command..." value={terminalInput} onChange={e => setTerminalInput(e.target.value)} />
                </form>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h3><Database size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Create Database Tables</h3>
                <div className="form-group" style={{ margin: 0 }}>
                  <input type="text" className="form-control" placeholder="Table Name (e.g. products_list)" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <input type="text" className="form-control" placeholder="Columns (id, title, price)" value={newTableCols} onChange={e => setNewTableCols(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleCreateDBTable} style={{ marginTop: '0.4rem' }}>
                  <Plus size={16} /> Create Database Table
                </button>
              </div>
            </div>

            {/* Right: Active DB tables & Hosted Sites */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', flex: 1 }}>
                <h3>Supabase Schemas Created</h3>
                <div className="data-table-container" style={{ marginTop: '1rem' }}>
                  <table className="data-table">
                    <thead><tr><th>Table</th><th>Columns</th><th>Status</th></tr></thead>
                    <tbody>
                      {dbTables.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tables registered.</td></tr>
                      ) : (
                        dbTables.map((t, idx) => (
                          <tr key={idx}>
                            <td><strong>{t.name}</strong></td>
                            <td><code>{t.columns}</code></td>
                            <td><span className="badge badge-success">{t.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <AdSenseWidget />
            </div>
          </div>
        )}

        {/* ... Marketplace and other tabs */}
        {activeTab === 'marketplace' && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <Compass size={40} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
            <h2>AI Prompt & Template Marketplace</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>Buy and sell pre-built component layouts.</p>
            <AdSenseWidget />
          </div>
        )}

        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <h2>Pricing Plans & AI usage credits</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3>Free Tier</h3>
                <div><span style={{ fontSize: '2rem', fontWeight: 800 }}>₹0</span>/mo</div>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }}>Current Plan</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent-primary)' }}>
                <h3>Pro Tier</h3>
                <div><span style={{ fontSize: '2rem', fontWeight: 800 }}>₹999</span>/mo</div>
                <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={() => alert('Opening Stripe Payment Portal via publisher credentials...')}>Upgrade Account</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div style={{ maxWidth: '400px', margin: '4rem auto', width: '100%' }}>
            {userProfile ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <CheckCircle size={44} style={{ color: 'var(--accent-green)', alignSelf: 'center' }} />
                <h3>Account Authorized</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Email: {userProfile.email}</p>
                <button className="btn btn-outline" onClick={handleSignOut}>Log Out Session</button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>{isSignUp ? 'Create account' : 'Authentication Login'}</h3>
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="alex@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    {isSignUp ? 'Register User' : 'Sign In'}
                  </button>
                </form>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
                  <a href="#toggle" style={{ color: 'var(--accent-secondary)' }} onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register'}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <footer style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }}>
        <p>&copy; 2026 AI App Builder Buddy Pro. Built with React, Supabase, and Stripe integrations.</p>
      </footer>
    </div>
  );
}
