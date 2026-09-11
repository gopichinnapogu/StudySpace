import { Roadmap, RevisionImage, User } from '../types';

const STORAGE_KEYS = {
  USER: 'studyspace_current_user',
  ALL_USERS: 'studyspace_users',
  GLOBAL_ROADMAPS: 'studyspace_roadmaps',
  GLOBAL_REVISION_IMAGES: 'studyspace_revision_images',
};

// Helper for user-isolated storage keys
export function getUserRoadmapsKey(userId: string): string {
  return `studyspace_roadmaps_${userId}`;
}

export function getUserImagesKey(userId: string): string {
  return `studyspace_images_${userId}`;
}

// Load roadmaps strictly for a specific user
export function loadUserRoadmaps(userId: string): Roadmap[] {
  try {
    const userKey = getUserRoadmapsKey(userId);
    const raw = localStorage.getItem(userKey);
    if (raw) {
      return JSON.parse(raw);
    }

    // Check if there are legacy global roadmaps belonging to this user
    const globalRaw = localStorage.getItem(STORAGE_KEYS.GLOBAL_ROADMAPS);
    if (globalRaw) {
      const all: Roadmap[] = JSON.parse(globalRaw);
      const userItems = all.filter((r) => r.userId === userId);
      if (userItems.length > 0) {
        saveUserRoadmaps(userId, userItems);
        return userItems;
      }
    }

    // New user starts completely fresh with 0 roadmaps
    return [];
  } catch (e) {
    console.error('Failed to load user roadmaps', e);
    return [];
  }
}

// Save roadmaps strictly for a specific user
export function saveUserRoadmaps(userId: string, roadmaps: Roadmap[]): void {
  try {
    const userKey = getUserRoadmapsKey(userId);
    localStorage.setItem(userKey, JSON.stringify(roadmaps));
  } catch (e) {
    console.error('Failed to save user roadmaps', e);
  }
}

// Load revision images strictly for a specific user
export function loadUserRevisionImages(userId: string): RevisionImage[] {
  try {
    const userKey = getUserImagesKey(userId);
    const raw = localStorage.getItem(userKey);
    if (raw) {
      return JSON.parse(raw);
    }

    const globalRaw = localStorage.getItem(STORAGE_KEYS.GLOBAL_REVISION_IMAGES);
    if (globalRaw) {
      const all: RevisionImage[] = JSON.parse(globalRaw);
      const userItems = all.filter((img) => img.userId === userId);
      if (userItems.length > 0) {
        saveUserRevisionImages(userId, userItems);
        return userItems;
      }
    }

    return [];
  } catch (e) {
    console.error('Failed to load user revision images', e);
    return [];
  }
}

// Save revision images strictly for a specific user
export function saveUserRevisionImages(userId: string, images: RevisionImage[]): void {
  try {
    const userKey = getUserImagesKey(userId);
    localStorage.setItem(userKey, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save user revision images', e);
  }
}

export function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Failed to save current user to storage', e);
  }
}

export function loadAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAllUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to storage', e);
  }
}

export function registerUser(
  name: string,
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const users = loadAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in with your password.',
    };
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    password: password,
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);
  saveCurrentUser(newUser);

  // Initialize clean, brand-new empty roadmaps and revision images for this new user
  saveUserRoadmaps(newUser.id, []);
  saveUserRevisionImages(newUser.id, []);

  return { success: true, user: newUser };
}

export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const users = loadAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email. Please create an account first.',
    };
  }

  if (user.password && user.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  if (!user.password && password) {
    user.password = password;
    saveAllUsers(users);
  }

  saveCurrentUser(user);
  return { success: true, user };
}

// Clean all stored data completely (wipe everything)
export function cleanAllData(): void {
  try {
    localStorage.clear();
  } catch (e) {
    console.error('Failed to clean all data', e);
  }
}

// Clean specific user's roadmaps and study space
export function cleanUserData(userId: string): void {
  try {
    localStorage.removeItem(getUserRoadmapsKey(userId));
    localStorage.removeItem(getUserImagesKey(userId));
  } catch (e) {
    console.error('Failed to clean user data', e);
  }
}
