import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, X, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Photography');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatusMsg('Extracting 512-D color tensor & projecting...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);

    try {
      const res = await fetch('/api/vision/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
        onSuccess();
        onClose();
        setFile(null);
        setPreview(null);
        setTitle('');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to project image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="neo-glass rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <h2 className="text-sm font-medium text-slate-100 uppercase tracking-wider">
              Project Image to Latent Universe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Image Drag / Select Area */}
          <div className="border border-dashed border-white/15 rounded-2xl p-4 text-center bg-black/25 hover:border-cyan-400/40 transition-colors">
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="hidden"
              id="image-file-input"
            />
            <label htmlFor="image-file-input" className="cursor-pointer block">
              {preview ? (
                <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden border border-white/15 mb-2 shadow-lg">
                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="py-4">
                  <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                  <span className="text-xs font-normal text-slate-300 block">
                    Select an Image (JPG, PNG, WebP)
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Extracts color histograms & spatial vectors into 3D
                  </span>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Title / Artwork Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyberpunk Alley at Midnight"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Cluster Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Synthwave, Abstract 3D, Landscapes"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
            />
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
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                Extract Features & Project to 3D
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
