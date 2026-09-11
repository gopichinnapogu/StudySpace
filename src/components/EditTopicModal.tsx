import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Edit3, GripVertical } from 'lucide-react';
import { Topic, Subtopic } from '../types';

interface EditTopicModalProps {
  isOpen: boolean;
  topic: Topic | null;
  onClose: () => void;
  onSave: (topicId: string, updatedTitle: string, updatedDescription: string | undefined, updatedSubtopics: { id: string; title: string; completedByUserIds: string[] }[]) => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({
  isOpen,
  topic,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtopicItems, setSubtopicItems] = useState<{ id: string; title: string; completedByUserIds: string[] }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setDescription(topic.description || '');
      setSubtopicItems(
        topic.subtopics.map((s) => ({
          id: s.id,
          title: s.title,
          completedByUserIds: s.completedByUserIds || [],
        }))
      );
      setError('');
    }
  }, [topic, isOpen]);

  if (!isOpen || !topic) return null;

  const handleSubtopicTitleChange = (index: number, newTitle: string) => {
    setSubtopicItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title: newTitle };
      return copy;
    });
  };

  const handleRemoveSubtopic = (index: number) => {
    if (subtopicItems.length <= 1) {
      setError('A topic must have at least one subtopic');
      return;
    }
    setError('');
    setSubtopicItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubtopic = () => {
    setError('');
    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSubtopicItems((prev) => [
      ...prev,
      { id: newId, title: '', completedByUserIds: [] },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a topic heading');
      return;
    }

    const validSubtopics = subtopicItems
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title.length > 0);

    if (validSubtopics.length === 0) {
      setError('Please provide at least one valid subtopic title');
      return;
    }

    onSave(
      topic.id,
      title.trim(),
      description.trim() || undefined,
      validSubtopics
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="edit-topic-modal"
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Edit Topic &amp; Subtopics</h2>
              <p className="text-xs text-neutral-500">Update main heading or modify already entered subtopics</p>
            </div>
          </div>
          <button
            id="close-edit-topic-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Main Topic Heading */}
          <div>
            <label htmlFor="edit-topic-title" className="block text-xs font-semibold text-neutral-700 mb-1">
              Main Heading / Topic Name *
            </label>
            <input
              id="edit-topic-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Distributed Caching"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="edit-topic-desc" className="block text-xs font-semibold text-neutral-700 mb-1">
              Topic Notes / Goal (Optional)
            </label>
            <input
              id="edit-topic-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Invalidation strategies and Redis patterns"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          {/* Subtopics List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Subtopics ({subtopicItems.length})
              </label>
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subtopic</span>
              </button>
            </div>

            <div className="space-y-2">
              {subtopicItems.map((sub, index) => (
                <div key={sub.id || index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400 w-5 text-right shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    id={`edit-subtopic-input-${index}`}
                    type="text"
                    value={sub.title}
                    onChange={(e) => handleSubtopicTitleChange(index, e.target.value)}
                    placeholder={`Subtopic title...`}
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
            id="save-topic-changes-btn"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
