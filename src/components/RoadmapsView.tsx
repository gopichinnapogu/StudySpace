import React, { useState } from 'react';
import { Roadmap, User } from '../types';
import { getRoadmapProgress } from '../utils/calculations';
import { Plus, Map, ArrowRight, Layers, CheckCircle2, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { EditRoadmapModal } from './EditRoadmapModal';

interface RoadmapsViewProps {
  roadmaps: Roadmap[];
  currentUser: User;
  onOpenRoadmap: (roadmapId: string) => void;
  onOpenAddRoadmapModal: () => void;
  onDeleteRoadmap: (roadmapId: string) => void;
  onUpdateRoadmap?: (roadmapId: string, title: string, description?: string) => void;
}

// Circular progress meter matching designed image
const ProgressRing: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 44 }) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="text-neutral-100"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="text-neutral-900 transition-all duration-500 ease-out"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
        />
      </svg>
      <span className="absolute text-[9px] font-bold font-mono text-neutral-900">
        {percentage}%
      </span>
    </div>
  );
};

export const RoadmapsView: React.FC<RoadmapsViewProps> = ({
  roadmaps,
  currentUser,
  onOpenRoadmap,
  onOpenAddRoadmapModal,
  onDeleteRoadmap,
  onUpdateRoadmap,
}) => {
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Study Roadmaps
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Personal learning tracks for {currentUser.name}. Each roadmap synchronizes your learning progress.
          </p>
        </div>

        <button
          id="add-roadmap-top-button"
          onClick={onOpenAddRoadmapModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Roadmap</span>
        </button>
      </div>

      {/* When no roadmaps exist: Clean Empty State per Section 2 & FR-19 */}
      {roadmaps.length === 0 ? (
        <div 
          id="empty-roadmaps-state"
          className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-4">
            <Map className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            No roadmaps created yet for {currentUser.name}
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1.5 mb-6">
            StudySpace starts completely clean with your own personal roadmaps. Create your first roadmap to define what you will study and track.
          </p>
          <button
            id="empty-state-add-roadmap-btn"
            onClick={onOpenAddRoadmapModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Roadmap</span>
          </button>
        </div>
      ) : (
        /* Roadmap list with synchronized progress */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.map((roadmap) => {
            const stats = getRoadmapProgress(roadmap, currentUser.id);
            const topicCount = roadmap.topics.length;

            return (
              <div
                key={roadmap.id}
                id={`roadmap-card-${roadmap.id}`}
                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 
                          onClick={() => onOpenRoadmap(roadmap.id)}
                          className="font-semibold text-neutral-900 hover:text-neutral-700 cursor-pointer text-base leading-snug truncate"
                        >
                          {roadmap.title}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {topicCount} {topicCount === 1 ? 'topic' : 'topics'} · {stats.total} total {stats.total === 1 ? 'subtopic' : 'subtopics'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ProgressRing percentage={stats.percentage} size={38} />
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onUpdateRoadmap && (
                          <button
                            id={`edit-roadmap-card-${roadmap.id}`}
                            onClick={() => setEditingRoadmap(roadmap)}
                            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Edit roadmap"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          id={`delete-roadmap-${roadmap.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete roadmap "${roadmap.title}"?`)) {
                              onDeleteRoadmap(roadmap.id);
                            }
                          }}
                          className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Delete roadmap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {roadmap.description && (
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                      {roadmap.description}
                    </p>
                  )}

                  {/* Synchronized Progress for Roadmap (Section 8) */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-neutral-700">
                        Progress ({currentUser.name})
                      </span>
                      <span className="font-semibold text-neutral-900 font-mono">
                        {stats.completed} / {stats.total} ({stats.percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    {stats.completed === stats.total && stats.total > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span>{stats.total - stats.completed} remaining</span>
                    )}
                  </span>

                  <button
                    id={`open-roadmap-btn-${roadmap.id}`}
                    onClick={() => onOpenRoadmap(roadmap.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700 transition-colors"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Roadmap Modal */}
      {onUpdateRoadmap && (
        <EditRoadmapModal
          isOpen={Boolean(editingRoadmap)}
          roadmap={editingRoadmap}
          onClose={() => setEditingRoadmap(null)}
          onSave={(rId, updatedTitle, updatedDesc) => {
            onUpdateRoadmap(rId, updatedTitle, updatedDesc);
            setEditingRoadmap(null);
          }}
        />
      )}
    </div>
  );
};
