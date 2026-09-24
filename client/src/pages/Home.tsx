import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { schedule, type ScheduleDay, type Session } from "@/data/schedule";

type CalendarCell = { date: Date; key: string; inMonth: boolean };

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const FIRST_DATE = schedule[0].date;
const LAST_DATE = schedule[schedule.length - 1].date;
const HOLIDAYS: Record<string, string> = {
  "2026-09-25": "中秋連假",
  "2026-09-26": "中秋連假",
  "2026-09-27": "中秋連假",
  "2026-09-28": "教師節連假",
  "2026-10-09": "國慶連假",
  "2026-10-10": "國慶日",
  "2026-10-11": "國慶連假",
  "2026-10-24": "光復連假",
  "2026-10-25": "光復節連假",
  "2026-10-26": "光復補假",
  "2026-12-25": "行憲紀念日",
};

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function keyForDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DEFAULT_DATE = schedule.find((day) => day.date >= keyForDate(new Date()))?.date ?? FIRST_DATE;

function displayDate(value: string) {
  const date = parseDate(value);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function expandSession(session: Session) {
  const courses = session.course === "電腦軟體、硬體架構" ? [session.course] : session.course.split("、").map((item) => item.trim()).filter(Boolean);
  const hours = session.hours.split("、").map((item) => item.trim()).filter(Boolean);
  return courses.map((course, index) => ({
    course,
    hours: hours[index] ?? hours[0] ?? "",
    teacher: session.teacher,
  }));
}

function sessionFor(day: ScheduleDay, period: "am" | "pm") {
  return expandSession(day[period]);
}

function CompletedSummary({ days }: { days: ScheduleDay[] }) {
  const sessions = days.flatMap((day) => [...sessionFor(day, "am"), ...sessionFor(day, "pm")]);
  const totalHours = sessions.reduce((total, session) => total + (Number(session.hours) || 0), 0);
  const courses = new Set(sessions.map((session) => session.course));
  const teachers = new Set(sessions.map((session) => session.teacher).filter(Boolean));

  const items = [
    { label: "已完成上課日", value: `${days.length}`, suffix: "日", icon: CalendarDays },
    { label: "完成課程數", value: `${sessions.length}`, suffix: "堂", icon: BookOpen },
    { label: "累計課表時數", value: `${totalHours}`, suffix: "小時", icon: Clock3 },
    { label: "涉及講師", value: `${teachers.size}`, suffix: "位", icon: UserRound },
  ];

  return (
    <section className="completed-summary" aria-label="已完成課程統計">
      <div className="completed-summary-heading">
        <div><span className="section-overline">學習進度</span><h3>已完成課程統計</h3></div>
        <span className="completed-course-count">共 {courses.size} 門不同課程</span>
      </div>
      <div className="completed-stat-grid">
        {items.map(({ label, value, suffix, icon: Icon }) => (
          <div className="completed-stat" key={label}>
            <Icon size={16} />
            <div><strong>{value}</strong><span>{suffix}</span></div>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <p className="completed-summary-note">統計範圍截至今天，時數依 PDF 課表中的節數彙整。</p>
    </section>
  );
}

function buildCalendar(month: Date): CalendarCell[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, key: keyForDate(date), inMonth: date.getMonth() === month.getMonth() };
  });
}

function DaySchedule({ day, isPast }: { day: ScheduleDay; isPast: boolean }) {
  const sessions = [
    { key: "am", label: "上午", time: "08:50 — 11:50", data: sessionFor(day, "am") },
    { key: "pm", label: "下午", time: "12:50 — 15:50", data: sessionFor(day, "pm") },
  ];

  return (
    <div className="space-y-3">
      {sessions.map((period) => (
        <div key={period.key} className={`period-card period-${period.key}`}>
          <div className="period-meta">
            <span className="period-label">{period.label}</span>
            <span className="period-time"><Clock3 size={13} /> {period.time}</span>
          </div>
          <div className="space-y-3">
            {period.data.map((session, index) => (
              <div key={`${session.course}-${index}`} className={`session-row ${isPast ? "completed-session" : ""}`}>
                <div>
                  <Link href={`/course/${encodeURIComponent(session.course)}`} className="course-title-link">{session.course}</Link>
                  <div className="session-teacher"><UserRound size={14} /> {session.teacher || "未標示講師"}</div>
                </div>
                <div className="session-status">
                  {isPast && <span className="completed-badge">已完成</span>}
                  <span className="hours-pill">{session.hours} 節</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [viewMonth, setViewMonth] = useState(parseDate(DEFAULT_DATE));

  const byDate = useMemo(() => new Map(schedule.map((day) => [day.date, day])), []);
  const selectedDay = byDate.get(selectedDate);
  const calendar = useMemo(() => buildCalendar(viewMonth), [viewMonth]);
  const activeIndex = schedule.findIndex((day) => day.date === selectedDate);
  const todayKey = keyForDate(new Date());
  const todaySchedule = byDate.get(todayKey);
  const selectedIsPast = selectedDate < todayKey;
  const completedDays = useMemo(() => schedule.filter((day) => day.date < todayKey), [todayKey]);

  const chooseDate = (date: string) => {
    setSelectedDate(date);
    const nextMonth = parseDate(date);
    setViewMonth(nextMonth);
  };

  const moveDate = (direction: -1 | 1) => {
    const nextIndex = activeIndex + direction;
    if (nextIndex >= 0 && nextIndex < schedule.length) chooseDate(schedule[nextIndex].date);
  };

  const chooseToday = () => {
    const target = todaySchedule?.date ?? schedule.find((day) => day.date >= todayKey)?.date ?? FIRST_DATE;
    chooseDate(target);
  };

  const changeMonth = (direction: -1 | 1) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  return (
    <main className="site-shell home-shell">
      <div className="paper-glow" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><BookOpen size={19} strokeWidth={2.2} /></div>
          <div>
            <p className="brand-kicker">學員版 · 第 01 期</p>
            <p className="brand-name">電腦應用與 AI 工具班</p>
          </div>
        </div>
        <nav className="topbar-nav" aria-label="主要導覽">
          <Link href="/courses" className="topbar-link"><BookOpen size={15} /> 課程專頁</Link>
          <Link href="/lecturers" className="topbar-link"><UserRound size={15} /> 講師專頁</Link>
          <span className="topbar-note"><Sparkles size={15} /> 課表</span>
        </nav>
      </header>

      <section className="home-direct-links" aria-label="專頁入口">
        <Link href="/courses" className="home-direct-card course-entry">
          <div className="direct-card-icon"><BookOpen size={26} /></div>
          <div className="direct-card-copy"><span className="section-overline">依課程瀏覽</span><h2>課程專頁</h2><p>查看每門課的上課日期、時間、講師、助教與統計資訊。</p></div>
          <ArrowRight className="direct-card-arrow" size={25} />
        </Link>
        <Link href="/lecturers" className="home-direct-card lecturer-entry">
          <div className="direct-card-icon"><UserRound size={26} /></div>
          <div className="direct-card-copy"><span className="section-overline">依講師瀏覽</span><h2>講師專頁</h2><p>查看每位講師的授課日期、課程與時間清單。</p></div>
          <ArrowRight className="direct-card-arrow" size={25} />
        </Link>
      </section>

      <section className="workspace">
        <div className="calendar-panel panel-card">
          <div className="panel-topline">
            <div><span className="section-overline">選擇日期</span><h2>月曆</h2></div>
            <div className="month-controls">
              <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="上個月"><ChevronLeft size={18} /></button>
              <span>{viewMonth.getFullYear()} 年 {viewMonth.getMonth() + 1} 月</span>
              <button className="icon-button" onClick={() => changeMonth(1)} aria-label="下個月"><ChevronRight size={18} /></button>
              <button className="today-button" onClick={chooseToday}>回到今天</button>
            </div>
          </div>
          <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {calendar.map((cell) => {
              const day = byDate.get(cell.key);
              const selected = selectedDate === cell.key;
              const isToday = todayKey === cell.key;
              const holiday = HOLIDAYS[cell.key];
              return (
                  <button key={cell.key} title={holiday} className={`calendar-day ${!cell.inMonth ? "muted" : ""} ${day ? "has-class highlighted" : ""} ${day && cell.key < todayKey ? "past" : ""} ${holiday ? "holiday" : ""} ${isToday ? "today" : ""} ${selected ? "selected" : ""}`} disabled={!day} onClick={() => day && chooseDate(cell.key)}>
                  <span className="day-number">{cell.date.getDate()}</span>
                  {day && <span className="day-dots"><i /><i /></span>}
                  {day && <span className="day-caption">課</span>}
                  {holiday && <span className="holiday-label">{holiday}</span>}
                  {isToday && <span className="today-label">今天</span>}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend"><span><i className="legend-dot accent" /> 有課程</span><span><i className="legend-dot holiday-dot" /> 假日／連假</span><span><i className="legend-dot selected-dot" /> 目前日期</span><span className="legend-note">點擊日期查看課程</span></div>
        </div>

        <aside className="day-panel panel-card">
          <div className="day-panel-header">
            <div><span className="section-overline">{selectedIsPast ? "已完成課程" : "當日課程"}</span><h2>{selectedDay ? displayDate(selectedDay.date) : "選擇上課日"}</h2>{selectedDay && <p className="weekday-line">星期{selectedDay.weekday} · {selectedIsPast ? "已完成，可回顧課程" : "今日課程"}</p>}</div>
            {selectedDay && <div className="date-index">{String(activeIndex + 1).padStart(2, "0")}<small>/ {schedule.length}</small></div>}
          </div>
          {selectedDay ? <>
            {selectedIsPast && <CompletedSummary days={completedDays} />}
            <DaySchedule day={selectedDay} isPast={selectedIsPast} />
          </> : <div className="empty-day"><CalendarDays size={28} /><p>點選月曆中的上課日</p></div>}
          <div className="day-navigation">
            <button onClick={() => moveDate(-1)} disabled={activeIndex <= 0}><ArrowLeft size={16} /> 上一天</button>
            <button onClick={() => moveDate(1)} disabled={activeIndex === schedule.length - 1}>下一天 <ArrowRight size={16} /></button>
          </div>
        </aside>
      </section>

      <footer className="footer-note"><span>115 · 學習路線</span><span>資料依 PDF 課表整理 · 僅顯示講師資訊</span><span>點日期，開始今天的課</span></footer>
    </main>
  );
}
