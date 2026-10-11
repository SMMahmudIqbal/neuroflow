import React from 'react';
import { X, Cpu, Database, Network } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="neo-glass rounded-3xl w-full max-w-xl max-h-[85vh] p-6 flex flex-col relative border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <h2 className="text-sm font-medium text-slate-100 uppercase tracking-wider">
              Mathematical Pipeline & Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-slate-300 pr-1">
          {/* Engineering Highlight */}
          <div className="neo-glass-subtle p-3.5 rounded-2xl border border-cyan-500/15">
            <div className="font-medium text-cyan-300 mb-1 text-xs">
              Creative Engineering & 60 FPS WebGL
            </div>
            <p className="leading-relaxed text-slate-400 font-light text-[11px]">
              NeuroFlow bridges Python backend manifold learning with GPU-instanced Three.js shaders. Thousands of high-dimensional nodes are positioned in a single draw call, maintaining 60 FPS across orbit and fly-through transitions.
            </p>
          </div>

          {/* Architecture Pipeline Steps */}
          <div className="space-y-2.5">
            <div className="neo-glass-subtle p-3 rounded-2xl border border-white/5">
              <div className="font-medium text-slate-200 mb-0.5 flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                1. Vector Feature Space
              </div>
              <p className="text-slate-400 leading-relaxed font-light text-[11px]">
                TF-IDF n-gram vectorization with 512 dimensions and stochastic jitter to eliminate coordinate singularities.
              </p>
            </div>

            <div className="neo-glass-subtle p-3 rounded-2xl border border-white/5">
              <div className="font-medium text-slate-200 mb-0.5 flex items-center gap-1.5 text-xs">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                2. Non-Linear Manifold Reduction
              </div>
              <p className="text-slate-400 leading-relaxed font-light text-[11px]">
                Projects high-dimensional space (R^D to R^3) into 3D coordinates (x, y, z) using t-SNE, PCA, or UMAP to preserve semantic neighborhood topology.
              </p>
            </div>

            <div className="neo-glass-subtle p-3 rounded-2xl border border-white/5">
              <div className="font-medium text-slate-200 mb-0.5 flex items-center gap-1.5 text-xs">
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                3. Cosine Synapses & Spatial Audio
              </div>
              <p className="text-slate-400 leading-relaxed font-light text-[11px]">
                Pairwise dot-product similarities generate dynamic synaptic connections, accompanied by procedural Web Audio synthesized feedback.
              </p>
            </div>
          </div>

          {/* Attribution Badge */}
          <div className="pt-3 text-center text-slate-500 font-mono text-[10px] border-t border-white/5 tracking-wider uppercase">
            Developed by S. M. Mahmud Iqbal
          </div>
        </div>
      </div>
    </div>
  );
};
