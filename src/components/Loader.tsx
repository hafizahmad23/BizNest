import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Building2, ArrowRight } from 'lucide-react';

interface LoaderProps {
  onComplete?: () => void;
  onFinish?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete, onFinish }) => {
  const [progress, setProgress] = useState(0);

  const handleDone = () => {
    if (onFinish) onFinish();
    if (onComplete) onComplete();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(handleDone, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] text-white overflow-hidden"
    >
      {/* Immersive Background Glowing Spheres */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Animated Immersive Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center">
              <Building2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-emerald-400 text-slate-950 p-1.5 rounded-full text-xs shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-2"
        >
          BizNest Vision
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-1"
        >
          Discover. Connect. Grow.
        </motion.p>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-slate-400 mb-8 font-medium"
        >
          Pakistan’s Digital Business Hub
        </motion.p>

        {/* Immersive Progress Bar */}
        <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden mb-3 p-0.5 border border-white/10 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Initializing Ecosystem...
          </span>
          <span className="font-bold text-emerald-400">{progress}%</span>
        </div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleDone}
          className="mt-8 text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md cursor-pointer"
        >
          <span>Skip Loader</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
