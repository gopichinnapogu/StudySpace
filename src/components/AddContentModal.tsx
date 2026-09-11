import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, ListPlus } from 'lucide-react';

interface AddContentModalProps {
  isOpen: boolean;
  roadmapTitle: string;
  onClose: () => void;
  onAddContent: (mainTopicTitle: string, subtopics: string[], description?: string) => void;
}

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  roadmapTitle,
  onClose,
  onAddContent,
}) => {
  const [topicTitle, setTopicTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>(['']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddSubtopicField = () => {
    setSubtopics((prev) => [...prev, '']);
  };

  const handleSubtopicChange = (index: number, val: string) => {
    setSubtopics((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveSubtopic = (index: number) => {
    if (subtopics.length <= 1) {
      setSubtopics(['']);
      return;
    }
    setSubtopics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === subtopics.length - 1) {
        handleAddSubtopicField();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      setError('Please enter the main heading / topic name');
      return;
    }

    const cleanSubtopics = subtopics.map((s) => s.trim()).filter(Boolean);
    if (cleanSubtopics.length === 0) {
      setError('Please add at least one subtopic');
      return;
    }

    onAddContent(topicTitle.trim(), cleanSubtopics, description.trim() || undefined);
    setTopicTitle('');
    setDescription('');
    setSubtopics(['']);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="add-content-modal"
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Add Content</h2>
              <p className="text-xs text-neutral-500">Add to roadmap: <span className="font-medium text-neutral-700">{roadmapTitle}</span></p>
            </div>
          </div>
          <button
            id="close-add-content-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Main Topic */}
          <div>
            <label htmlFor="topic-heading-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Main Heading / Main Topic Name *
            </label>
            <input
              id="topic-heading-input"
              type="text"
              autoFocus
              value={topicTitle}
              onChange={(e) => {
                setTopicTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Distributed Caching, Binary Search Trees, React Server Components"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="topic-notes-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Brief Overview / Focus Goal (Optional)
            </label>
            <input
              id="topic-notes-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Understand cache invalidation and write-through vs write-back"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          {/* Subtopics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Subtopics to Master *
              </label>
              <span className="text-[11px] text-neutral-400">
                Press Enter to add next
              </span>
            </div>

            <div className="space-y-2">
              {subtopics.map((sub, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-xs font-mono text-neutral-400 w-5 text-right shrink-0">
                    {index + 1}.
                  </div>
                  <input
                    id={`subtopic-input-${index}`}
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubtopicChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder={`Subtopic ${index + 1} (e.g. Cache Invalidation Patterns)`}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtopic(index)}
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Remove subtopic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              id="add-subtopic-row-button"
              type="button"
              onClick={handleAddSubtopicField}
              className="mt-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Subtopic</span>
            </button>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-content-button"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Save to Roadmap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
