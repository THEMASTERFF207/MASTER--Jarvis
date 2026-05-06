import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
   Mic, MicOff, Settings, Newspaper, 
  ShieldCheck, Activity, Cpu as CpuIcon, 
  LogOut, ChevronRight, Globe, Mail, Cloud, Music, Search,
  Bot, Youtube, Map as MapIcon, Database, Book,
  Send, Zap, Wind, Key, X
} from 'lucide-react';
import VisionModule from './components/VisionModule';
import KnowledgeCenter from './components/KnowledgeCenter';
import { askJarvis } from './services/geminiService';
import canvasConfetti from 'canvas-confetti';

// --- Types ---
interface Skill {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

interface CommandLog {
  type: 'user' | 'jarvis';
  text: string;
  time: string;
}

const VoiceVisualizer = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-16 z-[100] pointer-events-none"
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [10, Math.random() * 60 + 20, 10] }}
            transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
            className="w-1.5 bg-cyan-500/80 rounded-full shadow-[0_0_15px_#22d3ee]"
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [visionActive, setVisionActive] = useState(false);
  const [knowledgeCenterOpen, setKnowledgeCenterOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('jarvis-settings');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      model: 'gemini-3-flash-preview'
    };
  });

  useEffect(() => {
    localStorage.setItem('jarvis-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const timer = setTimeout(() => setModelsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: 'user' | 'jarvis', text: string) => {
    setLogs(prev => [...prev, { 
      type, 
      text, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }].slice(-50));
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = async (customCmd?: string) => {
    const input = customCmd || commandInput;
    if (!input.trim()) return;

    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      speak("Jefe, necesito la llave neuronal para arrancar. Por favor, póngala en ajustes.");
      return;
    }

    setCommandInput('');
    addLog('user', input);
    setIsProcessing(true);

    try {
      const history = logs.map(l => ({ role: l.type === 'user' ? 'user' : 'model', text: l.text }));
      const result = await askJarvis(input, history, settings.apiKey, settings.model);
      
      if (result.text) {
        addLog('jarvis', result.text);
        speak(result.text);
      }

      if (result.functionCalls) {
        for (const call of result.functionCalls) {
          const { name, args } = call;
          
          if (name === 'open_youtube') {
            window.open('https://youtube.com', '_blank');
            addLog('jarvis', "[COMANDO] YouTube abierto satisfactoriamente.");
          } else if (name === 'search_youtube') {
            const query = (args as any).query;
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
            addLog('jarvis', `[INTEL] Buscando video: ${query}`);
          } else if (name === 'send_whatsapp') {
            const { phone, message } = args as any;
            const url = phone 
              ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
              : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            addLog('jarvis', "[ENLACE] Canal de WhatsApp establecido.");
          } else if (name === 'send_email') {
            const { to, subject, body } = args as any;
            const mailto = `mailto:${to || ''}?subject=${encodeURIComponent(subject || 'Mensaje de JARVIS')}&body=${encodeURIComponent(body)}`;
            window.open(mailto, '_self');
            addLog('jarvis', "[PROTOCOLO] Redactando comunicación vía SMTP.");
          } else if (name === 'get_weather') {
            const loc = (args as any).location;
            window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(loc)}`, '_blank');
            addLog('jarvis', `[SENSORES] Clima en ${loc} obtenido.`);
          } else if (name === 'search_maps') {
            const q = (args as any).query;
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank');
            addLog('jarvis', `[GEOLOC] Ubicando destino: ${q}`);
          } else if (name === 'control_home_device') {
            const { device, action } = args as any;
            addLog('jarvis', `[DOMÓTICA] Dispositivo '${device}' -> Accion: ${action.toUpperCase()}.`);
          } else if (name === 'execute_system_command') {
            const systemCmd = (args as any).command;
            switch(systemCmd) {
              case 'clear_logs':
                setLogs([]);
                addLog('jarvis', "[SEGURIDAD] Historial neuronal depurado.");
                break;
              case 'toggle_vision':
                setVisionActive(prev => !prev);
                break;
              case 'toggle_intel':
                setKnowledgeCenterOpen(prev => !prev);
                break;
              case 'scan_system':
                addLog('jarvis', "[SCAN] CPU: 12% | RAM: 4.2GB | Optimizado.");
                break;
              case 'shutdown':
                setIsAuthenticated(false);
                break;
              case 'maximize_ui':
                document.documentElement.requestFullscreen?.();
                break;
            }
          }
        }
      }
    } catch (error) {
      addLog('jarvis', "Error en el enlace neuronal. Verifique su API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const authenticate = () => {
    setIsAuthenticating(true);
    speak("Iniciando escaneo biométrico. Quédese tranquilo, jefe.");
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsAuthenticated(true);
      canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      speak("Acceso concedido. Klk jefe, ¿qué hacemo hoy?");
    }, 3000);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // logic for speech recognition would go here if implemented
    } else {
      setIsListening(true);
      speak("Le escucho, jefe. Hable claro.");
      // dummy timeout to simulate end of speech
      setTimeout(() => setIsListening(false), 5000);
    }
  };

  const skills: Skill[] = [
    { id: 'chat', name: 'Chat Táctico', icon: <Bot size={20} />, description: 'Diálogo Directo', action: () => setIsChatMode(!isChatMode) },
    { id: 'maps', name: 'Navegación', icon: <MapIcon size={20} />, description: 'Módulo de Ubicación', action: () => handleCommand("Busca mi ubicación actual") },
    { id: 'vision', name: 'Módulo Óptico', icon: <Search size={20} />, description: 'Visión V3', action: () => setVisionActive(!visionActive) },
    { id: 'media', name: 'Media Hub', icon: <Youtube size={20} />, description: 'Acceso YouTube', action: () => window.open('https://youtube.com', '_blank') },
  ];

  const newsData = [
    { title: "Eficiencia cuántica al 90%", source: "TECH_RD", time: "2M AGO" },
    { title: "Nuevos protocolos de IA", source: "SDQ_HUB", time: "15M AGO" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center font-light relative overflow-hidden cortex-grid">
        <div className="scanline opacity-10 pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 mx-auto bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
            <CpuIcon size={48} className={isAuthenticating ? 'text-cyan-400 animate-spin' : 'text-gray-500'} />
            <div className="absolute inset-0 border border-cyan-400/20 group-hover:border-cyan-400/50 transition-colors" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-[0.3em] uppercase glow-text">Jarvis <span className="text-cyan-400">RD</span></h1>
            <p className="text-gray-500 font-mono text-[9px] tracking-widest uppercase">Protocolo de Verificación Dominicana</p>
          </div>

          <button 
            onClick={authenticate}
            disabled={!modelsLoaded}
            className={`px-12 py-4 font-black uppercase tracking-[0.3em] text-xs rounded-none transition-all transform hover:scale-105 active:scale-95 border border-cyan-500/30 ${
              modelsLoaded 
              ? 'bg-transparent text-cyan-400 hover:bg-cyan-500 hover:text-black' 
              : 'text-gray-600 border-gray-800'
            }`}
          >
            {modelsLoaded ? 'Dime a ver, Jefe' : 'Sincronizando Moca...'}
          </button>
          
          <div className="pt-8 opacity-20">
             <VisionModule active={isAuthenticating} />
          </div>
        </div>
        
        <footer className="absolute bottom-8 text-[8px] text-gray-700 font-mono tracking-widest uppercase flex items-center gap-2">
          <span>República Dominicana</span> • <span>Santo Domingo</span> • <span>Sistemas Estables</span>
        </footer>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-[#050507] text-[#e0e0e0] font-sans flex flex-col overflow-hidden relative selection:bg-cyan-500/30 font-light cortex-grid transition-all duration-700 ${visionActive ? 'bg-blue-900/10' : ''}`}>
      <div className="scanline opacity-10 pointer-events-none" />
      
      {/* HUD HEADER */}
      <div className="fixed top-4 left-4 right-4 flex justify-between z-50 pointer-events-none">
        <div className="flex gap-3">
          <div className="hud-panel animate-pulse-subtle">
            <div className="text-[7px] opacity-40">System Node</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]"></div>
              <span>DOM_CORTEX_PRO</span>
            </div>
          </div>
          <div className="hud-panel hidden sm:block">
            <div className="text-[7px] opacity-40">Uptime</div>
            <div>{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <div className="hud-panel border-red-500/20">
          <div className="text-[7px] opacity-40 text-red-500">Master Session</div>
          <div className="text-red-400/80">ACCESO CONCEDIDO</div>
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl glass p-8 rounded-2xl relative z-10 border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tighter glow-text uppercase">Cortex Config</h2>
                  <p className="text-gray-500 text-xs font-mono">Panel de Control de Inteligencia Central</p>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Llave Neuronal (Gemini API Key)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="password" 
                      value={settings.apiKey}
                      onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                      placeholder="AIza..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Modelo de Procesamiento</label>
                  <select 
                    value={settings.model}
                    onChange={(e) => setSettings({...settings, model: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all font-mono appearance-none"
                  >
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative z-10 pt-16">
        {/* Main Interface */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
          
          {/* Status Header */}
          <header className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-cyan-500/20 flex items-center justify-center overflow-hidden glass">
                    <motion.div 
                      animate={{ 
                        scale: isProcessing ? [1, 1.4, 1] : 1,
                        opacity: isProcessing ? [0.6, 1, 0.6] : 0.2
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-10 h-10 rounded-full bg-cyan-500 shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-4 border-black rounded-full" />
              </div>
              <div>
                <h2 className="font-bold text-sm uppercase tracking-[0.3em] glow-text">Jarvis RD</h2>
                <p className="text-[10px] text-cyan-400/50 font-mono">CONECTADO • SANTO DOMINGO, DN</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 glass-hover rounded-full text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <Settings size={22} />
            </button>
          </header>

          {/* Interactive Area */}
          <main className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
            <div className="flex-1 flex flex-col overflow-hidden glass rounded-3xl border border-white/5 relative">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8">
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Bot size={64} className="text-cyan-500/20" />
                    <p className="text-sm font-mono tracking-widest uppercase">Esperando instrucciones, Jefe</p>
                  </div>
                )}
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] space-y-1.5 ${log.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`text-[8px] font-mono text-gray-600 uppercase tracking-widest px-2`}>
                        {log.type === 'user' ? 'Master' : 'Jarvis'} • {log.time}
                      </div>
                      <div className={`px-6 py-4 text-[15px] leading-relaxed shadow-lg ${
                        log.type === 'user' 
                        ? 'bg-cyan-600/10 border border-cyan-500/20 text-white rounded-l-2xl rounded-tr-2xl' 
                        : 'bg-white/5 border border-white/5 text-cyan-50/90 rounded-r-2xl rounded-tl-2xl'
                      }`}>
                        {log.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                     <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[9px] font-mono uppercase tracking-widest ml-2 text-gray-500">Procesando...</span>
                     </div>
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
              
              {/* Input Control */}
              <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner">
                  <button 
                    onClick={toggleListening}
                    className={`p-4 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'bg-white/5 text-gray-500 hover:text-cyan-400'}`}
                  >
                    {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  
                  <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                    placeholder={isListening ? "Le escucho atentamente..." : "Dime a ver, ¿qué hacemo?"} 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3 placeholder:text-gray-700 font-light"
                  />
                  
                  <button 
                    onClick={() => handleCommand()}
                    disabled={!commandInput.trim() || isProcessing}
                    className="p-4 bg-cyan-600 text-black rounded-xl hover:bg-cyan-500 transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    <Send size={22} />
                  </button>
                </div>
                
                <div className="mt-4 flex justify-center gap-6 text-[9px] font-mono text-gray-700 uppercase tracking-widest">
                   <div className="flex items-center gap-1.5">
                     <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                     <span>Enlace Seguro</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                     <span>SDQ.PRO.7</span>
                   </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <VoiceVisualizer active={isListening} />
    </div>
  );
}

