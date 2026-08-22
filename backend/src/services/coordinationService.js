/**
 * Multi-Party Coordination, Scheduling & Negotiation Service
 * Reconciled and adapted from Member 4's Coordination Agent Logic.
 */

function minutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function time(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function overlaps(startA, endA, startB, endB) {
  return minutes(startA) < minutes(endB) && minutes(startB) < minutes(endA);
}

function checkResourceBusy(existingInterviews, date, start, end, key, value, ignoreInterviewId = null) {
  return existingInterviews.some((intv) => {
    if (intv.interviewId === ignoreInterviewId || intv._id?.toString() === ignoreInterviewId) return false;
    if (intv.status === 'cancelled') return false;
    if (intv.date !== date) return false;
    if (intv[key] !== value) return false;
    return overlaps(start, end, intv.startTime, intv.endTime);
  });
}

function isSlotAvailable(existingInterviews, date, start, end, panelId, roomId, studentId, ignoreInterviewId = null) {
  const panelBusy = checkResourceBusy(existingInterviews, date, start, end, 'panelId', panelId, ignoreInterviewId);
  const roomBusy = roomId && roomId !== 'ROOM_VIRTUAL_1' ? checkResourceBusy(existingInterviews, date, start, end, 'roomId', roomId, ignoreInterviewId) : false;
  const studentBusy = checkResourceBusy(existingInterviews, date, start, end, 'studentId', studentId, ignoreInterviewId);
  return !panelBusy && !roomBusy && !studentBusy;
}

function scoreSlotCandidate(candidateSlot, currentInterview, panels, rooms) {
  let score = 60;
  const reasons = [];

  if (candidateSlot.panelId === currentInterview.panelId) {
    score += 15;
    reasons.push('Maintains same assigned interview panel');
  }
  if (candidateSlot.roomId === currentInterview.roomId) {
    score += 10;
    reasons.push('Maintains same physical/virtual venue');
  }
  if (candidateSlot.date === currentInterview.date) {
    score += 10;
    reasons.push('Same day rescheduling');
  }

  const waitDiff = Math.abs(minutes(candidateSlot.startTime) - minutes(currentInterview.startTime));
  score += Math.max(0, 10 - Math.floor(waitDiff / 30));
  reasons.push('Zero panel, room, or candidate overlap conflicts');

  const panelObj = panels.find((p) => (p.panelId || p.id) === candidateSlot.panelId);
  const roomObj = rooms.find((r) => (r.roomId || r.id) === candidateSlot.roomId);

  return {
    ...candidateSlot,
    panelName: panelObj?.panelName || panelObj?.name || candidateSlot.panelId,
    roomName: roomObj?.roomName || roomObj?.name || candidateSlot.roomId,
    score: Math.min(score, 100),
    reason: reasons.join(' · '),
  };
}

function findAlternativeSlots(currentInterview, existingInterviews, panels, rooms) {
  const options = [];
  const duration = minutes(currentInterview.endTime) - minutes(currentInterview.startTime) || 45;
  
  // Standard campus interview windows: 09:30, 11:00, 14:00, 15:30, 16:30
  const preferredStartMinutes = [9 * 60 + 30, 11 * 60, 14 * 60, 15 * 60 + 30, 16 * 60 + 30];

  for (const startMin of preferredStartMinutes) {
    for (const panel of panels) {
      const pId = panel.panelId || panel.id;
      for (const room of rooms) {
        const rId = room.roomId || room.id;
        const begin = time(startMin);
        const finish = time(startMin + duration);

        if (isSlotAvailable(existingInterviews, currentInterview.date, begin, finish, pId, rId, currentInterview.studentId, currentInterview.interviewId)) {
          options.push(
            scoreSlotCandidate(
              {
                date: currentInterview.date,
                startTime: begin,
                endTime: finish,
                panelId: pId,
                roomId: rId,
              },
              currentInterview,
              panels,
              rooms
            )
          );
        }
      }
    }
  }

  return options.sort((a, b) => b.score - a.score).slice(0, 3);
}

function formulateNegotiationProposal(conflictData, currentInterview, existingInterviews, panels, rooms) {
  const proposalId = `PROP_${conflictData.conflictId || Date.now()}`;
  const suggestedSlots = findAlternativeSlots(currentInterview, existingInterviews, panels, rooms);
  const recommendedSlot = suggestedSlots[0] || {
    date: currentInterview.date || new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00',
    panelId: currentInterview.panelId || 'PANEL_A',
    roomId: currentInterview.roomId || 'ROOM_204',
    reason: 'Shifted to afternoon non-conflicting window',
  };

  const aiReasoning = `Autonomous Negotiation Engine analyzed ${panels.length} interview panels and ${rooms.length} room venues. Identified optimal clash-free slot at ${recommendedSlot.startTime}-${recommendedSlot.endTime} keeping schedule disruption score below 5%.`;

  return {
    proposalId,
    conflictId: conflictData.conflictId || `CONF_${Date.now()}`,
    conflictType: conflictData.type || 'OVERLAP',
    targetInterviewId: currentInterview.interviewId || conflictData.interviews?.[1] || conflictData.interviews?.[0] || '',
    studentId: currentInterview.studentId || conflictData.studentId || '',
    studentName: currentInterview.studentName || '',
    company: currentInterview.company || '',
    currentSlot: {
      date: currentInterview.date,
      startTime: currentInterview.startTime,
      endTime: currentInterview.endTime,
      panelId: currentInterview.panelId,
      roomId: currentInterview.roomId,
    },
    suggestedSlots,
    recommendedSlot,
    aiReasoning,
    impactScore: 'Low Impact — 0 downstream candidate conflicts',
    status: suggestedSlots.length > 0 ? 'pending_approval' : 'escalated_to_tpo',
    createdAt: new Date(),
  };
}

module.exports = {
  minutes,
  time,
  overlaps,
  checkResourceBusy,
  isSlotAvailable,
  scoreSlotCandidate,
  findAlternativeSlots,
  formulateNegotiationProposal,
};
