import React from 'react';
import { Roadmap, User, RevisionImage, Subtopic } from '../types';
import { 
  getAllStudyItems, 
  getRoadmapProgress 
} from '../utils/calculations';
import { 
  CheckCircle2, 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle,
  Upload,
} from 'lucide-react';
import { DarkLearningSheet } from './DarkLearningSheet';

interface StudySpaceViewProps {
  roadmaps: Roadmap[];
  currentUser: User;
  revisionImages: RevisionImage[];
  onToggleSubtopic: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onOpenRoadmap: (roadmapId: string) => void;
  onOpenAddRoadmap: () => void;
  onOpenRevisionImages: (filterRoadmapId?: string, filterTopicId?: string) => void;
  onOpenImageViewer: (image: RevisionImage) => void;
  onOpenNotesModal: (roadmapTitle: string, topicTitle: string, subtopic: Subtopic) => void;
  onToggleStar: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onAddSubtopic: (roadmapId: string, topicId: string, title: string) => void;
  onAddTopic?: (roadmapId: string, title: string) => void;
}

// Circular progress meter for active roadmap cards
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
  onOpenNotesModal,
  onToggleStar,
  onAddSubtopic,
  onAddTopic,
}) => {
  const allItems = getAllStudyItems(roadmaps, currentUser.id);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Completed items
  const completedItems = allItems.filter((i) => i.isCompleted);

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
      {/* Top Welcome Banner */}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* When no roadmaps exist: clean empty state */}
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
            Create your first roadmap (e.g. "Placements" or "DSA") to organize topics like "Two pointers", subtopics like "opposite direction", with theory &amp; algorithms.
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
          {/* Top Roadmap Cards Row with circular progress meters */}
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
                className="bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-400 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Roadmap</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Grid: Black Learning Sheet Tracker on left (7-8 cols), Side cards on right (4-5 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Primary Centerpiece: Dark Syllabus & Sheet Tracker matching user's black image */}
            <div className="xl:col-span-8 space-y-6">
              <DarkLearningSheet
                roadmaps={roadmaps}
                currentUser={currentUser}
                onToggleSubtopic={onToggleSubtopic}
                onOpenNotesModal={onOpenNotesModal}
                onToggleStar={onToggleStar}
                onAddSubtopic={onAddSubtopic}
                onAddTopic={onAddTopic}
                onOpenRoadmap={onOpenRoadmap}
              />
            </div>

            {/* Right Column: What I Have Studied & Today's Revision */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* WHAT I HAVE STUDIED CARD */}
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
                    <div className="py-10 text-center text-xs text-neutral-400">
                      <CheckCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-medium text-neutral-700">No completed items yet</p>
                      <p className="mt-1 max-w-xs mx-auto">
                        Check off subtopics in the syllabus tracker to see your record here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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

              {/* TODAY'S REVISION CARD */}
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
                      className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer"
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
                        Click thumbnail to open large viewer.
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
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
                    className="font-semibold text-neutral-900 hover:underline cursor-pointer"
                  >
                    Revision Gallery ›
                  </button>
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
};
