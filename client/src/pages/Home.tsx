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

function DaySchedule({ day }: { day: ScheduleDay }) {
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
              <div key={`${session.course}-${index}`} className="session-row">
                <div>
                  <Link href={`/course/${encodeURIComponent(session.course)}`} className="course-title-link">{session.course}</Link>
                  <div className="session-teacher"><UserRound size={14} /> {session.teacher || "未標示講師"}</div>
                </div>
                <span className="hours-pill">{session.hours} 節</span>
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
          <span className="topbar-note"><Sparkles size={15} /> 課表瀏覽器</span>
        </nav>
      </header>

      <section className="intro-wrap">
        <div className="intro-copy">
          <p className="eyebrow"><span /> 115 年 09 月 14 日 — 12 月 10 日</p>
          <h1>今天，<em>上什麼課？</em></h1>
          <p className="intro-text">不用查詢，直接點選日期或課程。<br />把這份課表當成每天的學習路線圖。</p>
        </div>
        <div className="intro-stamp">
          <span>已依 PDF 核對</span>
          <strong>學員版</strong>
          <small>講師資訊已整理</small>
        </div>
      </section>

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
              return (
                <button key={cell.key} className={`calendar-day ${!cell.inMonth ? "muted" : ""} ${day ? "has-class highlighted" : ""} ${isToday ? "today" : ""} ${selected ? "selected" : ""}`} disabled={!day} onClick={() => day && chooseDate(cell.key)}>
                  <span className="day-number">{cell.date.getDate()}</span>
                  {day && <span className="day-dots"><i /><i /></span>}
                  {day && <span className="day-caption">課</span>}
                  {isToday && <span className="today-label">今天</span>}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend"><span><i className="legend-dot accent" /> 有課程</span><span><i className="legend-dot selected-dot" /> 目前日期</span><span className="legend-note">點擊日期查看課程</span></div>
        </div>

        <aside className="day-panel panel-card">
          <div className="day-panel-header">
            <div><span className="section-overline">當日課程</span><h2>{selectedDay ? displayDate(selectedDay.date) : "選擇上課日"}</h2>{selectedDay && <p className="weekday-line">星期{selectedDay.weekday} · 今日課程</p>}</div>
            {selectedDay && <div className="date-index">{String(activeIndex + 1).padStart(2, "0")}<small>/ {schedule.length}</small></div>}
          </div>
          {selectedDay ? <DaySchedule day={selectedDay} /> : <div className="empty-day"><CalendarDays size={28} /><p>點選月曆中的上課日</p></div>}
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
