import { ScheduledInterview, PlacementDrive, Student, PanelMember, Room3D } from '../types/placement';

export interface ScheduleGenerationRequest {
  drive: PlacementDrive;
  shortlistedStudents: Student[];
  roundNumber: number;
  panels: PanelMember[];
  rooms: Room3D[];
  existingSchedules: ScheduledInterview[];
  interviewDate: string;
  startHour: number; // e.g. 14 for 2:00 PM
}

export function autoGenerateRoundSchedules(req: ScheduleGenerationRequest): {
  newSchedules: ScheduledInterview[];
  updatedRooms: Room3D[];
  updatedPanels: PanelMember[];
  unallocatedStudents: Student[];
} {
  const newSchedules: ScheduledInterview[] = [];
  const unallocatedStudents: Student[] = [];
  
  const roundConfig = req.drive.rounds.find(r => r.roundNumber === req.roundNumber) || {
    roundNumber: req.roundNumber,
    name: `Technical Round ${req.roundNumber}`,
    type: 'Technical',
    durationMinutes: 60,
    mode: 'Physical'
  };

  // Clone panels and rooms to track mutable load
  const currentPanels = req.panels.map(p => ({ ...p }));
  const currentRooms = req.rooms.map(r => ({ ...r }));

  let currentSlotMinute = req.startHour * 60; // in minutes from midnight

  req.shortlistedStudents.forEach((student, index) => {
    // Find an available panel matching company or domain
    const eligiblePanel = currentPanels.find(
      p => (p.company.toLowerCase() === req.drive.companyName.toLowerCase() || p.assignedSlotsCount < p.maxDailySlots) &&
           p.assignedSlotsCount < p.maxDailySlots
    ) || currentPanels.find(p => p.assignedSlotsCount < p.maxDailySlots);

    // Find available room
    const eligibleRoom = currentRooms.find(r => r.status === 'Available') || currentRooms[index % currentRooms.length];

    if (!eligiblePanel || !eligibleRoom) {
      unallocatedStudents.push(student);
      return;
    }

    const startH = Math.floor(currentSlotMinute / 60);
    const startM = currentSlotMinute % 60;
    const endSlotMinute = currentSlotMinute + roundConfig.durationMinutes;
    const endH = Math.floor(endSlotMinute / 60);
    const endM = endSlotMinute % 60;

    const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const slotId = `slot-gen-${Date.now()}-${student.id}`;

    const scheduleItem: ScheduledInterview = {
      id: slotId,
      driveId: req.drive.id,
      companyName: req.drive.companyName,
      roundNumber: roundConfig.roundNumber,
      roundName: roundConfig.name,
      candidateId: student.id,
      candidateName: student.name,
      candidateUSN: student.usn,
      candidateAvatar: student.avatar,
      candidateBranch: student.branch,
      panelId: eligiblePanel.id,
      panelName: eligiblePanel.name,
      panelDesignation: `${eligiblePanel.designation} @ ${eligiblePanel.company}`,
      roomId: eligibleRoom.id,
      roomNumber: `${eligibleRoom.roomNumber} (${eligibleRoom.name})`,
      date: req.interviewDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      mode: roundConfig.mode,
      meetLink: roundConfig.mode === 'Virtual' ? `https://meet.google.com/plm-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` : undefined,
      status: 'Scheduled'
    };

    newSchedules.push(scheduleItem);

    // Update panel load
    eligiblePanel.assignedSlotsCount += 1;
    if (eligiblePanel.assignedSlotsCount >= eligiblePanel.maxDailySlots) {
      eligiblePanel.currentStatus = 'Busy';
    }

    // Update room status
    eligibleRoom.status = 'In-Session';
    eligibleRoom.activeInterviewId = slotId;
    eligibleRoom.currentCandidateName = `${student.name} (${student.usn})`;
    eligibleRoom.currentCandidateAvatar = student.avatar;
    eligibleRoom.currentPanelName = eligiblePanel.name;
    eligibleRoom.currentRound = roundConfig.name;

    // Advance time slot for next sequential interview if same panel
    currentSlotMinute += (roundConfig.durationMinutes + 15); // 15 min buffer
  });

  return {
    newSchedules,
    updatedRooms: currentRooms,
    updatedPanels: currentPanels,
    unallocatedStudents
  };
}
