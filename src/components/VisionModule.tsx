import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Maximize2, ShieldCheck, Zap } from 'lucide-react';

export default function VisionModule({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let internalStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        internalStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          // Ensure video plays
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn("Autoplay blocked, waiting for interaction", e);
          }
        }
      } catch (err) {
        console.error("Acceso a hardware de visión denegado:", err);
      }
    };

    if (active) {
      startCamera();
    } else if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    return () => {
      if (internalStream) {
        internalStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active]);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => setIsScanning(prev => !prev), 2000);
      return () => clearInterval(interval);
    }
  }, [active]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl flex flex-col gap-4 overflow-hidden relative">
      <h3 className="text-[11px] uppercase tracking-tighter text-cyan-500 font-bold flex items-center gap-2">
        <Camera size={12} /> Motor de Visión v5.0
      </h3>
      
      <div className="aspect-video bg-black/60 rounded border border-white/5 relative overflow-hidden group">
        {/* CRT Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
            <Zap size={32} className="animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Hardware Desconectado</span>
          </div>
        )}

        {/* HUD Overlay */}
        {stream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 animate-pulse pointer-events-none">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400">REC [●] 60FPS</div>
            <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-400">SCAN: ACTIVADO</div>
            
            <div className="w-48 h-48 border border-cyan-400/20 rounded relative">
               <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
               <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
               
               {/* Scan Line */}
               {isScanning && (
                 <motion.div 
                   initial={{ top: 0 }}
                   animate={{ top: '100%' }}
                   transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                   className="absolute left-0 right-0 h-0.5 bg-cyan-400/50 shadow-[0_0_10px_#22d3ee]"
                 />
               )}
            </div>
            
            <div className="absolute bottom-2 font-mono text-[9px] text-cyan-400 tracking-widest flex items-center gap-2">
              <ShieldCheck size={10} /> OBJETIVO IDENTIFICADO: USUARIO_MAESTRO
            </div>
          </div>
        )}
      </div>

      {!stream && active && (
        <p className="text-[9px] text-red-400 font-mono italic animate-pulse">
           Error de Permisos: Interfaz de hardware restringida por el protocolo de seguridad.
        </p>
      )}
    </div>
  );
}
