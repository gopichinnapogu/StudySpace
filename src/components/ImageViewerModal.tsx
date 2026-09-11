import React, { useEffect } from 'react';
import { X, ZoomIn, Calendar, User, Tag } from 'lucide-react';
import { RevisionImage } from '../types';

interface ImageViewerModalProps {
  image: RevisionImage | null;
  roadmapTitle?: string;
  topicTitle?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  image,
  roadmapTitle,
  topicTitle,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div 
      id="large-revision-image-viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-[95vh] flex flex-col bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with title and X close button */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900/90 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              {image.title}
            </h3>
            {roadmapTitle && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700 truncate">
                <Tag className="w-3 h-3 text-neutral-400" />
                {roadmapTitle} {topicTitle ? `› ${topicTitle}` : ''}
              </span>
            )}
          </div>
          <button
            id="close-large-image-viewer"
            onClick={onClose}
            aria-label="Close viewer"
            className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Image container */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 flex items-center justify-center bg-neutral-950 min-h-[300px]">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-md select-none"
          />
        </div>

        {/* Bottom metadata details */}
        <div className="px-5 py-3 bg-neutral-900 border-t border-neutral-800 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Uploaded by {image.uploadedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(image.uploadedAt).toLocaleDateString()}
            </span>
          </div>

          {image.notes && (
            <p className="text-neutral-300 text-xs italic max-w-lg truncate">
              "{image.notes}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
