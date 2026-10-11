import React, { useState } from 'react';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Deep Learning');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setStatusMsg('Vectorizing tensor...');
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, content }),
      });
      if (res.ok) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        onSuccess();
        onClose();
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to inject document');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatusMsg('Decomposing document chunks...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onSuccess();
        onClose();
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('File upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="neo-glass rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
            <h2 className="text-sm font-medium text-slate-100 uppercase tracking-wider">
              Inject Entity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 bg-black/30 p-1 rounded-2xl mb-4 text-xs font-medium border border-white/5">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'text'
                ? 'neo-glass text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Direct Input
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'neo-glass text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {activeTab === 'text' ? (
          <form onSubmit={handleTextSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FlashAttention-2 Algorithm"
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                Cluster Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="Deep Learning">Deep Learning</option>
                <option value="Distributed Systems">Distributed Systems</option>
                <option value="Computer Graphics">Computer Graphics</option>
                <option value="Quantum Computing">Quantum Computing</option>
                <option value="Neuroscience">Neuroscience</option>
                <option value="Custom Research">Custom Research</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                Abstract / Paragraph
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Technical contents for vector embedding projection..."
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none font-light"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 neo-glass-active text-cyan-300 hover:text-white rounded-xl text-xs font-medium tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMsg}
                </>
              ) : (
                'Project to Universe'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileUpload} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                Cluster Category Tag
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. LLM Research"
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div className="border border-dashed border-white/15 rounded-2xl p-5 text-center bg-black/20 hover:border-cyan-400/30 transition-colors">
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-1.5 opacity-80" />
                <span className="text-xs font-normal text-slate-300 block">
                  {file ? file.name : 'Select text or markdown file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Auto-chunks into latent nodes
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full py-2.5 neo-glass-active disabled:opacity-40 text-cyan-300 hover:text-white rounded-xl text-xs font-medium tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMsg}
                </>
              ) : (
                'Decompose & Project'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
