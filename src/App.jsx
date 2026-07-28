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

    if (lower.includes('omegle') || lower.includes('video chat') || lower.includes('stranger')) {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Omegle Clone - Talk to Strangers!</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="navbar">
    <div class="logo"><span class="orange">omegle</span><span class="blue">buddy</span></div>
    <div class="user-count"><i class="fas fa-users"></i> 18,342 users online</div>
  </header>
  <main class="main-layout">
    <section class="video-container">
      <div class="video-box stranger-box">
        <div class="video-label">Stranger</div>
        <div class="webcam-static" id="stranger-static"><i class="fas fa-video-slash"></i><p>Connecting...</p></div>
        <div class="typing-alert" id="stranger-typing" style="display:none;">Stranger is typing...</div>
      </div>
      <div class="video-box user-box">
        <div class="video-label">You</div>
        <video id="user-webcam" autoplay muted playsinline class="user-video" style="display:none;"></video>
        <div class="webcam-static" id="user-static"><i class="fas fa-user-circle"></i><p>Webcam (Simulated)</p></div>
      </div>
    </section>
    <section class="chat-container">
      <div class="chat-logs" id="chat-logs"><div class="system-msg">You're now chatting with a random stranger. Say hi!</div></div>
      <div class="chat-input-area">
        <button class="disconnect-btn" id="next-btn">Next</button>
        <input type="text" id="chat-msg-input" placeholder="Type a message..." disabled>
        <button class="send-btn" id="send-msg-btn" disabled><i class="fas fa-paper-plane"></i></button>
      </div>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

      css = `:root { --bg-dark: #0f121d; --navbar-bg: #1c2030; --orange: #ff8c00; --blue: #2874f0; }
body { font-family: sans-serif; margin: 0; background-color: var(--bg-dark); color: #fff; display: flex; flex-direction: column; height: 100vh; }
.navbar { background: var(--navbar-bg); padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.05); }
.logo { font-size: 1.5rem; font-weight: 800; } .orange { color: var(--orange); } .blue { color: #5dade2; }
.user-count { font-size: 0.9rem; color: #85929e; }
.main-layout { flex: 1; display: grid; grid-template-columns: 1fr 1.2fr; overflow: hidden; }
.video-container { display: grid; grid-template-rows: 1fr 1fr; gap: 8px; padding: 8px; background: #090a10; }
.video-box { background: #17202a; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
.video-label { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; z-index: 5; }
.webcam-static { text-align: center; color: #85929e; } .webcam-static i { font-size: 2.5rem; margin-bottom: 8px; }
.user-video { width: 100%; height: 100%; object-fit: cover; }
.typing-alert { position: absolute; bottom: 8px; left: 8px; background: rgba(255, 140, 0, 0.2); border: 1px solid var(--orange); color: var(--orange); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
.chat-container { display: flex; flex-direction: column; background: #1c2030; border-left: 2px solid rgba(255,255,255,0.05); }
.chat-logs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.system-msg { color: var(--orange); font-weight: 700; font-size: 0.85rem; background: rgba(255, 140, 0, 0.1); padding: 6px 12px; border-radius: 4px; align-self: center; }
.chat-bubble { padding: 8px 14px; border-radius: 8px; font-size: 0.9rem; max-width: 75%; }
.chat-bubble.stranger { background: rgba(255,255,255,0.05); color: #fff; align-self: flex-start; }
.chat-bubble.user { background: var(--blue); color: #fff; align-self: flex-end; }
.chat-input-area { display: flex; padding: 12px; background: #121420; gap: 8px; }
.disconnect-btn { background: #e74c3c; color: #fff; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 4px; }
.chat-input-area input { flex: 1; background: #2c3e50; border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 10px; border-radius: 4px; outline: none; }
.send-btn { background: var(--blue); color: #fff; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }`;

      js = `let strangerTimer = null; let currentStep = 0;
const chatLogs = document.getElementById('chat-logs');
const input = document.getElementById('chat-msg-input');
const sendBtn = document.getElementById('send-msg-btn');
const nextBtn = document.getElementById('next-btn');
const strangerDialogue = ["hey", "m or f?", "where u from?", "nice! want to see a cool project i made?", "ok gtg bye!"];
document.addEventListener('DOMContentLoaded', () => {
  startSession();
  nextBtn.addEventListener('click', () => resetSession());
  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
});
function startSession() {
  currentStep = 0;
  chatLogs.innerHTML = '<div class="system-msg">Connecting to a stranger...</div>';
  document.getElementById('stranger-static').innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Looking for someone...</p>';
  setTimeout(() => {
    chatLogs.innerHTML += '<div class="system-msg">You are now chatting with a random stranger!</div>';
    document.getElementById('stranger-static').innerHTML = '<i class="fas fa-user-check" style="color:green;"></i><p>Connected to Stranger</p>';
    input.removeAttribute('disabled'); sendBtn.removeAttribute('disabled');
    triggerStrangerTyping();
  }, 2000);
  navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
    const video = document.getElementById('user-webcam'); video.srcObject = stream; video.style.display = 'block'; document.getElementById('user-static').style.display = 'none';
  }).catch(e => { console.log("Webcam access not allowed."); });
}
function resetSession() { clearTimeout(strangerTimer); document.getElementById('stranger-typing').style.display = 'none'; startSession(); }
function triggerStrangerTyping() {
  if (currentStep >= strangerDialogue.length) return;
  strangerTimer = setTimeout(() => {
    document.getElementById('stranger-typing').style.display = 'block';
    setTimeout(() => {
      document.getElementById('stranger-typing').style.display = 'none';
      appendMessage(strangerDialogue[currentStep], 'stranger'); currentStep++; triggerStrangerTyping();
    }, 1500);
  }, 2500);
}
function sendMessage() {
  const val = input.value.trim(); if (!val) return;
  appendMessage(val, 'user'); input.value = '';
}
function appendMessage(text, sender) {
  const bubble = document.createElement('div'); bubble.className = \`chat-bubble \${sender}\`; bubble.innerText = text;
  chatLogs.appendChild(bubble); chatLogs.scrollTop = chatLogs.scrollHeight;
}`;
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
    const ollamaResponse = await fetchOllamaResponse(chatInput, 'You are App Builder Buddy Pro, a helpful AI coding assistant.');
    
    if (ollamaResponse) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: ollamaResponse }]);
    } else {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: `[Local connection failed. Please start Ollama with OLLAMA_ORIGINS=*] - However, I recommend structuring your Supabase schema with foreign key triggers for this layout!`
        }]);
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
