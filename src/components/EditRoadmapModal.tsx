import React, { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { Roadmap } from '../types';

interface EditRoadmapModalProps {
  isOpen: boolean;
  roadmap: Roadmap | null;
  onClose: () => void;
  onSave: (roadmapId: string, updatedTitle: string, updatedDescription?: string) => void;
}

export const EditRoadmapModal: React.FC<EditRoadmapModalProps> = ({
  isOpen,
  roadmap,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (roadmap) {
      setTitle(roadmap.title);
      setDescription(roadmap.description || '');
      setError('');
    }
  }, [roadmap, isOpen]);

  if (!isOpen || !roadmap) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a roadmap title');
      return;
    }
    onSave(roadmap.id, title.trim(), description.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="edit-roadmap-modal"
        className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Edit Roadmap</h2>
              <p className="text-xs text-neutral-500">Update roadmap title or description</p>
            </div>
          </div>
          <button
            id="close-edit-roadmap-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-roadmap-title-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Roadmap Title *
            </label>
            <input
              id="edit-roadmap-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Distributed Systems"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
          </div>

          <div>
            <label htmlFor="edit-roadmap-desc-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="edit-roadmap-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Core concepts and implementation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-roadmap-edit-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
