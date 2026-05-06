import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Info, TrendingUp, X } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
}

export default function KnowledgeCenter({ 
  visible, 
  onClose,
  data
}: { 
  visible: boolean; 
  onClose: () => void;
  data: NewsItem[] 
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="absolute inset-x-12 top-24 bottom-32 bg-[#0a0a0c]/90 border border-cyan-500/20 rounded-3xl backdrop-blur-2xl z-50 p-8 flex flex-col shadow-[0_0_50px_rgba(34,211,238,0.1)]"
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Newspaper size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Canal de Inteligencia Global</h2>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Flujo Neuronal Verificado // Acceso en Vivo</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
            <div className="space-y-4 overflow-y-auto pr-4 scrollbar-hide">
              <h3 className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp size={12} /> Inteligencia de Alta Prioridad
              </h3>
              {data.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2">
                    <span className="group-hover:text-cyan-400 transition-colors uppercase">{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 leading-snug group-hover:text-white transition-colors">
                    {item.title}
                  </h4>
                </motion.div>
              ))}
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[60px] rounded-full" />
               <h3 className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Resumen Neuronal
               </h3>
               <p className="text-sm text-gray-400 leading-relaxed font-light">
                  El panorama geopolítico actual se está desplazando hacia una gobernanza de IA descentralizada. Los análisis sugieren un aumento del 12% en la eficiencia energética de la computación cuántica. Jarvis está monitoreando tres posibles anomalías en el nodo del Pacífico Sur.
               </p>
               <div className="mt-auto p-4 border border-white/5 bg-black/40 rounded-xl">
                  <div className="text-[9px] text-cyan-700 font-mono mb-2 uppercase">Recomendación del Núcleo</div>
                  <div className="text-[11px] text-gray-300 italic">"Mantenga las defensas proactivas. Las claves de cifrado cuántico deben rotarse en las próximas 4 horas, señor."</div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
