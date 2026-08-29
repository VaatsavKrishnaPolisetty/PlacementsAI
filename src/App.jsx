import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/modals/AuthModal';
import { ToastProvider, useToast } from './components/common/ToastContext';
import { mockPlacementData } from './data/mockData';
import api from './services/api';
import socketService from './services/socket';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRole, setCurrentRole] = useState('student'); // 'student' | 'admin'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('placements_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return {
      id: 'STU101',
      studentId: 'STU101',
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech',
      year: 4,
      cgpa: 8.8,
      backlogs: 0,
      skills: {
        technical: ['Python', 'SQL', 'Data Structures', 'FastAPI', 'React'],
        soft: ['Communication', 'Problem Solving', 'Team Leadership'],
      },
      resume: {
        fileName: 'Student_Resume.pdf',
        fileUrl: '/uploads/sample_resume.pdf',
        fileSize: 245000,
        uploadedAt: new Date(),
      },
    };
  });

  const [notifications, setNotifications] = useState(mockPlacementData.notifications);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    return !localStorage.getItem('placements_user');
  });
  const mainRef = useRef(null);

  // Load user profile & notifications on startup
  useEffect(() => {
    if (currentUser.studentId) {
      api.notifications.getByUser(currentUser.studentId).then((res) => {
        if (res && res.length) setNotifications(res);
      });
      socketService.connect(currentUser.studentId, currentRole);
    }

    const unNotif = socketService.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      const isUrgent = notif.priority === 'urgent' || notif.type === 'room_changed';
      showToast(
        `${isUrgent ? '🚨' : '🔔'} ${notif.title}: ${notif.message}`,
        isUrgent ? 'warning' : 'info'
      );
    });

    return () => {
      unNotif();
    };
  }, [currentUser.studentId, currentRole, showToast]);

  // GSAP Smooth entrance on tab changes
  useEffect(() => {
    if (mainRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          mainRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          }
        );
      }, mainRef);

      return () => ctx.revert();
    }
  }, [activeTab, currentRole]);

  const handleToggleRole = () => {
    if (currentRole === 'student') {
      setCurrentRole('admin');
      setActiveTab('dashboard');
      showToast(`Switched to Placement Officer / Admin Portal (${currentUser?.name || 'Dr. Sharma'})`, 'info');
    } else {
      setCurrentRole('student');
      setActiveTab('dashboard');
      showToast(`Switched to Student Portal (${currentUser?.name || 'Student Candidate'})`, 'info');
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('placements_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
    if (user.role === 'tpo' || user.role === 'admin') {
      setCurrentRole('admin');
    } else {
      setCurrentRole('student');
    }
    setIsAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleMarkRead = async (notifId) => {
    await api.notifications.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notifId || n.id === notifId ? { ...n, isRead: true, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllAsRead(currentUser.studentId || 'STU101');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Fixed Dynamic Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} currentUser={currentUser} />

      {/* Header Bar with Role Switcher & Notifications */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        notifications={notifications}
        onNavigateTab={(tab) => setActiveTab(tab)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Main App Canvas */}
      <main
        ref={mainRef}
        className="flex-1 ml-64 mt-16 p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]"
      >
        <div className="max-w-7xl mx-auto">
          <Dashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            currentRole={currentRole}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            notifications={notifications}
            setNotifications={setNotifications}
            onToggleRole={handleToggleRole}
          />
        </div>
      </main>

      {/* Auth Modal for Student Registration / Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
