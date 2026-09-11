import React, { useState } from 'react';
import { ActiveNavView, User } from '../types';
import { BookOpen, Map, Image as ImageIcon, LogOut, Users, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  onLogout: () => void;
  onCleanAllAndLogout?: () => void;
  onSwitchUser: () => void;
  allUsers: User[];
  onSelectUser: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onLogout,
  onCleanAllAndLogout,
  onSwitchUser,
  allUsers,
  onSelectUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'study-space' as ActiveNavView, label: 'Study Space', icon: BookOpen },
    { id: 'roadmaps' as ActiveNavView, label: 'Roadmaps', icon: Map },
    { id: 'revision-images' as ActiveNavView, label: 'Revision Images', icon: ImageIcon },
  ];

  const handleNavClick = (view: ActiveNavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            id="brand-logo"
            onClick={() => handleNavClick('study-space')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs group-hover:bg-neutral-800 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-neutral-900 block leading-tight">
                StudySpace
              </span>
              <span className="text-[11px] text-neutral-500 font-normal leading-none block">
                Clear learning &amp; revision
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/70 p-1 rounded-xl border border-neutral-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || (item.id === 'roadmaps' && activeView === 'roadmap-detail');
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Study Partner Switcher */}
          <div className="hidden md:flex items-center gap-2 relative">
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-medium text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-neutral-800 leading-tight">
                    {currentUser.name}
                  </div>
                </div>
                <Users className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              </button>

              {userDropdownOpen && (
                <div 
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-xs text-neutral-400">Signed in as</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      id="switch-account-button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Switch Account</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-1 space-y-0.5">
                    <button
                      id="logout-button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Sign Out</span>
                    </button>

                    {onCleanAllAndLogout && (
                      <button
                        id="clean-all-logout-button"
                        onClick={() => {
                          if (confirm('Clean all data completely? This will wipe all roadmaps, study space progress, and accounts for a brand new experience.')) {
                            setUserDropdownOpen(false);
                            onCleanAllAndLogout();
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out & Clean All</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 mb-2">
            <div>
              <div className="text-xs text-neutral-400">Logged in as</div>
              <div className="text-sm font-semibold text-neutral-900">{currentUser.name}</div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md hover:bg-neutral-200"
            >
              Sign Out
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'roadmaps' && activeView === 'roadmap-detail');
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-neutral-100 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 font-medium"
            >
              <LogOut className="w-4 h-4 text-neutral-500" />
              <span>Sign Out</span>
            </button>
            {onCleanAllAndLogout && (
              <button
                onClick={() => {
                  if (confirm('Clean all data completely? This will wipe all roadmaps, study space progress, and accounts for a brand new experience.')) {
                    setMobileMenuOpen(false);
                    onCleanAllAndLogout();
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out & Clean All</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
