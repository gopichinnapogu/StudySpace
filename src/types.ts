export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Subtopic {
  id: string;
  title: string;
  completedByUserIds: string[]; // list of user ids who marked it completed
  notes?: string;
  createdAt: number;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  subtopics: Subtopic[];
  createdAt: number;
}

export interface Roadmap {
  id: string;
  userId: string; // Scoped to individual user
  title: string;
  description?: string;
  topics: Topic[];
  createdAt: number;
}

export interface RevisionImage {
  id: string;
  userId: string; // Scoped to individual user
  title: string;
  imageUrl: string;
  roadmapId: string;
  topicId?: string;
  subtopicId?: string;
  notes?: string;
  uploadedBy: string;
  uploadedAt: number;
}

export type ActiveNavView = 'study-space' | 'roadmaps' | 'roadmap-detail' | 'revision-images';
