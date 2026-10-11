import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import type { GraphStats } from '../types';

interface ControlPanelProps {
  stats: GraphStats | null;
  reductionMethod: 'tsne' | 'pca' | 'umap';
  similarityThreshold: number;
  onMethodChange: (method: 'tsne' | 'pca' | 'umap') => void;
  onThresholdChange: (threshold: number) => void;
  onClear: () => void;
  onLoadSample: () => void;
  onOpenArchitecture: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  stats,
  reductionMethod,
  similarityThreshold,
  onMethodChange,
  onThresholdChange,
  onClear,
  onLoadSample,
  onOpenArchitecture,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute left-6 top-20 z-30 w-64 transition-all">
      <div className="neo-glass rounded-2xl p-3.5 text-slate-300">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400 opacity-80" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Engine
            </span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-3">
            {/* Manifold Dimension Buttons */}
            <div>
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-500 mb-1.5">
                <span>Manifold</span>
                <span className="text-cyan-400 font-mono">{reductionMethod}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                {(['tsne', 'pca', 'umap'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => onMethodChange(m)}
                    className={`py-1 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all ${
                      reductionMethod === m
                        ? 'neo-glass-active font-semibold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold Slider */}
            <div>
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                <span>Synapses</span>
                <span className="text-cyan-400 font-mono">{similarityThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.75"
                step="0.02"
                value={similarityThreshold}
                onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                className="w-full h-0.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Telemetry Minimal Line */}
            {stats && (
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-white/5">
                <span>{stats.totalNodes} nodes</span>
                <span>{stats.totalEdges} edges</span>
                <span>{stats.featureDimensions}D</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onClear}
                className="py-1 px-2 neo-glass-pill rounded-lg text-[10px] text-slate-400 hover:text-rose-300 transition-all text-center"
              >
                Clear
              </button>
              <button
                onClick={onLoadSample}
                className="py-1 px-2 neo-glass-pill rounded-lg text-[10px] text-cyan-300 hover:text-cyan-200 transition-all text-center"
              >
                Demo
              </button>
            </div>

            <button
              onClick={onOpenArchitecture}
              className="w-full text-center text-[9px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest pt-0.5"
            >
              Pipeline Docs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
