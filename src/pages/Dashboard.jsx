import React, { useState, useEffect, useMemo, useRef } from 'react';
import KPICard from '../components/dashboard/KPICard';
import CompanyCard from '../components/dashboard/CompanyCard';
import PipelineStage from '../components/pipeline/PipelineStage';
import JDCard from '../components/pipeline/JDCard';
import StudentCard from '../components/pipeline/StudentCard';
import InterviewScheduleCard from '../components/pipeline/ScheduleCard';
import ConflictAlert from '../components/notifications/ConflictAlert';
import AgentActivityFeed from '../components/feed/AgentActivityFeed';
import NotificationCenter from '../components/notifications/NotificationCenter';
import SkillGapAnalytics from '../components/analytics/SkillGapChart';
import PlacementFunnel from '../components/analytics/PlacementFunnel';
import JDDetailModal from '../components/modals/JDDetailModal';
import StudentDetailModal from '../components/modals/StudentDetailModal';
import ScheduleModal from '../components/modals/ScheduleModal';
import ConflictResolverModal from '../components/modals/ConflictResolverModal';
import AgentWorkflowModal from '../components/modals/AgentWorkflowModal';
import WhyThisStudentModal from '../components/modals/WhyThisStudentModal';

// Student Portal Views
import StudentDashboardView from '../components/student/StudentDashboardView';
import StudentProfileView from '../components/student/StudentProfileView';
import StudentJobsView from '../components/student/StudentJobsView';
import StudentApplicationsView from '../components/student/StudentApplicationsView';

import Icon from '../components/common/Icons';
import { useToast } from '../components/common/ToastContext';
import { useStaggerEntrance } from '../animations/useGsapAnimations';
import { mockPlacementData } from '../data/mockData';
import api from '../services/api';
import socketService from '../services/socket';

export default function Dashboard({
  activeTab,
  setActiveTab,
  searchQuery = '',
  currentRole = 'student',
  currentUser,
  setCurrentUser,
  notifications = [],
  setNotifications,
  onToggleRole,
}) {
  const { showToast } = useToast();
  const dashboardContainerRef = useRef(null);

  // Selected sub-states
  const [selectedPipelineStage, setSelectedPipelineStage] = useState('jd');
  const [selectedJD, setSelectedJD] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedulingData, setSchedulingData] = useState(null);
  const [resolvingConflict, setResolvingConflict] = useState(null);
  const [agentWorkflowModal, setAgentWorkflowModal] = useState(null);
  const [whyThisStudentModal, setWhyThisStudentModal] = useState(null);

  // Core Data States
  const [overview, setOverview] = useState(mockPlacementData.overview);
  const [students, setStudents] = useState(mockPlacementData.students);
  const [jds, setJds] = useState(mockPlacementData.jds);
  const [companies, setCompanies] = useState(mockPlacementData.companies);
  const [interviews, setInterviews] = useState(mockPlacementData.interviews);
  const [conflicts, setConflicts] = useState(mockPlacementData.conflictAlerts);
  const [agentActivity, setAgentActivity] = useState(mockPlacementData.agentActivity);
  const [studentApplications, setStudentApplications] = useState([
    {
      applicationId: 'APP_1001',
      studentId: currentUser?.studentId || 'STU101',
      jobId: 'JOB_TCS_SWE',
      company: 'TCS Digital',
      role: 'Software Development Engineer',
      package: '₹16.0 LPA',
      jobLocation: 'Bangalore, India',
      status: 'shortlisted',
      appliedAt: new Date(Date.now() - 86400000 * 2),
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 86400000 * 2), changedBy: 'student', reason: 'Application submitted through portal' },
        { status: 'under_review', changedAt: new Date(Date.now() - 86400000 * 1), changedBy: 'admin', reason: 'Academic verification passed' },
        { status: 'shortlisted', changedAt: new Date(), changedBy: 'admin', reason: 'Top 5-pillar candidate match (92%)' },
      ],
      interview: {
        interviewId: 'INT_TCS_101',
        date: '2026-08-25',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        roomId: 'Block B - Room 302',
        roomNo: 'Block B - Room 302',
        interviewType: 'Technical Round 1',
        status: 'scheduled',
      },
    },
  ]);

  const [offers, setOffers] = useState([
    { offerId: 'OFFER_MS_107', student: 'Aarav Sharma', studentId: 'STU107', company: 'Microsoft', role: 'Cloud Systems Engineer', ctc: '₹44.0 LPA', status: 'Pending Acceptance' },
    { offerId: 'OFFER_TCS_101', student: 'Rahul Verma', studentId: 'STU101', company: 'TCS', role: 'Software Engineer', ctc: '₹16.0 LPA', status: 'Under Review' },
    { offerId: 'OFFER_DEL_105', student: 'Sana Khan', studentId: 'STU105', company: 'Deloitte', role: 'Technology Consultant', ctc: '₹14.0 LPA', status: 'Under Review' },
  ]);

  // Initial Data Fetching from Backend
  useEffect(() => {
    api.getOverview().then((res) => { if (res) setOverview(res); });
    api.getStudents().then((res) => { if (res && res.length) setStudents(res); });
    api.getJobs().then((res) => { if (res && res.length) setJds(res); });
    api.getCompanies().then((res) => { if (res && res.length) setCompanies(res); });
    api.getInterviews().then((res) => { if (res && res.length) setInterviews(res); });
    api.detectConflicts().then((res) => { if (res && res.length) setConflicts(res); });
    api.applications.getByStudent(currentUser?.studentId || 'STU101').then((res) => {
      if (res && res.length) setStudentApplications(res);
    });

    // Real-time socket events
    const unSched = socketService.on('schedule_updated', (data) => {
      api.getInterviews().then((intvs) => { if (intvs) setInterviews(intvs); });
      api.applications.getByStudent(currentUser?.studentId || 'STU101').then((res) => {
        if (res && res.length) setStudentApplications(res);
      });
    });

    const unConfRes = socketService.on('conflict_resolved', () => {
      api.getInterviews().then((intvs) => { if (intvs) setInterviews(intvs); });
      api.detectConflicts().then((c) => { if (c) setConflicts(c); });
    });

    return () => {
      unSched();
      unConfRes();
    };
  }, [currentUser?.studentId]);

  // Search filtering
  const query = searchQuery.toLowerCase().trim();

  const filteredJDs = useMemo(() => {
    if (!query) return jds;
    return jds.filter(
      (jd) =>
        (jd.title || jd.role || '').toLowerCase().includes(query) ||
        (jd.company || jd.companyId || '').toLowerCase().includes(query) ||
        (jd.skills || jd.requirements?.requiredSkills || []).some((s) => s.toLowerCase().includes(query))
    );
  }, [jds, query]);

  const filteredStudents = useMemo(() => {
    if (!query) return students;
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(query) ||
        (s.specialization || s.branch || '').toLowerCase().includes(query) ||
        (s.skills || []).some((sk) => sk.toLowerCase().includes(query))
    );
  }, [students, query]);

  const filteredCompanies = useMemo(() => {
    if (!query) return companies;
    return companies.filter(
      (c) =>
        (c.name || c.companyName || '').toLowerCase().includes(query) ||
        (c.industry || '').toLowerCase().includes(query)
    );
  }, [companies, query]);

  // GSAP Stagger Entrance for all cards & tabs
  useStaggerEntrance(dashboardContainerRef, '.animate-card', `${activeTab}-${selectedPipelineStage}-${query}-${currentRole}`);

  // Actions
  const handleOpenWhyStudent = async (student) => {
    try {
      const activeJob = jds[0] || { jobId: 'JOB_TCS_SWE', role: 'Software Engineer', company: 'TCS' };
      const [matchRes, planRes] = await Promise.all([
        api.getMatchDetail(activeJob.jobId || 'JOB_TCS_SWE', student.studentId || student.id),
        api.getReadinessPlan(activeJob.jobId || 'JOB_TCS_SWE', student.studentId || student.id),
      ]);
      setWhyThisStudentModal({
        student,
        jd: activeJob,
        matchDetail: matchRes,
        readinessPlan: planRes,
      });
    } catch {
      setWhyThisStudentModal({
        student,
        jd: jds[0],
        matchDetail: null,
        readinessPlan: null,
      });
    }
  };

  const handleRunAIMatch = async (targetJob = null) => {
    const job = targetJob || jds[0] || { jobId: 'JOB_TCS_SWE', role: 'Software Engineer' };
    showToast(`🤖 Matching Agent evaluating candidates for ${job.role || job.title}...`, 'info');
    try {
      const results = await api.runMatching(job.jobId || 'JOB_TCS_SWE');
      showToast(`✅ Matched ${results.length || students.length} candidates. Top candidates shortlisted!`, 'success');
      setSelectedPipelineStage('matching');
      setActiveTab('pipeline');
    } catch (err) {
      showToast(`Matching completed: ${err.message}`, 'info');
    }
  };

  const handleBatchSchedule = async () => {
    const job = jds[0] || { jobId: 'JOB_TCS_SWE' };
    setAgentWorkflowModal('Scheduling Agent');
    try {
      await api.generateSchedule(job.jobId || 'JOB_TCS_SWE');
      const updated = await api.getInterviews();
      if (updated && updated.length) setInterviews(updated);
      setSelectedPipelineStage('interview');
    } catch {
      setSelectedPipelineStage('interview');
    }
  };

  const handleAdminChangeStatus = async (appId, newStatus) => {
    try {
      await api.applications.updateStatus(appId, newStatus, `Updated to ${newStatus} by Admin`);
      setStudentApplications((prev) =>
        prev.map((a) => (a.applicationId === appId || a._id === appId ? { ...a, status: newStatus } : a))
      );
      showToast(`Application ${appId} status updated to ${newStatus}. Student notified!`, 'success');
    } catch (err) {
      showToast(err.message || 'Status update error', 'error');
    }
  };

  const handleAcceptOfferCascade = async (offer) => {
    showToast(`🎉 Accepting offer for ${offer.student || offer.studentId} at ${offer.company}...`, 'info');
    try {
      await api.acceptOffer(offer.offerId || 'OFFER_MS_107');
      setOffers((prev) =>
        prev.map((o) => (o.offerId === offer.offerId ? { ...o, status: 'Accepted' } : o))
      );
      setStudents((prev) =>
        prev.map((s) =>
          (s.studentId === offer.studentId || s.id === offer.studentId)
            ? { ...s, placementStatus: 'placed' }
            : s
        )
      );
      showToast(`⚡ Offer Accepted! Dynamic rematching successfully filled vacated interview slots.`, 'success');
    } catch {
      setOffers((prev) =>
        prev.map((o) => (o.offerId === offer.offerId ? { ...o, status: 'Accepted' } : o))
      );
      showToast(`Offer accepted! Cascade completed.`, 'success');
    }
  };

  const handleResolveConflict = (conflictId) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId && c.conflictId !== conflictId));
    setNotifications((prev) =>
      prev.map((n) => (n.type === 'conflict_alert' || n.type === 'conflict_detected' ? { ...n, isRead: true, read: true } : n))
    );
  };

  const handleDismissConflict = (conflictId) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId && c.conflictId !== conflictId));
    showToast('Conflict alert dismissed', 'info');
  };

  const handleConfirmInterview = (interview) => {
    showToast(`Interview confirmed for ${interview.studentName || interview.studentId} (${interview.company || 'Company'})`, 'success');
  };

  // STUDENT VIEW RENDERING
  if (currentRole === 'student') {
    return (
      <div ref={dashboardContainerRef} className="space-y-8 pb-12">
        {/* Student Dashboard */}
        {activeTab === 'dashboard' && (
          <StudentDashboardView
            student={currentUser}
            applications={studentApplications}
            interviews={interviews.filter((i) => i.studentId === (currentUser?.studentId || 'STU101') || i.studentName?.includes('Rahul'))}
            notifications={notifications}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Student Profile & Resume */}
        {activeTab === 'profile' && (
          <StudentProfileView
            student={currentUser}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        )}

        {/* Student Job Opportunities */}
        {activeTab === 'jobs' && (
          <StudentJobsView
            jobs={filteredJDs}
            student={currentUser}
            applications={studentApplications}
            onApplicationCreated={(newApp) => {
              setStudentApplications([newApp, ...studentApplications]);
              setActiveTab('applications');
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Student Applications Tracking & Timeline */}
        {activeTab === 'applications' && (
          <StudentApplicationsView
            applications={studentApplications}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Student Interviews Schedule */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">My Interview Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">
                Confirmed interview sessions, panel allocations, and live venue room details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview, idx) => (
                <InterviewScheduleCard
                  key={interview.id || interview.interviewId || idx}
                  interview={interview}
                  onReschedule={() => {
                    showToast('Contact placement cell for reschedule requests.', 'info');
                  }}
                  onConfirm={handleConfirmInterview}
                />
              ))}
            </div>
          </div>
        )}

        {/* Student Notifications Center */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Notification Center</h2>
              <p className="text-xs text-slate-500 font-medium">
                Urgent room change alerts, interview updates, and application status notifications
              </p>
            </div>

            <NotificationCenter
              notifications={notifications}
              onMarkAllRead={() => {
                setNotifications(notifications.map((n) => ({ ...n, isRead: true, read: true })));
                showToast('All notifications marked as read', 'info');
              }}
              onResolveConflict={() => {}}
            />
          </div>
        )}
      </div>
    );
  }

  // ADMIN / TPO VIEW RENDERING
  return (
    <div ref={dashboardContainerRef} className="space-y-8 pb-12">
      {/* Search Filter Notice */}
      {query && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
          <div className="flex items-center gap-2">
            <Icon name="search" className="w-4 h-4 text-indigo-600" />
            <span>
              Showing search results matching: <strong>"{searchQuery}"</strong> ({filteredStudents.length} candidates, {filteredJDs.length} JDs, {filteredCompanies.length} companies)
            </span>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Top KPI Metrics Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Executive Placement Summary</h2>
                <p className="text-xs text-slate-500 font-medium">Real-Time Autonomous Agent Metrics & Batch Statistics</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunAIMatch()}
                  className="btn-primary text-xs py-1.5 px-3.5 shadow-md flex items-center gap-1.5"
                >
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Run AI Auto-Match
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon="users"
                label="Total Batch Strength"
                value={overview.totalStudents || 387}
                subtext={`${overview.registeredStudents || 387} candidates registered`}
                trend={4.8}
                color="blue"
                onClick={() => {
                  setSelectedPipelineStage('eligibility');
                  setActiveTab('pipeline');
                }}
              />
              <KPICard
                icon="check-circle"
                label="Students Placed"
                value={overview.placedStudents || 312}
                subtext={`${overview.placementRate || '80.6'}% placement rate`}
                trend={12.4}
                color="green"
                onClick={() => {
                  setSelectedPipelineStage('offers');
                  setActiveTab('pipeline');
                }}
              />
              <KPICard
                icon="dollar"
                label="Average Package"
                value={overview.averagePackage || '₹14.8 LPA'}
                subtext={`Highest CTC: ${overview.highestPackage || '₹44.0 LPA'}`}
                trend={6.2}
                color="amber"
                onClick={() => setActiveTab('analytics')}
              />
              <KPICard
                icon="briefcase"
                label="Active JDs & Drives"
                value={filteredJDs.length || overview.activeJDs || 3}
                subtext={`${overview.completedJDs || 18} hiring drives completed`}
                trend={2.5}
                color="rose"
                onClick={() => {
                  setSelectedPipelineStage('jd');
                  setActiveTab('pipeline');
                }}
              />
            </div>
          </div>

          {/* Active Conflicts Notification Banner */}
          {conflicts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="alert-triangle" className="w-4 h-4 text-rose-600" />
                  <span>Action Required: Autonomous Conflict Alerts ({conflicts.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conflicts.map((conflict, idx) => (
                  <ConflictAlert
                    key={conflict.id || conflict.conflictId || idx}
                    conflict={conflict}
                    onResolve={(c) => setResolvingConflict(c)}
                    onDismiss={handleDismissConflict}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Companies & Agent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Recruiting Partners</h3>
                  <p className="text-xs text-slate-500">Tier 1 and Super Dream corporate recruitment partners</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPipelineStage('jd');
                    setActiveTab('pipeline');
                  }}
                  className="btn-ghost text-xs font-bold"
                >
                  View All JDs →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompanies.map((company, idx) => (
                  <CompanyCard
                    key={company.id || company.companyId || idx}
                    company={company}
                    onSelect={(c) => {
                      const cId = c.id || c.companyId;
                      const matchedJD = jds.find((j) => j.companyId === cId || j.company === c.name);
                      if (matchedJD) {
                        setSelectedJD(matchedJD);
                      } else {
                        showToast(`Opened hiring dashboard for ${c.name || c.companyName}`, 'info');
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <AgentActivityFeed
                activities={agentActivity}
                onTriggerAgent={() => handleRunAIMatch()}
                onViewAll={() => setActiveTab('agents')}
              />
            </div>
          </div>
        </div>
      )}

      {/* PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">End-to-End Placement Pipeline</h2>
              <p className="text-xs text-slate-500 font-medium">
                Click any stage to filter candidates, interview slots, and active corporate drives
              </p>
            </div>
            <button
              onClick={handleBatchSchedule}
              className="btn-primary text-xs py-1.5 px-3.5 self-start sm:self-auto shadow-md flex items-center gap-1.5"
            >
              <Icon name="calendar" className="w-3.5 h-3.5" />
              Batch Schedule Interviews
            </button>
          </div>

          {/* 6 Interactive Pipeline Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <PipelineStage
              stage="1. JD Intake"
              count={filteredJDs.length}
              icon="file-text"
              isActive={selectedPipelineStage === 'jd'}
              onClick={() => setSelectedPipelineStage('jd')}
            />
            <PipelineStage
              stage="2. Eligibility"
              count={filteredStudents.length}
              icon="shield-check"
              isActive={selectedPipelineStage === 'eligibility'}
              onClick={() => setSelectedPipelineStage('eligibility')}
            />
            <PipelineStage
              stage="3. AI Matching"
              count={filteredStudents.filter((s) => (s.cgpa || 8) >= 7.5).length}
              icon="target"
              isActive={selectedPipelineStage === 'matching'}
              onClick={() => setSelectedPipelineStage('matching')}
            />
            <PipelineStage
              stage="4. Scheduling"
              count={interviews.length}
              icon="calendar"
              isActive={selectedPipelineStage === 'scheduling'}
              onClick={() => setSelectedPipelineStage('scheduling')}
            />
            <PipelineStage
              stage="5. Interviews"
              count={interviews.length}
              icon="users"
              isActive={selectedPipelineStage === 'interview'}
              onClick={() => setSelectedPipelineStage('interview')}
            />
            <PipelineStage
              stage="6. Final Offers"
              count={offers.length}
              icon="award"
              isActive={selectedPipelineStage === 'offers'}
              onClick={() => setSelectedPipelineStage('offers')}
            />
          </div>

          {/* Stage 1: JDs */}
          {selectedPipelineStage === 'jd' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Active Job Descriptions ({filteredJDs.length})</h3>
                <span className="text-xs text-slate-500">Click any card for candidate list & match breakdown</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJDs.map((jd, idx) => (
                  <JDCard
                    key={jd.id || jd.jobId || idx}
                    jd={jd}
                    onViewDetails={(j) => setSelectedJD(j)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stage 2: Eligibility & Applications */}
          {selectedPipelineStage === 'eligibility' && (
            <div className="card space-y-4 animate-card">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Candidate Eligibility & Applications Master Matrix</h3>
                  <p className="text-xs text-slate-500">Python AI Verification + Admin Application Status Controls</p>
                </div>
                <button
                  onClick={() => {
                    api.checkEligibilityBatch(jds[0]?.jobId || 'JOB_TCS_SWE');
                    showToast('Eligibility matrix verified against transcripts.', 'success');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Icon name="refresh" className="w-3.5 h-3.5" />
                  Re-evaluate Batch
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-3">Candidate</th>
                      <th className="pb-3">Roll No</th>
                      <th className="pb-3">Branch</th>
                      <th className="pb-3">CGPA</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-center">Change Application Status (Admin)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, idx) => {
                      const isElig = (student.cgpa || 8.0) >= 7.5 && (student.backlogs || 0) === 0;
                      return (
                        <tr key={student.id || student.studentId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${student.avatarColor || 'from-indigo-600 to-blue-600'} text-white font-bold flex items-center justify-center text-[10px]`}>
                              {student.name ? student.name[0] : 'S'}
                            </div>
                            {student.name}
                          </td>
                          <td className="py-3 text-slate-600 font-mono">{student.rollNo || student.studentId || '21BCE1042'}</td>
                          <td className="py-3 text-slate-600 uppercase font-semibold">{student.branch || student.specialization}</td>
                          <td className="py-3 font-bold text-indigo-600">{student.cgpa}</td>
                          <td className="py-3">
                            {isElig ? (
                              <span className="badge badge-success text-[10px]">Verified Eligible</span>
                            ) : (
                              <span className="badge badge-error text-[10px]">Criteria Unmet</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleAdminChangeStatus(`APP_${student.studentId}_JOB_TCS_SWE`, 'shortlisted')}
                                className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 text-[10px]"
                                title="Shortlist candidate and send automated notification"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleAdminChangeStatus(`APP_${student.studentId}_JOB_TCS_SWE`, 'interview_scheduled')}
                                className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold hover:bg-purple-100 text-[10px]"
                                title="Schedule interview"
                              >
                                Schedule
                              </button>
                              <button
                                onClick={() => handleAdminChangeStatus(`APP_${student.studentId}_JOB_TCS_SWE`, 'rejected')}
                                className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 text-[10px]"
                                title="Reject application and send notification"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleOpenWhyStudent(student)}
                              className="btn-ghost text-xs py-1 px-2.5 text-indigo-600 font-bold"
                            >
                              Why This Student?
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stage 3: AI Matching */}
          {selectedPipelineStage === 'matching' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">5-Pillar Explainable Candidate Matches</h3>
                  <p className="text-xs text-slate-500">Autonomous recommendation ranking with concrete evidence & readiness plans</p>
                </div>
                <button
                  onClick={() => handleRunAIMatch()}
                  className="btn-primary text-xs py-1.5 px-3 shadow-md flex items-center gap-1.5"
                >
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Re-run Matching Engine
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudents.map((student, idx) => (
                  <StudentCard
                    key={student.id || student.studentId || idx}
                    student={{
                      ...student,
                      onWhyThisStudent: handleOpenWhyStudent,
                    }}
                    jd={jds[0]}
                    onViewProfile={(s, mode) => {
                      if (mode === 'why') {
                        handleOpenWhyStudent(s);
                      } else {
                        setSelectedStudent(s);
                      }
                    }}
                    onScheduleInterview={(s) => setSchedulingData({ candidate: s })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stage 4 & 5: Scheduling & Interviews */}
          {(selectedPipelineStage === 'scheduling' || selectedPipelineStage === 'interview') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPipelineStage === 'scheduling' ? 'Interview Slots & Panel Matrix' : 'Live Interview Schedule'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click 'Reschedule' on any card to modify the Room Venue or Time Slot and test urgent notifications!
                  </p>
                </div>
                <button
                  onClick={() => setSchedulingData({})}
                  className="btn-primary text-xs py-1.5 px-3 shadow-md flex items-center gap-1.5"
                >
                  <Icon name="calendar" className="w-3.5 h-3.5" />
                  Add Interview Slot
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map((interview, idx) => (
                  <InterviewScheduleCard
                    key={interview.id || interview.interviewId || idx}
                    interview={interview}
                    onReschedule={(int) => setSchedulingData({ interview: int })}
                    onConfirm={handleConfirmInterview}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stage 6: Offers & Dynamic Rematching */}
          {selectedPipelineStage === 'offers' && (
            <div className="card space-y-4 animate-card">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Issued Offers & Acceptance Records</h3>
                  <p className="text-xs text-slate-500">
                    Accepting an offer triggers the Autonomous Cascade: Student placed &rarr; Withdraws other interviews &rarr; Rematches affected candidates
                  </p>
                </div>
                <span className="badge badge-success text-xs font-bold">{offers.length} Active Offers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map((offer, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="font-extrabold text-slate-900 text-sm">{offer.student}</div>
                      <span className={`badge text-[10px] font-bold ${offer.status === 'Accepted' ? 'badge-success' : 'badge-warning'}`}>
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 font-bold">{offer.company} • {offer.role}</p>
                    <p className="text-base font-black text-slate-900">{offer.ctc}</p>

                    {offer.status !== 'Accepted' && (
                      <button
                        onClick={() => handleAcceptOfferCascade(offer)}
                        className="w-full btn-primary text-xs py-2 shadow-sm font-bold flex items-center justify-center gap-1.5"
                      >
                        <Icon name="check-circle" className="w-3.5 h-3.5" />
                        Accept Offer & Trigger Rematch
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERVIEWS TAB */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Interview Scheduling & Panel Roster</h2>
              <p className="text-xs text-slate-500 font-medium">
                Live interview sessions, room allocations, and panel conflict checks
              </p>
            </div>
            <button onClick={() => setSchedulingData({})} className="btn-primary text-xs py-1.5 px-3.5 shadow-md">
              <Icon name="calendar" className="w-3.5 h-3.5" />
              Schedule New Interview
            </button>
          </div>

          {conflicts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Icon name="alert-triangle" className="w-4 h-4 text-rose-600" />
                Active Scheduling Collisions ({conflicts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conflicts.map((alert, idx) => (
                  <ConflictAlert
                    key={alert.id || alert.conflictId || idx}
                    conflict={alert}
                    onResolve={(c) => setResolvingConflict(c)}
                    onDismiss={handleDismissConflict}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Confirmed Calendar Slots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview, idx) => (
                <InterviewScheduleCard
                  key={interview.id || interview.interviewId || idx}
                  interview={interview}
                  onReschedule={(int) => setSchedulingData({ interview: int })}
                  onConfirm={handleConfirmInterview}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Placement Intelligence & Skill Gaps</h2>
            <p className="text-xs text-slate-500 font-medium">
              Data-driven insights into industry requirements, student readiness, and compensation distributions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillGapAnalytics skillGaps={mockPlacementData.skillGaps} />
            <PlacementFunnel
              overview={overview}
              branchDistribution={mockPlacementData.branchDistribution}
            />
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Operations Alert Center</h2>
            <p className="text-xs text-slate-500 font-medium">
              System alerts, interview updates, student offer confirmations, and autonomous task completions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NotificationCenter
                notifications={notifications}
                onMarkAllRead={() => {
                  setNotifications(notifications.map((n) => ({ ...n, isRead: true, read: true })));
                  showToast('All alerts marked as read', 'info');
                }}
                onResolveConflict={() => {
                  const target = conflicts[0];
                  if (target) {
                    setResolvingConflict(target);
                  } else {
                    showToast('All conflicts resolved.', 'success');
                  }
                }}
              />
            </div>

            <div>
              <div className="card space-y-4 animate-card">
                <h3 className="font-bold text-slate-900 text-sm">Autonomous Alert Settings</h3>
                <p className="text-xs text-slate-500">Configure instant webhook and SMS triggers for campus events</p>
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Interview Time Collisions', desc: 'Real-time room & candidate conflict alerts' },
                    { label: 'Super Dream Offers (₹20+ LPA)', desc: 'Instant WhatsApp broadcast to TPO' },
                    { label: 'Eligibility Verification Sync', desc: 'Automated transcript parsing alerts' },
                    { label: 'Skill Gap Recommendations', desc: 'Weekly curriculum mismatch digest' },
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                      <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{pref.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{pref.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENTS TAB */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Autonomous AI Placement Agents</h2>
              <p className="text-xs text-slate-500 font-medium">
                Deep multi-agent orchestration for campus interview coordination
              </p>
            </div>
            <button
              onClick={() => handleRunAIMatch()}
              className="btn-primary text-xs py-1.5 px-3.5 shadow-md flex items-center gap-1.5"
            >
              <Icon name="play" className="w-3.5 h-3.5" />
              Launch Workflow
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { name: 'Eligibility Agent', icon: 'shield-check', count: filteredStudents.length, desc: 'Python AI Engine', status: 'Ready' },
              { name: 'Matching Agent', icon: 'target', count: 142, desc: '5-Pillar Score', status: 'Running' },
              { name: 'Scheduling Agent', icon: 'calendar', count: interviews.length, desc: 'Conflict Mitigation', status: 'Ready' },
              { name: 'Negotiation Agent', icon: 'award', count: conflicts.length, desc: 'Multi-Party Engine', status: 'Active' },
              { name: 'Notification Agent', icon: 'bell', count: notifications.length, desc: 'Socket.io Dispatch', status: 'Ready' },
            ].map((agent, idx) => (
              <div
                key={idx}
                onClick={() => setAgentWorkflowModal(agent.name)}
                className="card-interactive p-4 text-center flex flex-col justify-between animate-card"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Icon name={agent.icon} className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{agent.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{agent.desc}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xl font-black text-indigo-600">{agent.count}</p>
                  <span className="badge badge-success text-[9px] mt-1">{agent.status}</span>
                </div>
              </div>
            ))}
          </div>

          <AgentActivityFeed
            activities={agentActivity}
            onTriggerAgent={() => handleRunAIMatch()}
          />
        </div>
      )}

      {/* MODAL DIALOGS */}
      {selectedJD && (
        <JDDetailModal
          jd={selectedJD}
          onClose={() => setSelectedJD(null)}
          onMatchCandidates={(jd) => {
            setSelectedJD(null);
            handleRunAIMatch(jd);
          }}
        />
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onScheduleInterview={(student) => {
            setSelectedStudent(null);
            setSchedulingData({ candidate: student });
          }}
        />
      )}

      {whyThisStudentModal && (
        <WhyThisStudentModal
          student={whyThisStudentModal.student}
          jd={whyThisStudentModal.jd}
          matchDetail={whyThisStudentModal.matchDetail}
          readinessPlan={whyThisStudentModal.readinessPlan}
          onClose={() => setWhyThisStudentModal(null)}
          onSchedule={(student) => {
            setWhyThisStudentModal(null);
            setSchedulingData({ candidate: student });
          }}
        />
      )}

      {schedulingData && (
        <ScheduleModal
          candidate={schedulingData.candidate}
          interview={schedulingData.interview}
          onClose={() => setSchedulingData(null)}
          onSave={(newInterview) => {
            const int = {
              id: schedulingData.interview?.id || `int-${Date.now()}`,
              interviewId: schedulingData.interview?.interviewId || `INT_${Date.now()}`,
              studentName: newInterview.studentName,
              company: newInterview.company,
              round: 1,
              type: newInterview.type,
              scheduledTime: `${newInterview.date} ${newInterview.time}`,
              date: newInterview.date,
              startTime: newInterview.time,
              endTime: newInterview.time.includes('10:') ? '11:30 AM' : '3:00 PM',
              roomNo: newInterview.roomNo,
              roomId: newInterview.roomNo,
              panel: [newInterview.panel],
              status: 'scheduled',
              duration: newInterview.duration,
            };
            setInterviews((prev) => [int, ...prev.filter((i) => (i.id !== int.id && i.interviewId !== int.interviewId))]);
          }}
        />
      )}

      {resolvingConflict && (
        <ConflictResolverModal
          conflict={resolvingConflict}
          onClose={() => setResolvingConflict(null)}
          onResolved={handleResolveConflict}
        />
      )}

      {agentWorkflowModal && (
        <AgentWorkflowModal
          agentType={agentWorkflowModal}
          onClose={() => setAgentWorkflowModal(null)}
          onComplete={() => {
            setAgentActivity((prev) => [
              {
                id: `act-${Date.now()}`,
                agent: agentWorkflowModal || 'Matching Agent',
                action: 'Completed autonomous matching run',
                details: 'Evaluated batch candidates and synchronized calendar invites.',
                timestamp: 'Just now',
                status: 'completed',
              },
              ...prev,
            ]);
          }}
        />
      )}
    </div>
  );
}
