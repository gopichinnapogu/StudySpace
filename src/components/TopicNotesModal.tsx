import React, { useState, useEffect } from 'react';
import { Subtopic } from '../types';
import { 
  X, 
  FileText, 
  Code2, 
  BookOpen, 
  Link as LinkIcon, 
  Youtube, 
  Star, 
  Check, 
  Save 
} from 'lucide-react';

interface TopicNotesModalProps {
  isOpen: boolean;
  roadmapTitle?: string;
  topicTitle?: string;
  subtopic: Subtopic | null;
  onClose: () => void;
  onSave: (subtopicId: string, updates: Partial<Subtopic>) => void;
}

export const TopicNotesModal: React.FC<TopicNotesModalProps> = ({
  isOpen,
  roadmapTitle,
  topicTitle,
  subtopic,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'theory' | 'algorithm' | 'resources'>('theory');
  const [notes, setNotes] = useState('');
  const [theory, setTheory] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [practiceUrl, setPracticeUrl] = useState('');
  const [resourceDocUrl, setResourceDocUrl] = useState('');
  const [resourceVideoUrl, setResourceVideoUrl] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (subtopic) {
      setNotes(subtopic.notes || '');
      setTheory(subtopic.theory || '');
      setAlgorithm(subtopic.algorithm || '');
      setPracticeUrl(subtopic.practiceUrl || '');
      setResourceDocUrl(subtopic.resourceDocUrl || '');
      setResourceVideoUrl(subtopic.resourceVideoUrl || '');
      setIsStarred(!!subtopic.isStarred);
      setSavedSuccess(false);
    }
  }, [subtopic]);

  if (!isOpen || !subtopic) return null;

  const handleSave = () => {
    onSave(subtopic.id, {
      notes,
      theory,
      algorithm,
      practiceUrl,
      resourceDocUrl,
      resourceVideoUrl,
      isStarred,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="bg-[#181818] border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between gap-4 bg-[#141414]">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span>{roadmapTitle || 'Roadmap'}</span>
              <span>›</span>
              <span>{topicTitle || 'Topic'}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              {subtopic.title}
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`p-1 rounded-md transition-colors ${
                  isStarred 
                    ? 'text-amber-400 hover:text-amber-300' 
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
                title={isStarred ? 'Starred for revision' : 'Star for revision'}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-[#151515] px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'theory'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Concepts</span>
            {theory.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'algorithm'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Algorithm & Approach</span>
            {algorithm.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Key Notes & Tips</span>
            {notes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Links & Practice</span>
            {(practiceUrl.trim() || resourceVideoUrl.trim() || resourceDocUrl.trim()) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'theory' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Theory / Concepts (What is this technique & why use it?)
              </label>
              <textarea
                value={theory}
                onChange={(e) => setTheory(e.target.value)}
                placeholder="e.g. Two Pointers in opposite directions: Start one pointer at index 0 and another at n-1. Move them inward based on condition (e.g. sorted pair sum). Reduces time complexity from O(N^2) to O(N)."
                rows={9}
                className="w-full bg-[#111] border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden focus:border-amber-500 font-mono leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500">
                Tip: Summarize the core intuition, edge cases, and time/space complexity here.
              </p>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Algorithm & Step-by-Step Logic / Pseudo-code
              </label>
              <textarea
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                placeholder={`e.g.
1. Initialize left = 0, right = arr.length - 1
2. While left < right:
   - sum = arr[left] + arr[right]
   - if sum == target: return [left, right]
   - else if sum < target: left++
   - else: right--
3. Return -1 if not found`}
                rows={9}
                className="w-full bg-[#111] border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden focus:border-amber-500 font-mono leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500">
                Write out standard pseudocode, invariants, or pointer movement conditions.
              </p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Personal Revision Notes & Important Insights
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key pitfalls, interview reminders, or notes on tricky test cases..."
                rows={9}
                className="w-full bg-[#111] border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden focus:border-amber-500 leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Practice Problem URL (e.g. LeetCode / GeeksForGeeks / HackerRank)
                </label>
                <div className="flex items-center gap-2 bg-[#111] border border-neutral-800 rounded-xl px-3 py-2">
                  <LinkIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                  <input
                    type="url"
                    value={practiceUrl}
                    onChange={(e) => setPracticeUrl(e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                    className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Video Tutorial URL (e.g. YouTube / Striver / NeetCode)
                </label>
                <div className="flex items-center gap-2 bg-[#111] border border-neutral-800 rounded-xl px-3 py-2">
                  <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="url"
                    value={resourceVideoUrl}
                    onChange={(e) => setResourceVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Article / Documentation URL
                </label>
                <div className="flex items-center gap-2 bg-[#111] border border-neutral-800 rounded-xl px-3 py-2">
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                  <input
                    type="url"
                    value={resourceDocUrl}
                    onChange={(e) => setResourceDocUrl(e.target.value)}
                    placeholder="https://takeuforward.org/... or article link"
                    className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isStarred}
                    onChange={(e) => setIsStarred(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 bg-neutral-900 border-neutral-700"
                  />
                  <span>Mark as Starred for Priority Revision</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#141414] flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {savedSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Saved changes!
              </span>
            ) : (
              'All theory, algorithms, and links persist to your space.'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors font-medium cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
