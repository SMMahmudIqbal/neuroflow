import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { SearchResult, ClusterNode } from '../types';
import { soundFX } from '../utils/sound';

interface SearchBarProps {
  onSelectResult: (nodeId: string, coords: [number, number, number]) => void;
  nodes: ClusterNode[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), topK: 5 }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    soundFX.playWarp();
    onSelectResult(result.id, result.coordinates);
    setIsOpen(false);
  };

  return (
    <div className="relative w-64 md:w-80 z-40">
      <form onSubmit={handleSearch}>
        <div className="neo-glass-subtle rounded-full flex items-center px-3 py-1.5 transition-all focus-within:border-white/15">
          <Search className="w-3 h-3 text-slate-500 mr-2 opacity-60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search latent space..."
            className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none"
          />
          {loading && <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />}
        </div>
      </form>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-10 left-0 right-0 neo-glass rounded-2xl p-2 z-50 max-h-72 overflow-y-auto mt-1 border border-white/5">
          <div className="flex items-center justify-between px-2 py-1 text-[9px] text-slate-500 uppercase tracking-widest border-b border-white/5">
            <span>Coordinates</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[9px] text-slate-500 hover:text-slate-300"
            >
              esc
            </button>
          </div>
          <div className="mt-1 space-y-0.5">
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => handleResultClick(res)}
                className="w-full text-left p-2 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between gap-2 group"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-normal text-slate-200 group-hover:text-cyan-300 truncate">
                    {res.title}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {res.category}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 opacity-70 shrink-0">
                  {(res.score * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
