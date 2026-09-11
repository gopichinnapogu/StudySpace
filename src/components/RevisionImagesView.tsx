import React, { useState } from 'react';
import { Roadmap, RevisionImage, User } from '../types';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Filter, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
  User as UserIcon,
  Search
} from 'lucide-react';

interface RevisionImagesViewProps {
  revisionImages: RevisionImage[];
  roadmaps: Roadmap[];
  currentUser: User;
  onOpenUploadModal: () => void;
  onOpenImageViewer: (image: RevisionImage) => void;
  onDeleteImage: (imageId: string) => void;
  initialRoadmapFilter?: string;
  initialTopicFilter?: string;
}

export const RevisionImagesView: React.FC<RevisionImagesViewProps> = ({
  revisionImages,
  roadmaps,
  currentUser,
  onOpenUploadModal,
  onOpenImageViewer,
  onDeleteImage,
  initialRoadmapFilter = 'all',
  initialTopicFilter = 'all',
}) => {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(initialRoadmapFilter);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId);

  // Filtered list of images
  const filteredImages = revisionImages.filter((img) => {
    if (selectedRoadmapId !== 'all' && img.roadmapId !== selectedRoadmapId) {
      return false;
    }
    if (selectedTopicId !== 'all' && img.topicId !== selectedTopicId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = img.title.toLowerCase().includes(q);
      const matchNotes = img.notes ? img.notes.toLowerCase().includes(q) : false;
      return matchTitle || matchNotes;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Revision Images &amp; Diagrams
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Visual reference materials, cheatsheets, and concept diagrams created outside and saved for revision.
          </p>
        </div>

        <button
          id="upload-image-top-btn"
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Roadmap selector */}
          <select
            id="filter-roadmap-select"
            value={selectedRoadmapId}
            onChange={(e) => {
              setSelectedRoadmapId(e.target.value);
              setSelectedTopicId('all');
            }}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">All Roadmaps</option>
            {roadmaps.map((rm) => (
              <option key={rm.id} value={rm.id}>
                {rm.title}
              </option>
            ))}
          </select>

          {/* Topic selector if a roadmap is selected */}
          {activeRoadmap && activeRoadmap.topics.length > 0 && (
            <select
              id="filter-topic-select"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">All Topics</option>
              {activeRoadmap.topics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.title}
                </option>
              ))}
            </select>
          )}

          {(selectedRoadmapId !== 'all' || selectedTopicId !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRoadmapId('all');
                setSelectedTopicId('all');
                setSearchQuery('');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            id="search-revision-images-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagrams by title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Grid of Revision Images */}
      {revisionImages.length === 0 ? (
        <div 
          id="empty-revision-images-state"
          className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-4">
            <ImageIcon className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            No revision images uploaded yet
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1.5 mb-6">
            Per the StudySpace specification, you can create diagrams or study notes outside and upload them here. Click any image to view full size.
          </p>
          <button
            id="empty-state-upload-img-btn"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Revision Image</span>
          </button>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 text-xs">
          No revision images matched your current filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => {
            const rm = roadmaps.find((r) => r.id === image.roadmapId);
            const topic = rm?.topics.find((t) => t.id === image.topicId);

            return (
              <div
                key={image.id}
                id={`revision-image-card-${image.id}`}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => onOpenImageViewer(image)}
              >
                {/* Visual Thumbnail */}
                <div className="relative h-44 bg-neutral-100 overflow-hidden flex items-center justify-center border-b border-neutral-100">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Click to open large overlay cue */}
                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-xs text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Full Size</span>
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1">
                        {image.title}
                      </h3>
                      <button
                        id={`delete-image-${image.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete revision image "${image.title}"?`)) {
                            onDeleteImage(image.id);
                          }
                        }}
                        className="text-neutral-400 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Roadmap / Topic tag */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-2 truncate">
                      <Tag className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {rm ? rm.title : 'General'} {topic ? `› ${topic.title}` : ''}
                      </span>
                    </div>

                    {image.notes && (
                      <p className="text-xs text-neutral-600 line-clamp-2 italic mb-2">
                        "{image.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>By {image.uploadedBy}</span>
                    <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
