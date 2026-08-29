import React from 'react';
import Icon from '../common/Icons';

export default function StudentDashboardView({
  student,
  applications = [],
  interviews = [],
  notifications = [],
  onNavigate,
}) {
  const unreadNotifs = notifications.filter((n) => !n.isRead && !n.read);
  const shortlistedCount = applications.filter(
    (a) => a.status === 'shortlisted' || a.status === 'interview_scheduled' || a.status === 'selected'
  ).length;
  const selectedCount = applications.filter((a) => a.status === 'selected' || a.status === 'offer_accepted').length;

  // Find upcoming interview slot dynamically
  const upcomingInterview = interviews.find((int) => int.status === 'rescheduled' || int.status === 'confirmed' || int.status === 'scheduled') || interviews[0] || {
    company: 'TCS Digital',
    role: 'Software Development Engineer',
    date: 'August 25, 2026',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    roomNo: 'Block B - Room 302',
    round: 'Technical Round 1',
    isRecentlyChanged: true,
    previousRoom: 'Block A - Room 204',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-[10px] font-bold">Student Placement Portal</span>
            <span className="text-xs text-indigo-200">ID: {student?.studentId || 'STU101'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome back, {student?.name || 'Rahul Verma'}!</h2>
          <p className="text-xs text-indigo-200 font-medium max-w-xl">
            {student?.department || 'Computer Science & Engineering'} • CGPA:{' '}
            <strong className="text-emerald-400 font-bold">{student?.cgpa || 8.8}</strong> • Graduation:{' '}
            {student?.graduationYear || 2026}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => onNavigate('jobs')}
            className="btn-primary text-xs py-2 px-4 shadow-lg font-bold flex items-center gap-1.5"
          >
            <Icon name="briefcase" className="w-4 h-4" />
            Explore Job Drives
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="btn-secondary text-xs py-2 px-4 font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Icon name="user" className="w-4 h-4" />
            My Profile & Resume
          </button>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => onNavigate('applications')}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">Total Applied</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Icon name="file-text" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{applications.length || 3}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Submitted applications</p>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">Shortlisted</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Icon name="target" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600">{shortlistedCount || 2}</p>
          <p className="text-[10px] text-indigo-500 font-medium mt-1">Cleared AI ATS matching</p>
        </div>

        <div
          onClick={() => onNavigate('interviews')}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">Interviews</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Icon name="calendar" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600">{interviews.length || 1}</p>
          <p className="text-[10px] text-purple-500 font-medium mt-1">Scheduled sessions</p>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">Selected</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Icon name="award" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{selectedCount || 1}</p>
          <p className="text-[10px] text-emerald-500 font-medium mt-1">Offers released</p>
        </div>

        <div
          onClick={() => onNavigate('notifications')}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">Alerts</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Icon name="bell" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{unreadNotifs.length || 2}</p>
          <p className="text-[10px] text-rose-500 font-medium mt-1">Unread notifications</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Interview & Status Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Upcoming Interview Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Icon name="calendar" className="w-4 h-4 text-indigo-600" />
              Upcoming Scheduled Interview
            </h3>
            <span className="badge badge-success text-[10px] font-bold">Confirmed Session</span>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5">
            {/* Room Change Warning Banner */}
            {(upcomingInterview.isRecentlyChanged || upcomingInterview.previousRoom) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-pulse">
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                  <Icon name="alert-triangle" className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-extrabold text-rose-950">🚨 Interview Room Recently Changed</div>
                  <p className="text-rose-800">
                    Previous Room: <del className="font-semibold">{upcomingInterview.previousRoom || 'Block A - Room 204'}</del>{' '}
                    &rarr; <strong>New Room: {upcomingInterview.roomNo || upcomingInterview.roomId || 'Block B - Room 302'}</strong>.
                    Please report directly to the new venue.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-base shadow-md">
                  {upcomingInterview.company ? upcomingInterview.company[0] : 'T'}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{upcomingInterview.company}</h4>
                  <p className="text-xs text-indigo-600 font-bold">{upcomingInterview.role}</p>
                </div>
              </div>

              <span className="badge badge-primary text-xs font-bold self-start sm:self-auto">
                {upcomingInterview.round || 'Technical Interview Round 1'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                <p className="font-bold text-slate-900">{upcomingInterview.date || 'August 25, 2026'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</span>
                <p className="font-bold text-indigo-600">
                  {upcomingInterview.startTime || '10:30 AM'} - {upcomingInterview.endTime || '11:30 AM'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Venue</span>
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Icon name="map-pin" className="w-3.5 h-3.5 text-indigo-600" />
                  {upcomingInterview.roomNo || upcomingInterview.roomId || 'Block B - Room 302'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Panel: Technical Interview Panel A (Distributed Systems)</span>
              <button
                onClick={() => onNavigate('interviews')}
                className="btn-ghost text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View Full Roster &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Notifications & Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Icon name="bell" className="w-4 h-4 text-indigo-600" />
              Recent Alerts
            </h3>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all ${
                  notif.priority === 'urgent'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">{notif.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{notif.timestamp || 'Just now'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
