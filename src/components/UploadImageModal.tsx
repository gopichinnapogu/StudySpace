import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Roadmap, RevisionImage, User } from '../types';

interface UploadImageModalProps {
  isOpen: boolean;
  roadmaps: Roadmap[];
  currentUser: User;
  onClose: () => void;
  onUpload: (newImage: RevisionImage) => void;
  initialRoadmapId?: string;
  initialTopicId?: string;
}

export const UploadImageModal: React.FC<UploadImageModalProps> = ({
  isOpen,
  roadmaps,
  currentUser,
  onClose,
  onUpload,
  initialRoadmapId,
  initialTopicId,
}) => {
  const [title, setTitle] = useState('');
  const [roadmapId, setRoadmapId] = useState(initialRoadmapId || (roadmaps[0]?.id ?? ''));
  const [topicId, setTopicId] = useState(initialTopicId || '');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentRoadmap = roadmaps.find((r) => r.id === roadmapId);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG, WEBP)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image size should be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setImageUrl(result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl && !imageUrl.trim()) {
      setError('Please upload an image or provide an image link');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for this revision card');
      return;
    }
    if (!roadmapId && roadmaps.length > 0) {
      setError('Please select a roadmap to associate this revision image with');
      return;
    }

    const newImage: RevisionImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      title: title.trim(),
      imageUrl: previewUrl || imageUrl.trim(),
      roadmapId: roadmapId || 'general',
      topicId: topicId || undefined,
      notes: notes.trim() || undefined,
      uploadedBy: currentUser.name,
      uploadedAt: Date.now(),
    };

    onUpload(newImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="upload-revision-image-modal"
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Upload Revision Image</h2>
              <p className="text-xs text-neutral-500">Add diagrams, handwritten notes, or charts for quick visual revision</p>
            </div>
          </div>
          <button
            id="close-upload-image-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Revision Image *
            </label>
            
            {previewUrl ? (
              <div className="relative rounded-xl border border-neutral-200 overflow-hidden group bg-neutral-50 p-2 text-center">
                <img
                  src={previewUrl}
                  alt="Revision preview"
                  className="max-h-48 mx-auto object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setImageUrl('');
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-neutral-900/80 text-white rounded-lg hover:bg-neutral-900 transition-colors text-xs flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-neutral-800">
                  Click to select or drag &amp; drop an image
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  PNG, JPG, SVG, or WEBP up to 8MB
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="revision-title-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Revision Title / Label *
            </label>
            <input
              id="revision-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Memory Layout Diagram, B-Tree Balancing Cheatsheet"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          {/* Associate with Roadmap & Topic */}
          {roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="select-roadmap" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Associate Roadmap *
                </label>
                <select
                  id="select-roadmap"
                  value={roadmapId}
                  onChange={(e) => {
                    setRoadmapId(e.target.value);
                    setTopicId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  {roadmaps.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-topic" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Topic (Optional)
                </label>
                <select
                  id="select-topic"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  <option value="">-- General / Whole Roadmap --</option>
                  {currentRoadmap?.topics.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-100/70 rounded-xl text-xs text-neutral-600">
              No roadmaps created yet. This image will be saved under General Revisions. You can organize it once you create roadmaps.
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="revision-notes-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Key Revision Notes / Formulas (Optional)
            </label>
            <textarea
              id="revision-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember that node rotation depends on balance factor (+2 or -2)"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none"
            />
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
            id="submit-revision-image-button"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload &amp; Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
