import { NotificationLog, ScheduledInterview, Student } from '../types/placement';

export interface NotificationTemplateParams {
  studentName: string;
  studentUSN: string;
  companyName: string;
  roundName: string;
  dateTime: string;
  venueOrLink: string;
  checklist?: string;
}

export function generateNotificationMessage(
  templateType: 'INTERVIEW_CALL_LETTER' | 'REMINDER_URGENT' | 'EXCEPTION_UPDATE' | 'OFFER_LETTER',
  channel: 'WhatsApp' | 'Email' | 'SMS',
  params: NotificationTemplateParams
): { subject: string; content: string } {
  switch (templateType) {
    case 'INTERVIEW_CALL_LETTER':
      if (channel === 'WhatsApp') {
        return {
          subject: `Interview Call: ${params.companyName} - ${params.roundName}`,
          content: `⚡ *Campus Placement Alert* ⚡\n\nDear *${params.studentName}* (${params.studentUSN}),\n\nYou have been shortlisted for *${params.roundName}* with *${params.companyName}*.\n\n📅 *Schedule:* ${params.dateTime}\n📍 *Venue/Meet:* ${params.venueOrLink}\n\n📝 *Mandatory Checklist:* Carry 2 hard copies of Resume, College ID card, and maintain formal dress code.\n\nBest of luck!\n- *T.P.O. Placement Operations Agent*`
        };
      }
      return {
        subject: `[ACTION REQUIRED] Interview Call Letter: ${params.companyName} | ${params.roundName}`,
        content: `Dear ${params.studentName},\n\nWe are pleased to inform you that you have cleared the initial screening for ${params.companyName}.\n\nInterview Details:\n- Round: ${params.roundName}\n- Date & Time: ${params.dateTime}\n- Venue: ${params.venueOrLink}\n\nPlease report 15 minutes before your scheduled slot.\n\nRegards,\nTraining & Placement Cell Operations`
      };

    case 'REMINDER_URGENT':
      return {
        subject: `⚠️ Urgent Reminder: ${params.companyName} Interview Slot in 30 Mins`,
        content: `Hi ${params.studentName}, your ${params.roundName} with ${params.companyName} is scheduled in 30 minutes at ${params.venueOrLink}. Please report to the student waiting lounge immediately.`
      };

    case 'EXCEPTION_UPDATE':
      return {
        subject: `Update on Eligibility Waiver: ${params.companyName}`,
        content: `Dear ${params.studentName}, your eligibility waiver request for ${params.companyName} drive has been APPROVED by the Placement Director based on your top technical portfolio.`
      };

    case 'OFFER_LETTER':
      return {
        subject: `🎉 CONGRATULATIONS! Offer Extended by ${params.companyName}`,
        content: `Dear ${params.studentName}, we are thrilled to announce that you have been selected for the position at ${params.companyName}! Further onboarding steps will follow shortly.`
      };
  }
}

export function createNotificationLogsForSchedule(
  schedule: ScheduledInterview,
  student: Student,
  channel: 'WhatsApp' | 'Email' | 'SMS' = 'WhatsApp'
): NotificationLog {
  const venue = schedule.mode === 'Physical' ? schedule.roomNumber : (schedule.meetLink || 'Virtual Meeting Room');
  const templ = generateNotificationMessage('INTERVIEW_CALL_LETTER', channel, {
    studentName: student.name,
    studentUSN: student.usn,
    companyName: schedule.companyName,
    roundName: schedule.roundName,
    dateTime: `${schedule.date} @ ${schedule.startTime} IST`,
    venueOrLink: venue
  });

  return {
    id: `notif-${Date.now()}-${student.id}`,
    recipientName: student.name,
    recipientUSN: student.usn,
    recipientContact: channel === 'Email' ? student.email : student.phone,
    channel,
    subject: templ.subject,
    messageContent: templ.content,
    status: 'Sent',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    driveName: schedule.companyName,
    roundName: schedule.roundName
  };
}
