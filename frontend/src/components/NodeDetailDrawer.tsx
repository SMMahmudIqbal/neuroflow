import React from 'react';
import { X, ArrowUpRight, Cpu, Image as ImageIcon } from 'lucide-react';
import type { ClusterNode } from '../types';
import { soundFX } from '../utils/sound';

interface NodeDetailDrawerProps {
  node: ClusterNode | null;
  allNodes: ClusterNode[];
  onClose: () => void;
  onSelectNeighbor: (node: ClusterNode) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  allNodes,
  onClose,
  onSelectNeighbor,
}) => {
  if (!node) return null;

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const neighbors = node.neighbors
    .map((id) => nodeMap.get(id))
    .filter((n): n is ClusterNode => Boolean(n));

  return (
    <div className="absolute right-6 top-20 bottom-12 w-92 neo-glass rounded-3xl p-6 flex flex-col z-30 overflow-hidden animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 mb-2">
            {node.category}
          </span>
          <h2 className="text-base font-medium text-slate-100 tracking-tight leading-snug">
            {node.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Visual Preview If Image */}
        {node.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 neo-glass-subtle aspect-square relative shadow-lg">
            <img
              src={node.imageUrl}
              alt={node.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5" />
              Visual Embedding Node
            </div>
          </div>
        )}

        {/* Text Abstract if present */}
        {node.summary && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Semantic Representation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light neo-glass-subtle p-3 rounded-2xl border border-white/5">
              {node.summary}
            </p>
          </div>
        )}

        {/* 3D Coordinate Tensor */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-2">
            3D Projected Manifold Coordinates
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="neo-glass-subtle p-2 rounded-xl text-center border border-white/5">
              <span className="text-[9px] text-slate-500 font-mono block">X</span>
              <span className="text-xs font-mono font-medium text-cyan-300">{node.x.toFixed(2)}</span>
            </div>
            <div className="neo-glass-subtle p-2 rounded-xl text-center border border-white/5">
              <span className="text-[9px] text-slate-500 font-mono block">Y</span>
              <span className="text-xs font-mono font-medium text-indigo-300">{node.y.toFixed(2)}</span>
            </div>
            <div className="neo-glass-subtle p-2 rounded-xl text-center border border-white/5">
              <span className="text-[9px] text-slate-500 font-mono block">Z</span>
              <span className="text-xs font-mono font-medium text-purple-300">{node.z.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Synaptic Neighbors */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-2 flex items-center justify-between">
            <span>Visual Cosine Synapses</span>
            <span className="font-mono text-cyan-400">{neighbors.length}</span>
          </div>

          {neighbors.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-3 neo-glass-subtle rounded-xl border border-white/5">
              Isolated visual coordinate.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {neighbors.map((neighbor) => (
                <button
                  key={neighbor.id}
                  onClick={() => {
                    soundFX.playSelect();
                    onSelectNeighbor(neighbor);
                  }}
                  className="w-full text-left p-2 rounded-xl neo-glass-pill transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {neighbor.imageUrl && (
                      <img
                        src={neighbor.imageUrl}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-normal text-slate-200 group-hover:text-cyan-300 truncate">
                        {neighbor.title}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono uppercase">
                        {neighbor.category}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>ID: {node.id}</span>
        <span>Clusters: #{node.clusterId}</span>
      </div>
    </div>
  );
};
