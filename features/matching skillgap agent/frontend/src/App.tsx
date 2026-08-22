import React, { useState, useEffect } from 'react';
import {
  Student,
  PlacementDrive,
  Room3D,
  PanelMember,
  ScheduledInterview,
  AgentActionItem,
  NotificationLog,
  PlacementStats
} from './types/placement';
import {
  MOCK_STUDENTS,
  MOCK_DRIVES,
  MOCK_ROOMS_3D,
  MOCK_PANELS,
  MOCK_SCHEDULED_INTERVIEWS,
  MOCK_AGENT_ACTIONS,
  MOCK_NOTIFICATIONS
} from './mock/data';

// Navigation & Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavigationTab } from './components/common/Sidebar';

// Views
import { OpsDashboard } from './components/dashboard/OpsDashboard';
import { DriveManagement } from './components/drives/DriveManagement';
import { JDExtractorModal } from './components/drives/JDExtractorModal';
import { CandidateMatching } from './components/candidates/CandidateMatching';
import { InterviewScheduler } from './components/scheduling/InterviewScheduler';
import { RoomPanelMatrix } from './components/venues/RoomPanelMatrix';
import { NotificationHub } from './components/comms/NotificationHub';
import { PlacementAnalytics } from './components/analytics/PlacementAnalytics';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('command-center');

  // Core Data State
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [drives, setDrives] = useState<PlacementDrive[]>(MOCK_DRIVES);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive>(MOCK_DRIVES[0]);
  const [rooms, setRooms] = useState<Room3D[]>(MOCK_ROOMS_3D);
  const [selectedRoom, setSelectedRoom] = useState<Room3D | null>(null);
  const [panels, setPanels] = useState<PanelMember[]>(MOCK_PANELS);
  const [schedules, setSchedules] = useState<ScheduledInterview[]>(MOCK_SCHEDULED_INTERVIEWS);
  const [actions, setActions] = useState<AgentActionItem[]>(MOCK_AGENT_ACTIONS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(MOCK_NOTIFICATIONS);

  // Eligibility Manual Overrides map: "studentId_driveId" -> "APPROVED" | "REJECTED"
  const [overrides, setOverrides] = useState<Record<string, 'APPROVED' | 'REJECTED' | 'REQUESTED'>>({});

  // Agent State
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  const [isJDExtractorOpen, setIsJDExtractorOpen] = useState(false);

  // Calculate live placement stats
  const pendingApprovalsCount = actions.filter(a => a.status === 'PENDING').length;
  const roomsOccupied = rooms.filter(r => r.status === 'In-Session').length;

  const stats: PlacementStats = {
    totalStudents: students.length,
    totalPlaced: students.filter(s => s.placementStatus === 'Placed').length,
    activeDrives: drives.length,
    scheduledInterviewsToday: schedules.length,
    roomsOccupied,
    totalRooms: rooms.length,
    pendingApprovals: pendingApprovalsCount,
    avgPackageLPA: 24.5,
    highestPackageLPA: 43.0,
    skillGapsIdentified: 18,
    notificationsDispatched: notifications.length
  };

  // Human-in-the-Loop Approval Handlers
  const handleApproveAction = (actionId: string) => {
    setActions(prev => prev.map(act => {
      if (act.id === actionId) {
        // If eligibility waiver action
        if (act.category === 'ELIGIBILITY' && act.metadata?.studentId && act.metadata?.driveId) {
          const key = `${act.metadata.studentId}_${act.metadata.driveId}`;
          setOverrides(ov => ({ ...ov, [key]: 'APPROVED' }));
        }
        return { ...act, status: 'APPROVED' };
      }
      return act;
    }));
  };

  const handleRejectAction = (actionId: string) => {
    setActions(prev => prev.map(act => {
      if (act.id === actionId) {
        if (act.category === 'ELIGIBILITY' && act.metadata?.studentId && act.metadata?.driveId) {
          const key = `${act.metadata.studentId}_${act.metadata.driveId}`;
          setOverrides(ov => ({ ...ov, [key]: 'REJECTED' }));
        }
        return { ...act, status: 'REJECTED' };
      }
      return act;
    }));
  };

  // Eligibility Override handler from matrix view
  const handleToggleOverride = (studentId: string, driveId: string, status: 'APPROVED' | 'REJECTED') => {
    const key = `${studentId}_${driveId}`;
    setOverrides(prev => ({ ...prev, [key]: status }));
  };

  // Deploy New Drive from AI JD Extractor
  const handleDeployDrive = (newDrive: PlacementDrive) => {
    setDrives(prev => [newDrive, ...prev]);
    setSelectedDrive(newDrive);
    setActiveTab('drives-eligibility');
  };

  // Candidate Shortlist toggle
  const handleShortlistCandidate = (driveId: string, studentId: string) => {
    setDrives(prev => prev.map(d => {
      if (d.id === driveId) {
        const already = d.shortlistedCandidateIds.includes(studentId);
        const updated = already
          ? d.shortlistedCandidateIds.filter(id => id !== studentId)
          : [...d.shortlistedCandidateIds, studentId];
        return { ...d, shortlistedCandidateIds: updated };
      }
      return d;
    }));
  };

  // Add Schedules generated by Auto-Scheduler
  const handleAddSchedules = (
    newSchedules: ScheduledInterview[],
    updatedRooms: Room3D[],
    updatedPanels: PanelMember[]
  ) => {
    setSchedules(prev => [...newSchedules, ...prev]);
    setRooms(updatedRooms);
    setPanels(updatedPanels);
  };

  // Update interview status
  const handleUpdateScheduleStatus = (
    scheduleId: string,
    status: ScheduledInterview['status'],
    score?: number,
    feedback?: string
  ) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === scheduleId) {
        return { ...s, status, score, feedback };
      }
      return s;
    }));
  };

  // Add Notification Log
  const handleDispatchNotification = (newLog: NotificationLog) => {
    setNotifications(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#06080d] bg-cyber-grid text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        stats={stats}
        autoPilotEnabled={autoPilotEnabled}
        onToggleAutoPilot={() => setAutoPilotEnabled(!autoPilotEnabled)}
        onOpenJDExtractor={() => setIsJDExtractorOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-radial-gradient">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'command-center' && (
              <OpsDashboard
                stats={stats}
                rooms={rooms}
                selectedRoom={selectedRoom}
                onSelectRoom={(r) => setSelectedRoom(r)}
                actions={actions}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
                drives={drives}
                students={students}
                schedules={schedules}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'drives-eligibility' && (
              <DriveManagement
                drives={drives}
                students={students}
                selectedDrive={selectedDrive}
                onSelectDrive={(d) => setSelectedDrive(d)}
                overrides={overrides}
                onToggleOverride={handleToggleOverride}
                onOpenJDExtractor={() => setIsJDExtractorOpen(true)}
              />
            )}

            {activeTab === 'candidate-matching' && (
              <CandidateMatching
                students={students}
                drives={drives}
                selectedDrive={selectedDrive}
                onSelectDrive={(d) => setSelectedDrive(d)}
                onShortlistCandidate={handleShortlistCandidate}
              />
            )}

            {activeTab === 'interviews-schedule' && (
              <InterviewScheduler
                schedules={schedules}
                drives={drives}
                students={students}
                panels={panels}
                rooms={rooms}
                onAddSchedules={handleAddSchedules}
                onUpdateScheduleStatus={handleUpdateScheduleStatus}
              />
            )}

            {activeTab === 'panel-rooms' && (
              <RoomPanelMatrix
                panels={panels}
                rooms={rooms}
                onSelectRoom={(r) => {
                  setSelectedRoom(r);
                  setActiveTab('command-center');
                }}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationHub
                notifications={notifications}
                schedules={schedules}
                students={students}
                onDispatchNotification={handleDispatchNotification}
              />
            )}

            {activeTab === 'analytics-reports' && (
              <PlacementAnalytics
                students={students}
                drives={drives}
                schedules={schedules}
              />
            )}
          </div>
        </main>
      </div>

      {/* AI Job Description Extractor Modal */}
      <JDExtractorModal
        isOpen={isJDExtractorOpen}
        onClose={() => setIsJDExtractorOpen(false)}
        onDeployDrive={handleDeployDrive}
      />
    </div>
  );
}

export default App;
