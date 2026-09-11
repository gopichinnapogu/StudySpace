import React, { useState } from 'react';
import { Roadmap, User, Topic, Subtopic } from '../types';
import { getRoadmapProgress } from '../utils/calculations';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ListPlus, 
  Sparkles, 
  Image as ImageIcon,
  BookOpen,
  Edit2,
  Edit3,
  Check,
  X,
  Star,
  FileText
} from 'lucide-react';
import { EditTopicModal } from './EditTopicModal';
import { EditRoadmapModal } from './EditRoadmapModal';

interface RoadmapDetailViewProps {
  roadmap: Roadmap;
  currentUser: User;
  onBack: () => void;
  onToggleSubtopic: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onOpenAddContent: () => void;
  onDeleteTopic: (roadmapId: string, topicId: string) => void;
  onAddSingleSubtopic: (roadmapId: string, topicId: string, title: string) => void;
  onUpdateSubtopic: (roadmapId: string, topicId: string, subtopicId: string, newTitle: string) => void;
  onDeleteSubtopic: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onUpdateTopic: (roadmapId: string, topicId: string, newTitle: string, newDesc?: string, updatedSubtopics?: { id: string; title: string; completedByUserIds: string[] }[]) => void;
  onUpdateRoadmap: (roadmapId: string, title: string, description?: string) => void;
  onOpenRevisionImagesForTopic?: (roadmapId: string, topicId: string) => void;
  onOpenNotesModal?: (roadmapTitle: string, topicTitle: string, subtopic: Subtopic) => void;
  onToggleStar?: (roadmapId: string, topicId: string, subtopicId: string) => void;
}

export const RoadmapDetailView: React.FC<RoadmapDetailViewProps> = ({
  roadmap,
  currentUser,
  onBack,
  onToggleSubtopic,
  onOpenAddContent,
  onDeleteTopic,
  onAddSingleSubtopic,
  onUpdateSubtopic,
  onDeleteSubtopic,
  onUpdateTopic,
  onUpdateRoadmap,
  onOpenRevisionImagesForTopic,
  onOpenNotesModal,
  onToggleStar,
}) => {
  const [inlineSubtopicTitle, setInlineSubtopicTitle] = useState<{ [topicId: string]: string }>({});
  const [addingToTopicId, setAddingToTopicId] = useState<string | null>(null);

  // Editing state for individual subtopic inline
  const [editingSubtopicId, setEditingSubtopicId] = useState<string | null>(null);
  const [editingSubtopicText, setEditingSubtopicText] = useState<string>('');

  // Editing state for modal (entire topic + subtopics)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isEditRoadmapOpen, setIsEditRoadmapOpen] = useState<boolean>(false);

  // Synchronized dynamic progress
  const progress = getRoadmapProgress(roadmap, currentUser.id);

  const handleInlineAdd = (topicId: string) => {
    const text = inlineSubtopicTitle[topicId]?.trim();
    if (!text) return;
    onAddSingleSubtopic(roadmap.id, topicId, text);
    setInlineSubtopicTitle((prev) => ({ ...prev, [topicId]: '' }));
    setAddingToTopicId(null);
  };

  const startEditingSubtopic = (sub: Subtopic) => {
    setEditingSubtopicId(sub.id);
    setEditingSubtopicText(sub.title);
  };

  const handleSaveSubtopicEdit = (topicId: string, subId: string) => {
    const trimmed = editingSubtopicText.trim();
    if (trimmed) {
      onUpdateSubtopic(roadmap.id, topicId, subId, trimmed);
    }
    setEditingSubtopicId(null);
    setEditingSubtopicText('');
  };

  const handleCancelSubtopicEdit = () => {
    setEditingSubtopicId(null);
    setEditingSubtopicText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="back-to-roadmaps-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Roadmaps</span>
        </button>

        <button
          id="edit-roadmap-btn"
          onClick={() => setIsEditRoadmapOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Roadmap Title</span>
        </button>
      </div>

      {/* Roadmap Header & Synchronized Progress Bar (Section 7 & 8) */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                Roadmap
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {roadmap.title}
              </h1>
              <button
                onClick={() => setIsEditRoadmapOpen(true)}
                className="text-neutral-400 hover:text-neutral-800 p-1 rounded hover:bg-neutral-100 transition-colors"
                title="Edit title or description"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            {roadmap.description && (
              <p className="text-sm text-neutral-500 mt-1">
                {roadmap.description}
              </p>
            )}
          </div>

          <button
            id="header-add-content-btn"
            onClick={onOpenAddContent}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Content</span>
          </button>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="mt-6 pt-5 border-t border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-neutral-700">
              Progress for {currentUser.name}
            </span>
            <span className="font-mono text-neutral-900 font-bold">
              {progress.completed} of {progress.total} subtopics completed ({progress.percentage}%)
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-neutral-900 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Empty Topics State */}
      {roadmap.topics.length === 0 ? (
        <div 
          id="roadmap-empty-topics-state"
          className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 text-center"
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-3">
            <ListPlus className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-neutral-900">
            No topics in this roadmap yet
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
            Add your main learning headings and subtopics. As you complete them, the roadmap progress will dynamically update.
          </p>
          <button
            id="empty-roadmap-add-content-btn"
            onClick={onOpenAddContent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Content (Heading &amp; Subtopics)</span>
          </button>
        </div>
      ) : (
        /* List of Main Topics */
        <div className="space-y-4">
          {roadmap.topics.map((topic, topicIdx) => {
            const topicCompletedCount = topic.subtopics.filter((s) =>
              s.completedByUserIds && s.completedByUserIds.includes(currentUser.id)
            ).length;
            const topicTotalCount = topic.subtopics.length;
            const isAllCompleted = topicTotalCount > 0 && topicCompletedCount === topicTotalCount;

            return (
              <div
                key={topic.id}
                id={`topic-card-${topic.id}`}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs transition-all"
              >
                {/* Topic Header with Edit Action */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center font-mono text-xs font-semibold text-neutral-700 shrink-0 mt-0.5">
                      {topicIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-neutral-900">
                          {topic.title}
                        </h3>
                        {isAllCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono text-neutral-400 mr-1">
                      {topicCompletedCount}/{topicTotalCount}
                    </span>
                    <button
                      id={`edit-topic-btn-${topic.id}`}
                      onClick={() => setEditingTopic(topic)}
                      className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Edit topic and subtopics"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-topic-${topic.id}`}
                      onClick={() => {
                        if (confirm(`Remove topic "${topic.title}" and its subtopics?`)) {
                          onDeleteTopic(roadmap.id, topic.id);
                        }
                      }}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtopics Checklist with Inline Editing capability */}
                <div className="mt-3 space-y-2">
                  {topic.subtopics.map((sub) => {
                    const isDone = Boolean(sub.completedByUserIds && sub.completedByUserIds.includes(currentUser.id));
                    const isEditingThis = editingSubtopicId === sub.id;

                    if (isEditingThis) {
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2 p-2 rounded-xl border border-neutral-900 bg-neutral-50/50 shadow-xs"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editingSubtopicText}
                            onChange={(e) => setEditingSubtopicText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSubtopicEdit(topic.id, sub.id);
                              if (e.key === 'Escape') handleCancelSubtopicEdit();
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                            placeholder="Subtopic title..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSubtopicEdit(topic.id, sub.id)}
                            className="p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelSubtopicEdit}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={sub.id}
                        id={`subtopic-item-${sub.id}`}
                        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all select-none ${
                          isDone
                            ? 'bg-neutral-50/70 border-neutral-200 text-neutral-500'
                            : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40 text-neutral-800'
                        }`}
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => onToggleSubtopic(roadmap.id, topic.id, sub.id)}
                        >
                          <button
                            type="button"
                            aria-label={isDone ? 'Mark uncompleted' : 'Mark completed'}
                            className="text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                            )}
                          </button>
                          <span className={`text-xs sm:text-sm font-medium ${isDone ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                            {sub.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {/* Notes, Theory & Algorithm trigger */}
                          {onOpenNotesModal && (
                            <button
                              id={`notes-subtopic-${sub.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenNotesModal(roadmap.title, topic.title, sub);
                              }}
                              className={`p-1 rounded transition-colors flex items-center gap-1 text-xs ${
                                (sub.theory || sub.algorithm || sub.notes)
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 font-medium'
                                  : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                              }`}
                              title="View & Edit Notes, Theory, Algorithm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {(sub.theory || sub.algorithm) && (
                                <span className="text-[10px] hidden sm:inline">Notes</span>
                              )}
                            </button>
                          )}

                          {/* Star for Revision */}
                          {onToggleStar && (
                            <button
                              id={`star-subtopic-${sub.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(roadmap.id, topic.id, sub.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                sub.isStarred
                                  ? 'text-amber-500 fill-amber-500 hover:text-amber-600'
                                  : 'text-neutral-300 hover:text-amber-400 hover:bg-neutral-100'
                              }`}
                              title={sub.isStarred ? 'Starred for revision' : 'Star for revision'}
                            >
                              <Star className={`w-3.5 h-3.5 ${sub.isStarred ? 'fill-amber-400' : ''}`} />
                            </button>
                          )}

                          <span className="text-[11px] text-neutral-400 font-mono">
                            {isDone ? 'Studied' : 'Pending'}
                          </span>

                          {/* Quick Edit Subtopic Action */}
                          <button
                            id={`edit-subtopic-${sub.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingSubtopic(sub);
                            }}
                            className="text-neutral-400 hover:text-neutral-900 p-1 rounded hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit subtopic title"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete Subtopic Action */}
                          <button
                            id={`delete-subtopic-${sub.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (topic.subtopics.length <= 1) {
                                alert('A topic must retain at least one subtopic. To delete the entire topic, use the topic delete button above.');
                                return;
                              }
                              if (confirm(`Remove subtopic "${sub.title}"?`)) {
                                onDeleteSubtopic(roadmap.id, topic.id, sub.id);
                              }
                            }}
                            className="text-neutral-400 hover:text-red-500 p-1 rounded hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete subtopic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline add subtopic trigger */}
                {addingToTopicId === topic.id ? (
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <input
                      type="text"
                      autoFocus
                      value={inlineSubtopicTitle[topic.id] || ''}
                      onChange={(e) =>
                        setInlineSubtopicTitle((prev) => ({ ...prev, [topic.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineAdd(topic.id);
                        if (e.key === 'Escape') setAddingToTopicId(null);
                      }}
                      placeholder="Enter new subtopic name..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineAdd(topic.id)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingToTopicId(null)}
                      className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAddingToTopicId(topic.id)}
                        className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add subtopic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTopic(topic)}
                        className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit topic &amp; subtopics</span>
                      </button>
                    </div>

                    {onOpenRevisionImagesForTopic && (
                      <button
                        type="button"
                        onClick={() => onOpenRevisionImagesForTopic(roadmap.id, topic.id)}
                        className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Revision cards</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Section 6: "Every roadmap has an Add Content action at the bottom" */}
      <div className="pt-2">
        <button
          id="bottom-add-content-action-button"
          onClick={onOpenAddContent}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50/60 text-neutral-700 hover:text-neutral-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all group"
        >
          <Plus className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900" />
          <span>Add Content to {roadmap.title}</span>
        </button>
      </div>

      {/* Edit Topic Modal */}
      <EditTopicModal
        isOpen={Boolean(editingTopic)}
        topic={editingTopic}
        onClose={() => setEditingTopic(null)}
        onSave={(topicId, updatedTitle, updatedDesc, updatedSubs) => {
          onUpdateTopic(roadmap.id, topicId, updatedTitle, updatedDesc, updatedSubs);
          setEditingTopic(null);
        }}
      />

      {/* Edit Roadmap Modal */}
      <EditRoadmapModal
        isOpen={isEditRoadmapOpen}
        roadmap={roadmap}
        onClose={() => setIsEditRoadmapOpen(false)}
        onSave={(rId, updatedTitle, updatedDesc) => {
          onUpdateRoadmap(rId, updatedTitle, updatedDesc);
          setIsEditRoadmapOpen(false);
        }}
      />
    </div>
  );
};
