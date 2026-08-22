import React, { useState } from 'react';
import { NotificationLog, ScheduledInterview, Student } from '../../types/placement';
import { generateNotificationMessage, createNotificationLogsForSchedule } from '../../services/commsEngine';
import {
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Filter,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NotificationHubProps {
  notifications: NotificationLog[];
  schedules: ScheduledInterview[];
  students: Student[];
  onDispatchNotification: (log: NotificationLog) => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({
  notifications,
  schedules,
  students,
  onDispatchNotification
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'WhatsApp' | 'Email' | 'SMS'>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<'INTERVIEW_CALL_LETTER' | 'REMINDER_URGENT' | 'EXCEPTION_UPDATE' | 'OFFER_LETTER'>('INTERVIEW_CALL_LETTER');
  const [customStudentName, setCustomStudentName] = useState('Aarav Sharma');
  const [customUSN, setCustomUSN] = useState('1RV21CS045');
  const [customCompany, setCustomCompany] = useState('Google');
  const [customRound, setCustomRound] = useState('Technical Round 1');
  const [customVenue, setCustomVenue] = useState('Room CR-101 (Pavilion 1F)');

  const preview = generateNotificationMessage(selectedTemplate, 'WhatsApp', {
    studentName: customStudentName,
    studentUSN: customUSN,
    companyName: customCompany,
    roundName: customRound,
    dateTime: 'Today @ 14:30 IST',
    venueOrLink: customVenue
  });

  const filteredLogs = notifications.filter(n => {
    if (selectedChannel === 'ALL') return true;
    return n.channel === selectedChannel;
  });

  const handleBroadcast = () => {
    const newLog: NotificationLog = {
      id: `notif-${Date.now()}`,
      recipientName: customStudentName,
      recipientUSN: customUSN,
      recipientContact: '+91 98450 12345',
      channel: 'WhatsApp',
      subject: preview.subject,
      messageContent: preview.content,
      status: 'Delivered',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      driveName: customCompany,
      roundName: customRound
    };

    onDispatchNotification(newLog);

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white font-['Outfit']">
          Student Omnichannel Comms & Dispatch Engine
        </h2>
        <p className="text-xs text-slate-400">
          Automated AI call letters, urgent slot reminders, WhatsApp notifications, and delivery telemetry
        </p>
      </div>

      {/* Dynamic AI Template Composer & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              AI Message Customizer
            </h3>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Active Template
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Template Type</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="INTERVIEW_CALL_LETTER">Interview Call Letter</option>
                <option value="REMINDER_URGENT">Urgent 30-Min Reminder</option>
                <option value="EXCEPTION_UPDATE">Waiver Exception Update</option>
                <option value="OFFER_LETTER">Selection / Offer Letter</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Company Drive</label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Student Name & USN</label>
              <input
                type="text"
                value={customStudentName}
                onChange={(e) => setCustomStudentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Venue / Room / Link</label>
              <input
                type="text"
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleBroadcast}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Simulate Live Dispatch to Candidate</span>
          </button>
        </div>

        {/* Live Device Simulator (WhatsApp / SMS Mock) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Candidate Screen Preview (WhatsApp UI)</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Simulated Receiver</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b141a] border border-slate-800 font-sans shadow-inner">
              <div className="text-[10px] text-slate-400 mb-2 flex items-center justify-between border-b border-slate-800/80 pb-1">
                <span>Placement Operations Desk</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {preview.content}
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] text-cyan-400 flex items-center justify-end gap-1 font-mono">
                  <CheckCheck className="w-3.5 h-3.5" /> Read
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 italic">
            💡 Templates include personalized reporting checklists, Google Maps directions, and panel details.
          </div>
        </div>
      </div>

      {/* Live Dispatch Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-['Outfit']">Live Comms Dispatch Logs</h3>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {(['ALL', 'WhatsApp', 'Email', 'SMS'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedChannel === ch ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Company & Round</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {log.recipientName}
                    <span className="block text-[11px] font-mono font-normal text-slate-400">{log.recipientUSN}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      log.channel === 'WhatsApp'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : log.channel === 'Email'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {log.channel}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-200">{log.driveName}</span>
                    <span className="block text-[11px] text-slate-400">{log.roundName}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.subject}</td>

                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {log.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
