import React, { useState } from 'react';
import { Roadmap, Topic, Subtopic, User } from '../types';
import { 
  ChevronDown, 
  ChevronRight, 
  Square, 
  CheckSquare, 
  Play, 
  FileText, 
  Youtube, 
  PlusCircle, 
  Star, 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DarkLearningSheetProps {
  roadmaps: Roadmap[];
  currentUser: User;
  onToggleSubtopic: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onOpenNotesModal: (roadmapTitle: string, topicTitle: string, subtopic: Subtopic) => void;
  onToggleStar: (roadmapId: string, topicId: string, subtopicId: string) => void;
  onAddSubtopic: (roadmapId: string, topicId: string, title: string) => void;
  onAddTopic?: (roadmapId: string, title: string) => void;
  onOpenRoadmap?: (roadmapId: string) => void;
}

export const DarkLearningSheet: React.FC<DarkLearningSheetProps> = ({
  roadmaps,
  currentUser,
  onToggleSubtopic,
  onOpenNotesModal,
  onToggleStar,
  onAddSubtopic,
  onAddTopic,
  onOpenRoadmap,
}) => {
  // Expanded accordions: track open roadmap IDs and topic IDs
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Record<string, boolean>>(() => {
    // By default, expand all roadmaps
    const map: Record<string, boolean> = {};
    roadmaps.forEach((r) => {
      map[r.id] = true;
    });
    return map;
  });

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    // By default, expand all topics
    const map: Record<string, boolean> = {};
    roadmaps.forEach((r) => {
      r.topics.forEach((t) => {
        map[t.id] = true;
      });
    });
    return map;
  });

  // Filter state
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed' | 'starred'>('all');
  
  // Quick subtopic input state: topicId -> string
  const [addingSubtopicForTopicId, setAddingSubtopicForTopicId] = useState<string | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

  // Quick topic input state: roadmapId -> string
  const [addingTopicForRoadmapId, setAddingTopicForRoadmapId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  const toggleRoadmapAccordion = (roadmapId: string) => {
    setExpandedRoadmaps((prev) => ({
      ...prev,
      [roadmapId]: !prev[roadmapId],
    }));
  };

  const toggleTopicAccordion = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleQuickAddSubtopic = (roadmapId: string, topicId: string) => {
    if (!newSubtopicTitle.trim()) return;
    onAddSubtopic(roadmapId, topicId, newSubtopicTitle.trim());
    setNewSubtopicTitle('');
    setAddingSubtopicForTopicId(null);
    // Ensure parent topic is expanded
    setExpandedTopics((prev) => ({ ...prev, [topicId]: true }));
  };

  const handleQuickAddTopic = (roadmapId: string) => {
    if (!newTopicTitle.trim() || !onAddTopic) return;
    onAddTopic(roadmapId, newTopicTitle.trim());
    setNewTopicTitle('');
    setAddingTopicForRoadmapId(null);
  };

  if (roadmaps.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#121212] text-neutral-200 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden font-sans">
      {/* Top Sheet Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Learning Syllabus & Sheet Tracker
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Syllabus breakdown with Theory, Algorithms, Resources & Revision Notes
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'pending'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterMode === 'completed'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterMode === 'starred'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Revision</span>
          </button>
        </div>
      </div>

      {/* Accordion List for Roadmaps */}
      <div className="divide-y divide-neutral-800/60">
        {roadmaps.map((rm) => {
          const isRmExpanded = expandedRoadmaps[rm.id] ?? true;
          
          // Compute roadmap stats
          const allSubs = rm.topics.flatMap((t) => t.subtopics);
          const completedSubs = allSubs.filter((s) => s.completedByUserIds?.includes(currentUser.id));
          const totalSubsCount = allSubs.length;
          const completedSubsCount = completedSubs.length;
          const percentage = totalSubsCount === 0 ? 0 : Math.round((completedSubsCount / totalSubsCount) * 100);

          return (
            <div key={rm.id} className="bg-[#141414]">
              {/* Level 1 Accordion Header: Roadmap (e.g. Placements or Learn the basics) */}
              <div 
                onClick={() => toggleRoadmapAccordion(rm.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400">
                    {isRmExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {rm.title}
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono">
                    ({rm.topics.length} topics)
                  </span>
                </div>

                {/* Progress bar and counter on the right like in the screenshot */}
                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-32 bg-neutral-800 rounded-full h-2 hidden sm:block overflow-hidden">
                    <div
                      className="bg-neutral-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {completedSubsCount} / {totalSubsCount}
                  </span>
                </div>
              </div>

              {/* Roadmap Content */}
              {isRmExpanded && (
                <div className="px-3 sm:px-5 pb-5 space-y-4">
                  {rm.topics.length === 0 ? (
                    <div className="py-6 px-4 text-center border border-dashed border-neutral-800 rounded-xl bg-[#111]">
                      <p className="text-xs text-neutral-500">
                        No topics added to this roadmap yet.
                      </p>
                      {onAddTopic && (
                        <button
                          onClick={() => setAddingTopicForRoadmapId(rm.id)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic (e.g. Two pointers)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    rm.topics.map((topic) => {
                      const isTopicExpanded = expandedTopics[topic.id] ?? true;
                      const topicCompleted = topic.subtopics.filter((s) =>
                        s.completedByUserIds?.includes(currentUser.id)
                      );
                      const topicTotal = topic.subtopics.length;
                      const topicPct = topicTotal === 0 ? 0 : Math.round((topicCompleted.length / topicTotal) * 100);

                      // Filter subtopics based on current filter mode
                      const filteredSubtopics = topic.subtopics.filter((s) => {
                        const isDone = s.completedByUserIds?.includes(currentUser.id);
                        if (filterMode === 'pending') return !isDone;
                        if (filterMode === 'completed') return isDone;
                        if (filterMode === 'starred') return !!s.isStarred;
                        return true;
                      });

                      return (
                        <div 
                          key={topic.id}
                          className="border border-neutral-800/80 rounded-xl bg-[#111111] overflow-hidden"
                        >
                          {/* Level 2 Accordion Header: Topic (e.g. Two pointers) */}
                          <div
                            onClick={() => toggleTopicAccordion(topic.id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#181818] hover:bg-[#1f1f1f] cursor-pointer transition-colors select-none border-b border-neutral-800"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-neutral-400">
                                {isTopicExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </span>
                              <span className="text-sm font-semibold text-neutral-100">
                                {topic.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-20 bg-neutral-800 rounded-full h-1.5 hidden sm:block overflow-hidden">
                                <div
                                  className="bg-neutral-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${topicPct}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-neutral-400">
                                {topicCompleted.length} / {topicTotal}
                              </span>
                            </div>
                          </div>

                          {/* Level 3: Table matching the black image exactly */}
                          {isTopicExpanded && (
                            <div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-neutral-800/80 text-[11px] font-semibold text-neutral-400 bg-[#141414] uppercase tracking-wider">
                                      <th className="py-2.5 px-4 w-12 text-center">Status</th>
                                      <th className="py-2.5 px-3 min-w-[200px]">Problem</th>
                                      <th className="py-2.5 px-3 w-20 text-center">
                                        <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                          Solve
                                        </span>
                                      </th>
                                      <th className="py-2.5 px-3 w-24 text-center">Resource</th>
                                      <th className="py-2.5 px-3 w-24 text-center">Resource</th>
                                      <th className="py-2.5 px-3 w-20 text-center">Practice</th>
                                      <th className="py-2.5 px-3 w-16 text-center">Note</th>
                                      <th className="py-2.5 px-4 w-16 text-center">Revision</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-800/50">
                                    {filteredSubtopics.length === 0 ? (
                                      <tr>
                                        <td colSpan={8} className="py-6 text-center text-neutral-500 text-xs">
                                          {filterMode === 'all'
                                            ? 'No subtopics added yet. Click "+ Add Subtopic" below.'
                                            : `No subtopics match the "${filterMode}" filter.`}
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredSubtopics.map((sub) => {
                                        const isDone = sub.completedByUserIds?.includes(currentUser.id);
                                        const hasNotes = !!(sub.theory || sub.algorithm || sub.notes);

                                        return (
                                          <tr 
                                            key={sub.id}
                                            className="hover:bg-[#1a1a1a] transition-colors group"
                                          >
                                            {/* Status Checkbox */}
                                            <td className="py-3 px-4 text-center">
                                              <button
                                                type="button"
                                                onClick={() => onToggleSubtopic(rm.id, topic.id, sub.id)}
                                                className={`transition-colors cursor-pointer inline-flex items-center justify-center ${
                                                  isDone 
                                                    ? 'text-emerald-400 hover:text-neutral-400' 
                                                    : 'text-neutral-600 hover:text-neutral-400'
                                                }`}
                                                title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                                              >
                                                {isDone ? (
                                                  <CheckSquare className="w-4 h-4" />
                                                ) : (
                                                  <Square className="w-4 h-4" />
                                                )}
                                              </button>
                                            </td>

                                            {/* Problem / Subtopic Title */}
                                            <td className="py-3 px-3">
                                              <div 
                                                onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                className="cursor-pointer group-hover:text-white transition-colors"
                                              >
                                                <span className={`font-medium ${isDone ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                                                  {sub.title}
                                                </span>
                                                {hasNotes && (
                                                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" title="Has theory/algorithm notes"></span>
                                                )}
                                              </div>
                                            </td>

                                            {/* Solve button (matching orange Solve pill in black image) */}
                                            <td className="py-3 px-3 text-center">
                                              {sub.practiceUrl ? (
                                                <a
                                                  href={sub.practiceUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-block text-amber-500 hover:text-amber-400 font-semibold text-xs hover:underline"
                                                >
                                                  Solve
                                                </a>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                  className="text-amber-500 hover:text-amber-400 font-semibold text-xs hover:underline cursor-pointer"
                                                >
                                                  Solve
                                                </button>
                                              )}
                                            </td>

                                            {/* Resource (orange play pill matching screenshot) */}
                                            <td className="py-3 px-3 text-center">
                                              {sub.resourceVideoUrl ? (
                                                <a
                                                  href={sub.resourceVideoUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center justify-center p-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 transition-colors"
                                                  title="Watch Resource Video"
                                                >
                                                  <Play className="w-3.5 h-3.5 fill-current" />
                                                </a>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                  className="inline-flex items-center justify-center p-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 transition-colors"
                                                  title="Add Video Resource Link"
                                                >
                                                  <Play className="w-3.5 h-3.5 fill-current" />
                                                </button>
                                              )}
                                            </td>

                                            {/* Resource (Doc / Youtube icons matching screenshot) */}
                                            <td className="py-3 px-3 text-center">
                                              <div className="inline-flex items-center gap-2 text-neutral-400">
                                                {sub.resourceDocUrl ? (
                                                  <a
                                                    href={sub.resourceDocUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:text-white transition-colors"
                                                    title="Read Documentation"
                                                  >
                                                    <FileText className="w-4 h-4" />
                                                  </a>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                    className="hover:text-white transition-colors text-neutral-600"
                                                    title="Add Documentation Link"
                                                  >
                                                    <FileText className="w-4 h-4" />
                                                  </button>
                                                )}

                                                {sub.resourceVideoUrl ? (
                                                  <a
                                                    href={sub.resourceVideoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-red-500 hover:text-red-400 transition-colors"
                                                    title="YouTube Tutorial"
                                                  >
                                                    <Youtube className="w-4 h-4" />
                                                  </a>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                    className="text-neutral-600 hover:text-neutral-400 transition-colors"
                                                    title="Add YouTube Link"
                                                  >
                                                    <Youtube className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>

                                            {/* Practice (--- or link) */}
                                            <td className="py-3 px-3 text-center text-neutral-500 font-mono">
                                              {sub.practiceUrl ? (
                                                <a
                                                  href={sub.practiceUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-neutral-300 hover:text-white inline-flex items-center gap-1"
                                                >
                                                  <span>Link</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              ) : (
                                                <span>---</span>
                                              )}
                                            </td>

                                            {/* Note (+ circle button matching screenshot) */}
                                            <td className="py-3 px-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => onOpenNotesModal(rm.title, topic.title, sub)}
                                                className={`p-1 rounded-full transition-all cursor-pointer ${
                                                  hasNotes
                                                    ? 'text-amber-400 hover:text-amber-300 hover:bg-neutral-800'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                                }`}
                                                title={hasNotes ? 'View/Edit Theory & Algorithm Notes' : 'Add Theory, Algorithm & Notes'}
                                              >
                                                <PlusCircle className="w-4 h-4" />
                                              </button>
                                            </td>

                                            {/* Revision Star (matching screenshot) */}
                                            <td className="py-3 px-4 text-center">
                                              <button
                                                type="button"
                                                onClick={() => onToggleStar(rm.id, topic.id, sub.id)}
                                                className={`p-1 transition-colors cursor-pointer ${
                                                  sub.isStarred
                                                    ? 'text-amber-400 hover:text-amber-300'
                                                    : 'text-neutral-600 hover:text-neutral-400'
                                                }`}
                                                title={sub.isStarred ? 'Remove from revision' : 'Star for revision'}
                                              >
                                                <Star className={`w-4 h-4 ${sub.isStarred ? 'fill-current' : ''}`} />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Quick Inline Add Subtopic Bar (e.g. Opposite direction) */}
                              <div className="p-3 bg-[#141414] border-t border-neutral-800/80 flex items-center justify-between gap-3 text-xs">
                                {addingSubtopicForTopicId === topic.id ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleQuickAddSubtopic(rm.id, topic.id);
                                    }}
                                    className="flex items-center gap-2 w-full max-w-md"
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={newSubtopicTitle}
                                      onChange={(e) => setNewSubtopicTitle(e.target.value)}
                                      placeholder="Subtopic name (e.g. opposite direction)..."
                                      className="flex-1 bg-[#0a0a0a] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                                    />
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs"
                                    >
                                      Add
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingSubtopicForTopicId(null);
                                        setNewSubtopicTitle('');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddingSubtopicForTopicId(topic.id);
                                      setNewSubtopicTitle('');
                                    }}
                                    className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Subtopic / Problem to "{topic.title}"</span>
                                  </button>
                                )}

                                <span className="text-[11px] text-neutral-500 font-mono">
                                  {topic.subtopics.length} items
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Quick Add Topic to Roadmap */}
                  {onAddTopic && (
                    <div className="pt-2">
                      {addingTopicForRoadmapId === rm.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleQuickAddTopic(rm.id);
                          }}
                          className="flex items-center gap-2 max-w-md bg-[#181818] p-2.5 rounded-xl border border-neutral-700"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            placeholder="New topic (e.g. Two pointers, Sliding Window)..."
                            className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-hidden"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 font-semibold text-xs"
                          >
                            Create Topic
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingTopicForRoadmapId(null);
                              setNewTopicTitle('');
                            }}
                            className="px-2 py-1 text-neutral-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAddingTopicForRoadmapId(rm.id);
                            setNewTopicTitle('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic to {rm.title}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
