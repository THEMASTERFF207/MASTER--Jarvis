import React from 'react';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface CommandLog {
  type: 'user' | 'jarvis';
  text: string;
  time: string;
}

export default function TerminalLogs({ logs }: { logs: CommandLog[] }) {
  return (
    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl flex flex-col overflow-hidden">
      <h3 className="text-[11px] uppercase tracking-tighter text-cyan-500 font-bold mb-4 flex items-center gap-2">
        <TerminalIcon size={12} /> Historial de Interfaz Neuronal
      </h3>
      <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] pr-2 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Sistema listo. Esperando enlace neuronal...</div>
        )}
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${log.type === 'user' ? 'text-cyan-400' : 'text-gray-300'} leading-relaxed`}
          >
            <span className="opacity-40 font-bold">[{log.time}]</span> {log.type === 'user' ? '>> ' : 'JARVIS: '}{log.text}
          </motion.div>
        ))}
        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
    </div>
  );
}
