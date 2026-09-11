import React, { useState } from 'react';
import { Roadmap, User, RevisionImage } from '../types';
import { 
  getOverallProgress, 
  getAllStudyItems, 
  getRoadmapProgress 
} from '../utils/calculations';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Image as ImageIcon, 
  Plus, 
  Map, 
  CheckCircle,
  RotateCcw,
  ChevronRight,
  Upload,
  Calendar
} from 'lucide-react';

interface StudySpaceViewProps {
  roadmaps: Roadmap[];
  currentUser: User;
  revisionImages: RevisionImage[];
  onToggleSubtopic: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onOpenRoadmap: (roadmapId: string) => void;
  onOpenAddRoadmap: () => void;
  onOpenRevisionImages: (filterRoadmapId?: string, filterTopicId?: string) => void;
  onOpenImageViewer: (image: RevisionImage) => void;
}

// Circular progress meter matching designed image
const ProgressRing: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 48 }) => {
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
      <span className="absolute text-[10px] font-bold font-mono text-neutral-900">
        {percentage}%
      </span>
    </div>
  );
};

export const StudySpaceView: React.FC<StudySpaceViewProps> = ({
  roadmaps,
  currentUser,
  revisionImages,
  onToggleSubtopic,
  onOpenRoadmap,
  onOpenAddRoadmap,
  onOpenRevisionImages,
  onOpenImageViewer,
}) => {
  const overall = getOverallProgress(roadmaps, currentUser.id);
  const allItems = getAllStudyItems(roadmaps, currentUser.id);

  // Dynamic greeting based on time of day matching designed image
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // What I have studied / completed
  const completedItems = allItems.filter((i) => i.isCompleted);

  // What remains to complete
  const remainingItems = allItems.filter((i) => !i.isCompleted);

  // What I should study (immediate next uncompleted items)
  const nextUpItems = remainingItems.slice(0, 6);

  // Primary active item
  const currentActiveItem = nextUpItems[0] || null;

  // Topics list for revision cards
  const allTopicsWithRoadmap = roadmaps.flatMap((r) =>
    r.topics.map((t) => ({
      roadmapId: r.id,
      roadmapTitle: r.title,
      topic: t,
      images: revisionImages.filter((img) => img.roadmapId === r.id && img.topicId === t.id),
    }))
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner matching designed image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {getGreeting()}, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
            Discipline today | Keep learning. Progress is progress. A better tomorrow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {roadmaps.length > 0 && (
            <button
              id="study-space-add-roadmap-btn"
              onClick={onOpenAddRoadmap}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* When no roadmaps exist: clean empty state per Section 2 & FR-19 */}
      {roadmaps.length === 0 ? (
        <div 
          id="study-space-empty-state"
          className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-4">
            <BookOpen className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Your Study Space is ready
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1.5 mb-6">
            Create your first roadmap to organize your topics, track progress dynamically, and revise with study notes.
          </p>
          <button
            id="create-first-roadmap-study-space-btn"
            onClick={onOpenAddRoadmap}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Roadmap</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Roadmap Cards Row (Circular Progress Meters matching design image) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold px-1">
              <span>My Active Roadmaps</span>
              <span>{roadmaps.length} total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {roadmaps.map((rm) => {
                const stats = getRoadmapProgress(rm, currentUser.id);
                return (
                  <div
                    key={rm.id}
                    id={`roadmap-card-${rm.id}`}
                    onClick={() => onOpenRoadmap(rm.id)}
                    className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-neutral-900 transition-all cursor-pointer shadow-xs flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <h3 className="text-sm font-bold text-neutral-900 truncate group-hover:text-neutral-950">
                        {rm.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {stats.completed}/{stats.total} subtopics
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-neutral-400 group-hover:text-neutral-900 transition-colors">
                        View Roadmap ›
                      </span>
                    </div>

                    <ProgressRing percentage={stats.percentage} size={48} />
                  </div>
                );
              })}

              {/* Add Roadmap Action Card */}
              <button
                type="button"
                onClick={onOpenAddRoadmap}
                className="bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-400 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Roadmap</span>
              </button>
            </div>
          </div>

          {/* Main Multi-Column Interactive Dashboard matching design layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: CONTINUE LEARNING (Matching design) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-800" />
                    <h2 className="text-sm font-bold text-neutral-900">
                      Continue Learning
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {remainingItems.length} left
                  </span>
                </div>

                {/* Primary Next Active Card */}
                {currentActiveItem ? (
                  <div className="p-4 rounded-xl bg-neutral-900 text-white shadow-sm mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                      Up Next to Study
                    </span>
                    <h3 className="text-base font-bold mt-1 leading-snug">
                      {currentActiveItem.subtopic.title}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      {currentActiveItem.roadmapTitle} › {currentActiveItem.topicTitle}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() =>
                          onToggleSubtopic(
                            currentActiveItem.roadmapId,
                            currentActiveItem.topicId,
                            currentActiveItem.subtopic.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Studied</span>
                      </button>

                      <button
                        onClick={() => onOpenRoadmap(currentActiveItem.roadmapId)}
                        className="text-xs font-semibold text-white hover:underline flex items-center gap-1"
                      >
                        <span>Open Topic</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-emerald-800">
                      All topics completed!
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Add more topics or revise with revision cards.
                    </p>
                  </div>
                )}

                {/* Upcoming Queue */}
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Upcoming Queue
                </h4>
                {nextUpItems.length <= 1 ? (
                  <p className="text-xs text-neutral-400 italic py-2">
                    No further upcoming topics queued.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {nextUpItems.slice(1).map((item) => (
                      <div
                        key={item.subtopic.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              onToggleSubtopic(item.roadmapId, item.topicId, item.subtopic.id)
                            }
                            className="text-neutral-300 hover:text-emerald-600 transition-colors shrink-0"
                            title="Mark completed"
                          >
                            <Circle className="w-3.5 h-3.5" />
                          </button>
                          <div className="truncate">
                            <div className="font-semibold text-neutral-900 truncate">
                              {item.subtopic.title}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {item.roadmapTitle}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenRoadmap(item.roadmapId)}
                          className="text-neutral-400 hover:text-neutral-900 shrink-0 p-1"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Click circle to check off items</span>
                <span className="font-mono">{remainingItems.length} remaining</span>
              </div>
            </div>

            {/* COLUMN 2: WHAT I HAVE STUDIED & SYLLABUS (Matching design) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-neutral-900">
                      What I Have Studied
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {completedItems.length} studied
                  </span>
                </div>

                {completedItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    <CheckCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-medium text-neutral-700">No completed items yet</p>
                    <p className="mt-1 max-w-xs mx-auto">
                      Mark subtopics completed as you study to see your record here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {completedItems.map((item) => (
                      <div
                        key={item.subtopic.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              onToggleSubtopic(item.roadmapId, item.topicId, item.subtopic.id)
                            }
                            className="text-emerald-600 hover:text-neutral-400 transition-colors shrink-0"
                            title="Mark uncompleted"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <div className="truncate">
                            <span className="font-medium text-neutral-800 line-through truncate block">
                              {item.subtopic.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate block">
                              {item.roadmapTitle} › {item.topicTitle}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                          Done
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Total completed</span>
                <span className="font-mono font-semibold text-neutral-800">{completedItems.length} items</span>
              </div>
            </div>

            {/* COLUMN 3: TODAY'S REVISION / RECENT NOTES & IMAGES (Matching design mockup) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-neutral-800" />
                    <h2 className="text-sm font-bold text-neutral-900">
                      Today's Revision
                    </h2>
                  </div>
                  <button
                    onClick={() => onOpenRevisionImages()}
                    className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900"
                  >
                    View All ›
                  </button>
                </div>

                {/* Uploaded Revision Diagrams / Cheatsheet Thumbnails */}
                {revisionImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {revisionImages.slice(0, 4).map((img) => (
                        <div
                          key={img.id}
                          onClick={() => onOpenImageViewer(img)}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer shadow-xs hover:border-neutral-900 transition-all"
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 p-2 flex flex-col justify-end">
                            <span className="text-[10px] font-semibold text-white truncate">
                              {img.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-neutral-400 text-center">
                      Click any thumbnail to open the large image viewer.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-neutral-700">
                      No revision images uploaded yet
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 mb-3">
                      Upload diagrams, charts, or handwritten notes for quick revision.
                    </p>
                    <button
                      onClick={() => onOpenRevisionImages()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Notes Image</span>
                    </button>
                  </div>
                )}

                {/* Revision Topics List */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Topic Revision Cards
                  </h4>
                  {allTopicsWithRoadmap.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">No roadmap topics yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {allTopicsWithRoadmap.slice(0, 4).map(({ roadmapId, roadmapTitle, topic, images }) => (
                        <div
                          key={topic.id}
                          onClick={() => onOpenRoadmap(roadmapId)}
                          className="flex items-center justify-between p-2 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-neutral-900 truncate block">
                              {topic.title}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {roadmapTitle} · {topic.subtopics.length} subtopics
                            </span>
                          </div>
                          {images.length > 0 && (
                            <span className="text-[10px] bg-neutral-100 font-mono text-neutral-600 px-1.5 py-0.5 rounded shrink-0">
                              {images.length} imgs
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                <span className="text-neutral-500">Ready for revision</span>
                <button
                  onClick={() => onOpenRevisionImages()}
                  className="font-semibold text-neutral-900 hover:underline"
                >
                  Revision Gallery ›
                </button>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: PROGRESS OVERVIEW (Matching bottom right of design image) */}
          <div 
            id="progress-overview-section"
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 mb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Overall Learning Track
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Progress Overview
                </h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-neutral-900">
                  {overall.percentage}%
                </span>
                <span className="text-xs text-neutral-500">
                  ({overall.completed}/{overall.total} completed)
                </span>
              </div>
            </div>

            {/* Horizontal progress bar for every roadmap matching mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmaps.map((rm) => {
                const rmStats = getRoadmapProgress(rm, currentUser.id);
                return (
                  <div
                    key={rm.id}
                    onClick={() => onOpenRoadmap(rm.id)}
                    className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between font-semibold text-neutral-900 mb-1.5">
                      <span className="truncate pr-2 group-hover:underline">
                        {rm.title}
                      </span>
                      <span className="font-mono text-neutral-800 shrink-0">
                        {rmStats.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rmStats.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-400">
                      <span>{rmStats.completed} of {rmStats.total} subtopics</span>
                      <span className="text-neutral-500 font-medium">Open roadmap ›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
