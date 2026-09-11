import React, { useState, useEffect } from 'react';
import { 
  Roadmap, 
  RevisionImage, 
  User, 
  ActiveNavView, 
  Topic, 
  Subtopic 
} from './types';
import { 
  loadUserRoadmaps,
  saveUserRoadmaps,
  loadUserRevisionImages,
  saveUserRevisionImages,
  loadCurrentUser, 
  saveCurrentUser,
  loadAllUsers,
  saveAllUsers,
  cleanAllData,
  cleanUserData
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { StudySpaceView } from './components/StudySpaceView';
import { RoadmapsView } from './components/RoadmapsView';
import { RoadmapDetailView } from './components/RoadmapDetailView';
import { RevisionImagesView } from './components/RevisionImagesView';
import { AddRoadmapModal } from './components/AddRoadmapModal';
import { AddContentModal } from './components/AddContentModal';
import { UploadImageModal } from './components/UploadImageModal';
import { ImageViewerModal } from './components/ImageViewerModal';

export const App: React.FC = () => {
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => loadAllUsers());

  // User-isolated roadmaps and revision images
  const [userRoadmaps, setUserRoadmaps] = useState<Roadmap[]>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadUserRoadmaps(initialUser.id) : [];
  });

  const [userRevisionImages, setUserRevisionImages] = useState<RevisionImage[]>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadUserRevisionImages(initialUser.id) : [];
  });
  
  // Navigation & View State
  const [activeView, setActiveView] = useState<ActiveNavView>('study-space');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  // Modals state
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState<boolean>(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState<boolean>(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState<boolean>(false);
  const [activeViewerImage, setActiveViewerImage] = useState<RevisionImage | null>(null);

  // Filters for revision images modal / view
  const [revisionFilterRoadmapId, setRevisionFilterRoadmapId] = useState<string>('all');
  const [revisionFilterTopicId, setRevisionFilterTopicId] = useState<string>('all');

  // When current user changes, reload their personal space
  useEffect(() => {
    saveCurrentUser(currentUser);
    if (currentUser) {
      setUserRoadmaps(loadUserRoadmaps(currentUser.id));
      setUserRevisionImages(loadUserRevisionImages(currentUser.id));
    } else {
      setUserRoadmaps([]);
      setUserRevisionImages([]);
      setSelectedRoadmapId(null);
    }
  }, [currentUser?.id]);

  // Persist roadmaps for the active user
  useEffect(() => {
    if (currentUser) {
      saveUserRoadmaps(currentUser.id, userRoadmaps);
    }
  }, [userRoadmaps, currentUser?.id]);

  // Persist revision images for the active user
  useEffect(() => {
    if (currentUser) {
      saveUserRevisionImages(currentUser.id, userRevisionImages);
    }
  }, [userRevisionImages, currentUser?.id]);

  // Persist all registered accounts
  useEffect(() => {
    saveAllUsers(allUsers);
  }, [allUsers]);

  // Auth actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!allUsers.some((u) => u.id === user.id)) {
      setAllUsers((prev) => [...prev, user]);
    }
    // Load fresh data for this specific user
    setUserRoadmaps(loadUserRoadmaps(user.id));
    setUserRevisionImages(loadUserRevisionImages(user.id));
    setSelectedRoadmapId(null);
    setActiveView('study-space');
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
    setUserRoadmaps([]);
    setUserRevisionImages([]);
    setSelectedRoadmapId(null);
    setActiveView('study-space');
  };

  const handleCleanAllAndLogout = () => {
    cleanAllData();
    saveCurrentUser(null);
    setCurrentUser(null);
    setUserRoadmaps([]);
    setUserRevisionImages([]);
    setAllUsers([]);
    setSelectedRoadmapId(null);
    setActiveView('study-space');
  };

  const handleSwitchUser = () => {
    handleLogout();
  };

  const handleSelectUser = (user: User) => {
    handleLogin(user);
  };

  // Roadmap actions
  const handleAddRoadmap = (title: string, description?: string) => {
    if (!currentUser) return;

    const newRoadmap: Roadmap = {
      id: `rm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      title: title.trim(),
      description: description?.trim(),
      topics: [],
      createdAt: Date.now(),
    };

    setUserRoadmaps((prev) => [...prev, newRoadmap]);
    // Automatically navigate to view the newly created roadmap
    setSelectedRoadmapId(newRoadmap.id);
    setActiveView('roadmap-detail');
  };

  const handleUpdateRoadmap = (roadmapId: string, title: string, description?: string) => {
    setUserRoadmaps((prev) =>
      prev.map((r) =>
        r.id === roadmapId ? { ...r, title, description } : r
      )
    );
  };

  const handleDeleteRoadmap = (roadmapId: string) => {
    setUserRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
    if (selectedRoadmapId === roadmapId) {
      setSelectedRoadmapId(null);
      setActiveView('roadmaps');
    }
  };

  const handleOpenRoadmap = (roadmapId: string) => {
    setSelectedRoadmapId(roadmapId);
    setActiveView('roadmap-detail');
  };

  // Content (Topics & Subtopics) Actions
  const handleAddContent = (mainTopicTitle: string, subtopicsTitles: string[], description?: string) => {
    if (!selectedRoadmapId) return;

    const newSubtopics: Subtopic[] = subtopicsTitles.map((subTitle, idx) => ({
      id: `sub_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      title: subTitle,
      completedByUserIds: [],
      createdAt: Date.now() + idx,
    }));

    const newTopic: Topic = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: mainTopicTitle,
      description,
      subtopics: newSubtopics,
      createdAt: Date.now(),
    };

    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === selectedRoadmapId) {
          return {
            ...rm,
            topics: [...rm.topics, newTopic],
          };
        }
        return rm;
      })
    );
  };

  const handleAddSingleSubtopic = (roadmapId: string, topicId: string, subtopicTitle: string) => {
    const newSub: Subtopic = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: subtopicTitle,
      completedByUserIds: [],
      createdAt: Date.now(),
    };

    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.map((t) => {
              if (t.id === topicId) {
                return {
                  ...t,
                  subtopics: [...t.subtopics, newSub],
                };
              }
              return t;
            }),
          };
        }
        return rm;
      })
    );
  };

  // Update existing subtopic title
  const handleUpdateSubtopic = (
    roadmapId: string,
    topicId: string,
    subtopicId: string,
    newTitle: string
  ) => {
    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.map((t) => {
              if (t.id === topicId) {
                return {
                  ...t,
                  subtopics: t.subtopics.map((s) =>
                    s.id === subtopicId ? { ...s, title: newTitle } : s
                  ),
                };
              }
              return t;
            }),
          };
        }
        return rm;
      })
    );
  };

  // Delete an individual subtopic
  const handleDeleteSubtopic = (
    roadmapId: string,
    topicId: string,
    subtopicId: string
  ) => {
    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.map((t) => {
              if (t.id === topicId) {
                return {
                  ...t,
                  subtopics: t.subtopics.filter((s) => s.id !== subtopicId),
                };
              }
              return t;
            }),
          };
        }
        return rm;
      })
    );
  };

  // Update full topic with modified subtopics list
  const handleUpdateTopic = (
    roadmapId: string,
    topicId: string,
    newTitle: string,
    newDesc?: string,
    updatedSubtopics?: { id: string; title: string; completedByUserIds: string[] }[]
  ) => {
    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.map((t) => {
              if (t.id === topicId) {
                return {
                  ...t,
                  title: newTitle,
                  description: newDesc,
                  subtopics: updatedSubtopics
                    ? updatedSubtopics.map((us) => ({
                        id: us.id,
                        title: us.title,
                        completedByUserIds: us.completedByUserIds || [],
                        createdAt: Date.now(),
                      }))
                    : t.subtopics,
                };
              }
              return t;
            }),
          };
        }
        return rm;
      })
    );
  };

  const handleDeleteTopic = (roadmapId: string, topicId: string) => {
    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.filter((t) => t.id !== topicId),
          };
        }
        return rm;
      })
    );
  };

  // Toggle Subtopic Completion Status (Dynamic Progress Sync)
  const handleToggleSubtopic = (roadmapId: string, topicId: string, subtopicId: string) => {
    if (!currentUser) return;

    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === roadmapId) {
          return {
            ...rm,
            topics: rm.topics.map((t) => {
              if (t.id === topicId) {
                return {
                  ...t,
                  subtopics: t.subtopics.map((s) => {
                    if (s.id === subtopicId) {
                      const completed = s.completedByUserIds || [];
                      const alreadyDone = completed.includes(currentUser.id);
                      const updated = alreadyDone
                        ? completed.filter((id) => id !== currentUser.id)
                        : [...completed, currentUser.id];
                      return {
                        ...s,
                        completedByUserIds: updated,
                      };
                    }
                    return s;
                  }),
                };
              }
              return t;
            }),
          };
        }
        return rm;
      })
    );
  };

  // Revision Images Actions
  const handleUploadImage = (newImage: RevisionImage) => {
    setUserRevisionImages((prev) => [newImage, ...prev]);
  };

  const handleDeleteImage = (imageId: string) => {
    setUserRevisionImages((prev) => prev.filter((img) => img.id !== imageId));
    if (activeViewerImage?.id === imageId) {
      setActiveViewerImage(null);
    }
  };

  const handleOpenRevisionImagesFromTopic = (roadmapId: string, topicId: string) => {
    setRevisionFilterRoadmapId(roadmapId);
    setRevisionFilterTopicId(topicId);
    setActiveView('revision-images');
  };

  // If not logged in, render Login Screen
  if (!currentUser) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onCleanAll={handleCleanAllAndLogout}
      />
    );
  }

  const currentRoadmap = userRoadmaps.find((r) => r.id === selectedRoadmapId);

  // Determine modal active titles
  const activeViewerRoadmap = userRoadmaps.find((r) => r.id === activeViewerImage?.roadmapId);
  const activeViewerTopic = activeViewerRoadmap?.topics.find((t) => t.id === activeViewerImage?.topicId);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          if (view === 'roadmaps') setSelectedRoadmapId(null);
        }}
        onLogout={handleLogout}
        onCleanAllAndLogout={handleCleanAllAndLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'study-space' && (
          <StudySpaceView
            roadmaps={userRoadmaps}
            currentUser={currentUser}
            revisionImages={userRevisionImages}
            onToggleSubtopic={handleToggleSubtopic}
            onOpenRoadmap={handleOpenRoadmap}
            onOpenAddRoadmap={() => setIsAddRoadmapOpen(true)}
            onOpenRevisionImages={(rmId, topId) => {
              setRevisionFilterRoadmapId(rmId || 'all');
              setRevisionFilterTopicId(topId || 'all');
              setActiveView('revision-images');
            }}
            onOpenImageViewer={(image) => setActiveViewerImage(image)}
          />
        )}

        {activeView === 'roadmaps' && (
          <RoadmapsView
            roadmaps={userRoadmaps}
            currentUser={currentUser}
            onOpenRoadmap={handleOpenRoadmap}
            onOpenAddRoadmapModal={() => setIsAddRoadmapOpen(true)}
            onDeleteRoadmap={handleDeleteRoadmap}
            onUpdateRoadmap={handleUpdateRoadmap}
          />
        )}

        {activeView === 'roadmap-detail' && currentRoadmap && (
          <RoadmapDetailView
            roadmap={currentRoadmap}
            currentUser={currentUser}
            onBack={() => {
              setSelectedRoadmapId(null);
              setActiveView('roadmaps');
            }}
            onToggleSubtopic={handleToggleSubtopic}
            onOpenAddContent={() => setIsAddContentOpen(true)}
            onDeleteTopic={handleDeleteTopic}
            onAddSingleSubtopic={handleAddSingleSubtopic}
            onUpdateSubtopic={handleUpdateSubtopic}
            onDeleteSubtopic={handleDeleteSubtopic}
            onUpdateTopic={handleUpdateTopic}
            onUpdateRoadmap={handleUpdateRoadmap}
            onOpenRevisionImagesForTopic={handleOpenRevisionImagesFromTopic}
          />
        )}

        {activeView === 'revision-images' && (
          <RevisionImagesView
            revisionImages={userRevisionImages}
            roadmaps={userRoadmaps}
            currentUser={currentUser}
            onOpenUploadModal={() => setIsUploadImageOpen(true)}
            onOpenImageViewer={(image) => setActiveViewerImage(image)}
            onDeleteImage={handleDeleteImage}
            initialRoadmapFilter={revisionFilterRoadmapId}
            initialTopicFilter={revisionFilterTopicId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <div>
            StudySpace · {currentUser.name}'s Personal Study Workspace
          </div>
          <div className="flex items-center gap-4">
            <span>Dynamic Progress Synchronized</span>
            <span>·</span>
            <button
              onClick={() => {
                if (confirm(`Clear all roadmaps and study data for ${currentUser.name}?`)) {
                  cleanUserData(currentUser.id);
                  setUserRoadmaps([]);
                  setUserRevisionImages([]);
                }
              }}
              className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Reset My Space
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Add Roadmap Modal */}
      <AddRoadmapModal
        isOpen={isAddRoadmapOpen}
        onClose={() => setIsAddRoadmapOpen(false)}
        onAddRoadmap={handleAddRoadmap}
      />

      {/* 2. Add Content Modal */}
      {currentRoadmap && (
        <AddContentModal
          isOpen={isAddContentOpen}
          roadmapTitle={currentRoadmap.title}
          onClose={() => setIsAddContentOpen(false)}
          onAddContent={handleAddContent}
        />
      )}

      {/* 3. Upload Revision Image Modal */}
      <UploadImageModal
        isOpen={isUploadImageOpen}
        roadmaps={userRoadmaps}
        currentUser={currentUser}
        onClose={() => setIsUploadImageOpen(false)}
        onUpload={handleUploadImage}
        initialRoadmapId={selectedRoadmapId || undefined}
      />

      {/* 4. Large Revision Image Viewer Modal */}
      <ImageViewerModal
        image={activeViewerImage}
        roadmapTitle={activeViewerRoadmap?.title}
        topicTitle={activeViewerTopic?.title}
        onClose={() => setActiveViewerImage(null)}
      />
    </div>
  );
};

export default App;
