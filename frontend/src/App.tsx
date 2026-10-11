import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Sparkles, Image as ImageIcon, FileText } from 'lucide-react';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { SearchBar } from './components/SearchBar';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { AddNodeModal } from './components/AddNodeModal';
import { AddImageModal } from './components/AddImageModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import type { ClusterGraphResponse, ClusterNode } from './types';

export const App: React.FC = () => {
  const [mode, setMode] = useState<'vision' | 'text'>('vision');
  const [graphData, setGraphData] = useState<ClusterGraphResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [reductionMethod, setReductionMethod] = useState<'tsne' | 'pca' | 'umap'>('tsne');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.38);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  const fetchGraph = useCallback(
    async (
      activeMode = mode,
      method = reductionMethod,
      threshold = similarityThreshold
    ) => {
      setLoading(true);
      try {
        const url =
          activeMode === 'vision'
            ? `/api/vision/graph?method=${method}&threshold=${threshold}`
            : `/api/graph?method=${method}&threshold=${threshold}`;

        const res = await fetch(url);
        if (res.ok) {
          const data: ClusterGraphResponse = await res.json();
          setGraphData(data);
          if (selectedNode) {
            const updated = data.nodes.find((n) => n.id === selectedNode.id);
            setSelectedNode(updated || null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch graph:', err);
      } finally {
        setLoading(false);
      }
    },
    [mode, reductionMethod, similarityThreshold, selectedNode]
  );

  useEffect(() => {
    fetchGraph(mode, reductionMethod, similarityThreshold);
  }, [mode]);

  const handleModeSwitch = (newMode: 'vision' | 'text') => {
    if (newMode === mode) return;
    setMode(newMode);
    setSelectedNode(null);
    setActiveCategory(null);
  };

  const handleMethodChange = (newMethod: 'tsne' | 'pca' | 'umap') => {
    setReductionMethod(newMethod);
    fetchGraph(mode, newMethod, similarityThreshold);
  };

  const handleThresholdChange = (newThreshold: number) => {
    setSimilarityThreshold(newThreshold);
    fetchGraph(mode, reductionMethod, newThreshold);
  };

  const handleClearSlate = async () => {
    setLoading(true);
    try {
      const url = mode === 'vision' ? '/api/vision/clear' : '/api/clear';
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        setSelectedNode(null);
        setActiveCategory(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    try {
      const url = mode === 'vision' ? '/api/vision/load-sample' : '/api/load-sample';
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        setSelectedNode(null);
        setActiveCategory(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSearchResult = (nodeId: string) => {
    if (!graphData) return;
    const target = graphData.nodes.find((n) => n.id === nodeId);
    if (target) {
      setSelectedNode(target);
    }
  };

  const highlightedIds = useMemo(() => {
    if (!activeCategory || !graphData) return new Set<string>();
    return new Set(
      graphData.nodes
        .filter((n) => n.category === activeCategory)
        .map((n) => n.id)
    );
  }, [activeCategory, graphData]);

  return (
    <div className="relative w-screen h-screen bg-[#030407] overflow-hidden flex flex-col">
      {/* Minimal Floating Header */}
      <header className="absolute top-4 left-6 right-6 h-12 neo-glass rounded-full px-5 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-cyan-400 animate-ping' : 'bg-cyan-400'}`} />
            <h1 className="text-xs font-medium tracking-wider uppercase text-white">
              NeuroFlow
            </h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-full border border-white/5 text-[10px] ml-2">
            <button
              onClick={() => handleModeSwitch('vision')}
              className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                mode === 'vision'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ImageIcon className="w-2.5 h-2.5" />
              <span>Vision</span>
            </button>
            <button
              onClick={() => handleModeSwitch('text')}
              className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                mode === 'text'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText className="w-2.5 h-2.5" />
              <span>Text</span>
            </button>
          </div>
        </div>

        {/* Minimal Search Capsule */}
        <SearchBar
          onSelectResult={handleSelectSearchResult}
          nodes={graphData?.nodes || []}
        />

        {/* Action Button */}
        <div>
          <button
            onClick={() => {
              if (mode === 'vision') setIsAddImageModalOpen(true);
              else setIsAddTextModalOpen(true);
            }}
            className="neo-glass-pill px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>{mode === 'vision' ? 'Upload' : 'Add'}</span>
          </button>
        </div>
      </header>

      {/* 3D Visualizer Canvas */}
      <main className="flex-1 w-full h-full relative">
        {graphData ? (
          <>
            <GraphCanvas
              nodes={graphData.nodes}
              edges={graphData.edges}
              selectedNode={selectedNode}
              highlightedIds={highlightedIds}
              onSelectNode={(node) => setSelectedNode(node)}
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
              mode={mode}
            />

            {/* Clean Slate Empty State */}
            {graphData.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="neo-glass rounded-2xl p-6 max-w-xs text-center pointer-events-auto border border-white/5">
                  <div className="w-8 h-8 rounded-xl neo-glass-subtle mx-auto flex items-center justify-center mb-2.5 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-medium text-slate-200 mb-1">
                    Empty Manifold
                  </h3>
                  <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3.5">
                    {mode === 'vision'
                      ? 'Upload images to project 512-D color tensors into 3D.'
                      : 'Inject text notes to construct semantic clusters in 3D.'}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        if (mode === 'vision') setIsAddImageModalOpen(true);
                        else setIsAddTextModalOpen(true);
                      }}
                      className="flex-1 py-1.5 neo-glass-active text-cyan-300 hover:text-white rounded-lg text-[10px] uppercase tracking-wider transition-all"
                    >
                      + {mode === 'vision' ? 'Upload' : 'Add'}
                    </button>
                    <button
                      onClick={handleLoadSample}
                      className="py-1.5 px-3 neo-glass-pill text-slate-400 hover:text-slate-200 rounded-lg text-[10px] transition-all"
                    >
                      Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400 mb-2 opacity-60" />
            <span className="text-[11px] font-light tracking-wide">
              Initializing...
            </span>
          </div>
        )}

        {/* Minimal Control Panel */}
        <ControlPanel
          stats={graphData?.stats || null}
          reductionMethod={reductionMethod}
          similarityThreshold={similarityThreshold}
          onMethodChange={handleMethodChange}
          onThresholdChange={handleThresholdChange}
          onClear={handleClearSlate}
          onLoadSample={handleLoadSample}
          onOpenArchitecture={() => setIsArchModalOpen(true)}
        />

        {/* Category Pills (Bottom Left) */}
        {graphData && graphData.nodes.length > 0 && (
          <div className="absolute left-6 bottom-8 z-30 flex flex-wrap gap-1 max-w-lg neo-glass rounded-xl p-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] transition-all ${
                activeCategory === null
                  ? 'neo-glass-active font-medium'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All ({graphData.nodes.length})
            </button>
            {graphData.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] transition-all ${
                  activeCategory === cat
                    ? 'neo-glass-active font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Inspector Drawer */}
        <NodeDetailDrawer
          node={selectedNode}
          allNodes={graphData?.nodes || []}
          onClose={() => setSelectedNode(null)}
          onSelectNeighbor={(neighbor) => setSelectedNode(neighbor)}
        />
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="absolute bottom-2 left-6 right-6 h-6 flex items-center justify-between text-[10px] text-slate-600 z-40 pointer-events-none font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          WebGL
        </span>
        <span className="pointer-events-auto text-slate-500">
          Developed by S. M. Mahmud Iqbal
        </span>
        <button
          onClick={() => setIsArchModalOpen(true)}
          className="pointer-events-auto hover:text-slate-400 transition-colors"
        >
          Docs
        </button>
      </footer>

      {/* Modals */}
      <AddImageModal
        isOpen={isAddImageModalOpen}
        onClose={() => setIsAddImageModalOpen(false)}
        onSuccess={() => fetchGraph(mode)}
      />
      <AddNodeModal
        isOpen={isAddTextModalOpen}
        onClose={() => setIsAddTextModalOpen(false)}
        onSuccess={() => fetchGraph(mode)}
      />
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};

export default App;
