import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileClock,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PanelTop,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import "./styles.css";
import "./theme.css";

const initialNegotiations = [
  {
    id: "NEG-1024",
    student: "Rahul Verma",
    initials: "RV",
    company: "TCS",
    role: "Software Engineer",
    original: "10:00 – 10:30 AM",
    issue: "University examination",
    recommended: "02:00 PM",
    status: "WAITING_FOR_APPROVAL",
    score: 92,
    reason:
      "Keeps the same panel and day while avoiding all resource conflicts.",
    slots: [
      {
        time: "11:30 AM",
        panel: "Technical Panel A",
        room: "Block A · 204",
        score: 88,
        why: "Same panel · Same room · Same day",
      },
      {
        time: "02:00 PM",
        panel: "Technical Panel A",
        room: "Block A · 201",
        score: 92,
        why: "Same panel · Same day · No conflicts",
      },
      {
        time: "03:30 PM",
        panel: "Technical Panel B",
        room: "Block A · 204",
        score: 79,
        why: "Same room · Same day",
      },
    ],
  },
  {
    id: "NEG-1025",
    student: "Anika Rao",
    initials: "AR",
    company: "Deloitte",
    role: "Business Analyst",
    original: "11:00 – 11:30 AM",
    issue: "Another interview",
    recommended: "01:30 PM",
    status: "WAITING_FOR_APPROVAL",
    score: 89,
    reason:
      "Preserves the same day and assigns an available panel without moving Rahul.",
    slots: [
      {
        time: "12:30 PM",
        panel: "Technical Panel B",
        room: "Block A · 201",
        score: 84,
        why: "Same day · No candidate conflict",
      },
      {
        time: "01:30 PM",
        panel: "Technical Panel A",
        room: "Block A · 205",
        score: 89,
        why: "Same day · Same panel · No conflicts",
      },
      {
        time: "03:00 PM",
        panel: "Technical Panel B",
        room: "Block A · 204",
        score: 76,
        why: "Same room · Same day",
      },
    ],
  },
  {
    id: "NEG-1026",
    student: "Meera Iyer",
    initials: "MI",
    company: "Microsoft",
    role: "Product Intern",
    original: "01:00 – 02:00 PM",
    issue: "Class schedule",
    recommended: "03:00 PM",
    status: "WAITING_FOR_APPROVAL",
    score: 86,
    reason: "Keeps the same room and avoids the existing TCS panel allocation.",
    slots: [
      {
        time: "02:30 PM",
        panel: "Technical Panel B",
        room: "Computer Lab",
        score: 81,
        why: "Same day · No panel conflict",
      },
      {
        time: "03:00 PM",
        panel: "Technical Panel A",
        room: "Computer Lab",
        score: 86,
        why: "Same day · Same panel · Same room",
      },
      {
        time: "04:00 PM",
        panel: "Technical Panel B",
        room: "Block A · 205",
        score: 75,
        why: "Same day · No conflicts",
      },
    ],
  },
  {
    id: "NEG-1027",
    student: "Vikram Mehta",
    initials: "VM",
    company: "TCS",
    role: "Software Engineer",
    original: "02:00 – 02:30 PM",
    issue: "Medical appointment",
    recommended: "04:00 PM",
    status: "WAITING_FOR_APPROVAL",
    score: 83,
    reason:
      "Finds the earliest free room and panel after the appointment window.",
    slots: [
      {
        time: "03:00 PM",
        panel: "Technical Panel B",
        room: "Block A · 201",
        score: 78,
        why: "Same day · No candidate conflict",
      },
      {
        time: "04:00 PM",
        panel: "Technical Panel A",
        room: "Block A · 204",
        score: 83,
        why: "Same panel · Same room · No conflicts",
      },
      {
        time: "04:30 PM",
        panel: "Technical Panel B",
        room: "Block A · 205",
        score: 72,
        why: "Same day · No conflicts",
      },
    ],
  },
];
const schedule = {
  student: "Rahul Verma",
  company: "TCS",
  role: "Software Engineer",
  event: "Technical Interview",
  date: "25 Aug 2026",
  time: "10:00 – 10:30 AM",
  room: "Block A · Room 204",
  panel: "Technical Panel A",
  reportingTime: "09:30 AM",
  status: "SCHEDULED",
};

function getReportingTime(startTime) {
  const [clock, meridiem] = startTime.split(" ");
  let [hours, minutes] = clock.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const totalMinutes = Math.max(0, hours * 60 + minutes - 30);
  let reportingHours = Math.floor(totalMinutes / 60);
  const reportingMinutes = String(totalMinutes % 60).padStart(2, "0");
  const reportingMeridiem = reportingHours >= 12 ? "PM" : "AM";
  reportingHours = reportingHours % 12 || 12;
  return `${String(reportingHours).padStart(2, "0")}:${reportingMinutes} ${reportingMeridiem}`;
}

function App() {
  const [role, setRole] = useState("officer");
  const [page, setPage] = useState("Negotiations");
  const [negotiations, setNegotiations] = useState(initialNegotiations);
  const [selected, setSelected] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const student = role === "student";
  const approve = (id, time, selectedRoom) => {
    const negotiation = negotiations.find((n) => n.id === id);
    setNegotiations((items) =>
      items.map((n) =>
        n.id === id ? { ...n, status: "APPROVED", recommended: time } : n,
      ),
    );
    if (negotiation?.student === "Rahul Verma") {
      const endTime =
        time === "02:00 PM"
          ? "02:30 PM"
          : time === "11:30 AM"
            ? "12:00 PM"
            : time === "03:30 PM"
              ? "04:00 PM"
              : time;
      const room = selectedRoom ||
        (time === "02:00 PM" ? "Block A · Room 201" : "Block A · Room 204");
      Object.assign(schedule, {
        time: `${time} – ${endTime}`,
        reportingTime: getReportingTime(time),
        room,
        panel: "Technical Panel A",
        status: "RESCHEDULED",
      });
      localStorage.setItem(
        "placementApproval",
        JSON.stringify({
          title: "Interview rescheduled",
          message: `Placement Officer approved your new TCS slot: ${time} in ${room}. Report by ${getReportingTime(time)}.`,
          time,
        }),
      );
    }
    setSelected(null);
  };
  const reject = (id) => {
    setNegotiations((items) =>
      items.map((n) => (n.id === id ? { ...n, status: "REJECTED" } : n)),
    );
    setSelected(null);
  };
  const submitRequest = ({ reason, description }) => {
    const reasonLabels = {
      Exam: "University examination",
      Class: "Class schedule",
      "Another Interview": "Another interview",
      "Medical/Emergency": "Medical or emergency conflict",
      Other: "Other scheduling conflict",
    };
    setNegotiations((items) =>
      items.map((item) =>
        item.student === "Rahul Verma"
          ? {
              ...item,
              issue: reasonLabels[reason] || reason,
              description,
              status: "WAITING_FOR_APPROVAL",
            }
          : item,
      ),
    );
    setSubmitted(true);
    setRequestOpen(false);
  };
  return (
    <div className="shell">
      <aside className={sidebarOpen ? "sidebar-open" : ""}>
        <div className="brand">
          <div className="mark">O</div>
          <div>
            <strong>orbit</strong>
            <small>placement ops</small>
          </div>
        </div>
        <div className="switcher">
          <span />
          {student ? "Student portal" : "Placement office"}
          <ChevronRight size={14} />
        </div>
        <nav>
          {student ? (
            <NavGroup
              title="MY PLACEMENT"
              items={[
                "Dashboard",
                "My Schedule",
                "Notifications",
                "Placement Profile",
              ]}
              active={page}
              setPage={setPage}
            />
          ) : (
            <>
              <NavGroup
                title="OPERATIONS"
                items={["Dashboard", "Scheduling", "Negotiations", "Conflicts"]}
                active={page}
                setPage={setPage}
              />
              <NavGroup
                title="RESOURCES"
                items={["Companies", "Candidates", "Panels", "Rooms"]}
                active={page}
                setPage={setPage}
              />
            </>
          )}
        </nav>
        <div className="aside-bottom">
          <NavGroup items={["Settings"]} active={page} setPage={setPage} />
          <div className="profile">
            <div className="avatar dark">{student ? "RV" : "PM"}</div>
            <span>
              <b>{student ? "Rahul Verma" : "Priya Menon"}</b>
              <small>{student ? "Student" : "Placement officer"}</small>
            </span>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="mobile" onClick={() => setSidebarOpen(true)}>
            <Menu size={19} />
          </button>
          <span className="crumb">
            Placement office <ChevronRight size={13} /> <b>{page}</b>
          </span>
          <div className="header-actions">
            <div className="role">
              <button
                className={!student ? "on" : ""}
                onClick={() => {
                  setRole("officer");
                  setPage("Negotiations");
                }}
              >
                Officer
              </button>
              <button
                className={student ? "on" : ""}
                onClick={() => {
                  setRole("student");
                  setPage("My Schedule");
                }}
              >
                Student view
              </button>
            </div>
            <button className="icon">
              <Search size={17} />
            </button>
            <button className="icon">
              <Bell size={17} />
              <i />
            </button>
          </div>
        </header>
        {student ? (
          <Student setRequestOpen={setRequestOpen} submitted={submitted} />
        ) : (
          <Officer
            negotiations={negotiations}
            setSelected={setSelected}
            setRequestOpen={setRequestOpen}
          />
        )}
      </main>
      {selected && (
        <NegotiationModal
          negotiation={selected}
          close={() => setSelected(null)}
          approve={approve}
          reject={reject}
        />
      )}{" "}
      {requestOpen && (
        <RequestModal
          close={() => setRequestOpen(false)}
          submit={submitRequest}
        />
      )}
    </div>
  );
}
function NavGroup({ title, items, active, setPage }) {
  return (
    <div className="nav-group">
      {title && <small>{title}</small>}
      {items.map((item) => (
        <button
          key={item}
          className={active === item ? "active" : ""}
          onClick={() => setPage(item)}
        >
          {item === "Negotiations" ? (
            <MessageSquareText size={16} />
          ) : item === "Scheduling" ? (
            <CalendarDays size={16} />
          ) : item === "Conflicts" ? (
            <CircleAlert size={16} />
          ) : item === "Dashboard" ? (
            <LayoutDashboard size={16} />
          ) : item === "Panels" ? (
            <Users size={16} />
          ) : item === "Rooms" ? (
            <PanelTop size={16} />
          ) : (
            <Activity size={16} />
          )}
          <span>{item}</span>
          {item === "Negotiations" && <em>1</em>}
        </button>
      ))}
    </div>
  );
}
function Heading({ eyebrow, title, children }) {
  return (
    <div className="heading">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
function Officer({ negotiations, setSelected, setRequestOpen }) {
  const pending = negotiations.filter(
    (n) => n.status !== "APPROVED" && n.status !== "REJECTED",
  );
  return (
    <>
      <Heading
        eyebrow="AGENT WORKSPACE · 21 AUGUST 2026"
        title="Negotiation desk"
      >
        <button className="button secondary">
          <CalendarDays size={16} /> Schedule
        </button>
        <button className="button primary" onClick={() => setRequestOpen(true)}>
          <Sparkles size={16} /> Simulate request
        </button>
      </Heading>
      <div className="metrics">
        <Metric
          icon={MessageSquareText}
          label="Pending negotiations"
          value={pending.length}
          detail="Needs approval"
          tone="orange"
        />
        <Metric
          icon={Clock3}
          label="Avg. resolution"
          value="4m"
          detail="This month"
          tone="blue"
        />
        <Metric
          icon={Check}
          label="Approved today"
          value="18"
          detail="+12% vs. last week"
          tone="green"
        />
        <Metric
          icon={CircleAlert}
          label="Active conflicts"
          value="02"
          detail="1 panel · 1 room"
          tone="red"
        />
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">
            <Sparkles size={14} /> AGENT STATUS · ONLINE
          </span>
          <h2>
            Scheduling negotiations,
            <br />
            <i>with a human in the loop.</i>
          </h2>
          <p>
            The agent understands requests, checks every resource, and ranks the
            cleanest alternatives. Nothing changes until you approve it.
          </p>
          <div className="agent-flow">
            <span>
              <b>01</b> Perceive
            </span>
            <ArrowRight />
            <span>
              <b>02</b> Reason
            </span>
            <ArrowRight />
            <span>
              <b>03</b> Recommend
            </span>
            <ArrowRight />
            <span className="final">
              <b>04</b> Approve
            </span>
          </div>
        </div>
        <div className="agent-orbit">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-core">
            <Sparkles size={25} />
          </div>
          <span className="orbit-tag tag-one">Availability</span>
          <span className="orbit-tag tag-two">Candidate</span>
          <span className="orbit-tag tag-three">Approval</span>
        </div>
      </section>
      <section className="table-panel">
        <div className="panel-head">
          <div>
            <span className="kicker">INBOX · {pending.length} OPEN</span>
            <h2>Pending negotiations</h2>
          </div>
          <div className="filters">
            <button className="filter active">All requests</button>
            <button className="filter">This week</button>
            <button className="icon">
              <Search size={16} />
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>CANDIDATE</th>
              <th>COMPANY</th>
              <th>CURRENT SLOT</th>
              <th>ISSUE</th>
              <th>AI RECOMMENDATION</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {negotiations.map((n) => (
              <tr key={n.id} onClick={() => setSelected(n)}>
                <td>
                  <div className="person">
                    <div className="avatar orange">{n.initials}</div>
                    <span>
                      <b>{n.student}</b>
                      <small>{n.id}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <b>{n.company}</b>
                  <small>{n.role}</small>
                </td>
                <td>
                  <b>{n.original}</b>
                  <small>25 Aug 2026 · Room 204</small>
                </td>
                <td>
                  <span className="issue">
                    <FileClock size={14} />
                    {n.issue}
                  </span>
                </td>
                <td>
                  <div className="rec">
                    <Sparkles size={13} />
                    <span>
                      <b>{n.recommended}</b>
                      <small>
                        {n.score}/100 · {n.reason}
                      </small>
                    </span>
                  </div>
                </td>
                <td>
                  <span className={"status " + n.status.toLowerCase()}>
                    {n.status === "APPROVED"
                      ? "Approved"
                      : n.status === "REJECTED"
                        ? "Rejected"
                        : "Pending approval"}
                  </span>
                </td>
                <td>
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
function Metric({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="metric">
      <div className={"metric-icon " + tone}>
        <Icon size={17} />
      </div>
      <span>{label}</span>
      <b>{value}</b>
      <small>{detail}</small>
    </div>
  );
}
function Student({ setRequestOpen, submitted }) {
  return (
    <>
      <Heading eyebrow="STUDENT PORTAL · RAHUL VERMA" title="My schedule">
        <button className="button secondary">
          <CalendarDays size={16} /> Add to calendar
        </button>
      </Heading>
      <div className="student-card">
        <div>
          <span className="kicker">
            <span className="dot" /> NEXT INTERVIEW
          </span>
          <h2>
            {schedule.company} · {schedule.event}
          </h2>
          <p>
            {schedule.date} · {schedule.time} · Report by {schedule.reportingTime}
          </p>
        </div>
        <span className="status scheduled">
          {submitted ? "RESCHEDULE REQUESTED" : schedule.status}
        </span>
      </div>
      <div className="student-grid">
        <section>
          <div className="section-heading">
            <h2>Interview details</h2>
            <span>Scheduled</span>
          </div>
          <div className="details">
            <Detail label="Company" value={schedule.company} />
            <Detail label="Job role" value={schedule.role} />
            <Detail
              label="Date & time"
              value={`${schedule.date} · ${schedule.time}`}
            />
            <Detail label="Venue" value={schedule.room} />
            <Detail label="Panel" value={schedule.panel} />
          </div>
          <div className="request-callout">
            <div>
              <span className="kicker">
                <MessageSquareText size={14} /> NEED A CHANGE?
              </span>
              <h3>Can't make your scheduled time?</h3>
              <p>
                Tell the agent what's going on. It will find options, but your
                placement officer always makes the final call.
              </p>
            </div>
            <button className="button primary" onClick={setRequestOpen}>
              Request reschedule
            </button>
          </div>
        </section>
        <section className="notice-panel">
          <div className="section-heading">
            <h2>Notifications</h2>
            <span>2 new</span>
          </div>
          <Notice
            title="Interview scheduled"
            text="TCS Technical Interview: 10:00 AM, Block A - Room 204."
          />
          <Notice
            title="Reminder"
            text="Please report 30 minutes before your interview with your college ID and resume."
          />
        </section>
      </div>
    </>
  );
}
function Detail({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
function Notice({ title, text }) {
  const approval =
    title === "Interview scheduled" &&
    JSON.parse(localStorage.getItem("placementApproval") || "null");
  return (
    <>
      {approval && (
        <div className="notice approval-notice">
          <div className="notice-icon">
            <Check size={14} />
          </div>
          <span>
            <b>{approval.title}</b>
            <small>{approval.message}</small>
            <em>Just now · unread</em>
          </span>
        </div>
      )}
      <div className="notice">
        <div className="notice-icon">
          <Bell size={14} />
        </div>
        <span>
          <b>{title}</b>
          <small>{text}</small>
          <em>Today · unread</em>
        </span>
      </div>
    </>
  );
}
function NegotiationModal({ negotiation, close, approve, reject }) {
  const initialSlot =
    negotiation.slots.find((slot) => slot.time === negotiation.recommended) ||
    negotiation.slots[0];
  const [chosen, setChosen] = useState(initialSlot);
  const [selectedRoom, setSelectedRoom] = useState(initialSlot.room);
  const venueOptions = [
    ...new Set([
      ...negotiation.slots.map((slot) => slot.room),
      "Block B · Room 102",
      "Auditorium · Interview Bay",
      "Placement Cell · Meeting Room",
      "Computer Lab · Lab 2",
      "Innovation Hub · Room 301",
    ]),
  ];
  return (
    <div className="overlay">
      <div className="modal negotiation-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <div className="modal-top">
          <span className="kicker">
            <Sparkles size={14} /> NEGOTIATION {negotiation.id}
          </span>
          <span className="status pending">WAITING FOR APPROVAL</span>
        </div>
        <h2>{negotiation.student} needs a new slot</h2>
        <p className="sub">
          {negotiation.company} · {negotiation.role}
        </p>
        <div className="conflict">
          <CircleAlert size={18} />
          <span>
            <b>Conflict understood</b>
            <small>
              “{negotiation.description || "I have a scheduling conflict."}” · Reason: {negotiation.issue}
            </small>
          </span>
        </div>
        <div className="compare">
          <div>
            <small>ORIGINAL SLOT</small>
            <b>{negotiation.original}</b>
            <span>Panel A · Room 204</span>
          </div>
          <ArrowRight />
          <div className="new">
            <small>AI RECOMMENDATION</small>
            <b>{chosen.time}</b>
            <span>{chosen.panel} · {selectedRoom}</span>
          </div>
        </div>
        <div className="modal-section">
          <div className="section-heading">
            <h3>Ranked alternatives</h3>
            <span>Deterministic availability check</span>
          </div>
          <label className="block-select">
            Change block / room
            <select
              value={selectedRoom}
              onChange={(event) => setSelectedRoom(event.target.value)}
            >
              {venueOptions.map((room) => <option key={room}>{room}</option>)}
            </select>
          </label>
          {negotiation.slots.map((slot) => (
            <button
              key={slot.time}
              className={
                "option " + (chosen.time === slot.time ? "selected" : "")
              }
              onClick={() => {
                setChosen(slot);
                setSelectedRoom(slot.room);
              }}
            >
              <span className="radio" />
              <span>
                <b>{slot.time}</b>
                <small>
                  {slot.panel} · {slot.room}
                </small>
              </span>
              <strong>
                {slot.score}
                <small>/100</small>
              </strong>
              <em>{slot.why}</em>
            </button>
          ))}
        </div>
        <div className="explanation">
          <Sparkles size={16} />
          <span>
            <b>Agent reasoning</b>
            <small>
              {negotiation.reason} It checked candidate, panel, room, and
              existing schedules.
            </small>
          </span>
        </div>
        <div className="modal-actions">
          <button
            className="button reject-button"
            onClick={() => reject(negotiation.id)}
          >
            Reject
          </button>
          <button
            className="button primary"
            onClick={() => approve(negotiation.id, chosen.time, selectedRoom)}
          >
            <Check size={16} /> Approve {chosen.time}
          </button>
        </div>
      </div>
    </div>
  );
}
function RequestModal({ close, submit }) {
  const [reason, setReason] = useState("Exam");
  const [description, setDescription] = useState("I have an examination at 10 AM.");
  return (
    <div className="overlay">
      <div className="modal request-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <span className="kicker">
          <MessageSquareText size={14} /> RESCHEDULE REQUEST
        </span>
        <h2>Tell us what changed</h2>
        <p className="sub">
          The agent will understand your request and search for alternatives.
          Your current slot stays safe until approval.
        </p>
        <label>
          Reason
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Exam</option>
            <option>Class</option>
            <option>Another Interview</option>
            <option>Medical/Emergency</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Describe the conflict
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" />
        </label>
        <div className="request-status">
          <Activity size={17} />
          <span>
            <b>Agent workflow</b>
            <small>
              Understand request → Check availability → Rank alternatives →
              Officer approval
            </small>
          </span>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button primary" onClick={() => submit({ reason, description })}>
            <Sparkles size={16} /> Request alternatives
          </button>
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
