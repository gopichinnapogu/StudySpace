import { Roadmap, Subtopic, Topic } from '../types';

export interface ProgressStats {
  completed: number;
  total: number;
  percentage: number;
}

export function getRoadmapProgress(roadmap: Roadmap, userId: string): ProgressStats {
  let total = 0;
  let completed = 0;

  for (const topic of roadmap.topics) {
    for (const sub of topic.subtopics) {
      total += 1;
      if (sub.completedByUserIds && sub.completedByUserIds.includes(userId)) {
        completed += 1;
      }
    }
  }

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export function getOverallProgress(roadmaps: Roadmap[], userId: string): ProgressStats {
  let total = 0;
  let completed = 0;

  for (const rm of roadmaps) {
    for (const topic of rm.topics) {
      for (const sub of topic.subtopics) {
        total += 1;
        if (sub.completedByUserIds && sub.completedByUserIds.includes(userId)) {
          completed += 1;
        }
      }
    }
  }

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export interface DetailedStudyItem {
  roadmapId: string;
  roadmapTitle: string;
  topicId: string;
  topicTitle: string;
  subtopic: Subtopic;
  isCompleted: boolean;
}

export function getAllStudyItems(roadmaps: Roadmap[], userId: string): DetailedStudyItem[] {
  const items: DetailedStudyItem[] = [];

  for (const rm of roadmaps) {
    for (const topic of rm.topics) {
      for (const sub of topic.subtopics) {
        const isCompleted = Boolean(sub.completedByUserIds && sub.completedByUserIds.includes(userId));
        items.push({
          roadmapId: rm.id,
          roadmapTitle: rm.title,
          topicId: topic.id,
          topicTitle: topic.title,
          subtopic: sub,
          isCompleted,
        });
      }
    }
  }

  return items;
}
