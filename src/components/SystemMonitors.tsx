import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Database, Activity } from 'lucide-react';

export default function SystemMonitors({ currentModel }: { currentModel?: string }) {
  const modelLabel = currentModel ? currentModel.toUpperCase().replace('GEMINI-', '') : '1.5-FLASH';
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl flex flex-col gap-6">
      <h3 className="text-[11px] uppercase tracking-tighter text-cyan-500 font-bold mb-2 flex items-center gap-2">
        <Activity size={12} /> Monitor de Recursos
      </h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-[10px] mb-1 font-mono">
            <span>CARGA NEURONAL</span>
            <span className="text-cyan-400">14%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '14%' }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }} className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] mb-1 font-mono">
            <span>MEMORIA RAM</span>
            <span className="text-cyan-400">4.2 GB</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-blue-500" />
          </div>
        </div>

        <div>
           <div className="pt-4 border-t border-white/5">
            <div className="text-[10px] text-gray-500 uppercase mb-3 font-mono">Sub-módulos Activos</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 border border-white/10 rounded text-[9px] text-center font-mono opacity-60">VISION_V5</div>
              <div className="p-2 bg-white/5 border border-cyan-400/30 rounded text-[9px] text-center font-mono text-cyan-400 glow-text">VOCAL_SYN</div>
              <div className="p-2 bg-white/5 border border-cyan-400/30 rounded text-[9px] text-center font-mono text-cyan-400">GEMINI_{modelLabel}</div>
              <div className="p-2 bg-white/5 border border-white/10 rounded text-[9px] text-center font-mono opacity-60">GEO_LOC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
