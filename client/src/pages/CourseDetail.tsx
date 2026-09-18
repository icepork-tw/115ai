import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, BookOpen, CalendarDays, Clock3, GraduationCap, UsersRound } from "lucide-react";
import { courseNames, schedule, type ScheduleDay, type Session } from "@/data/schedule";

function expandSession(session: Session) {
  const courses = session.course.split("、").map((item) => item.trim()).filter(Boolean);
  const hours = session.hours.split("、").map((item) => item.trim()).filter(Boolean);
  return courses.map((course, index) => ({ course, hours: hours[index] ?? hours[0] ?? "", teacher: session.teacher, assistant: session.assistant }));
}

function sessionsForDay(day: ScheduleDay, period: "am" | "pm", target: string) {
  const time = period === "am" ? "08:50 — 11:50" : "12:50 — 15:50";
  return expandSession(day[period]).filter((item) => item.course === target).map((item) => {
    let adjustedTime = time;
    if (day.date === "2026-11-12" && period === "pm") adjustedTime = item.course === "性別平等課程" ? "12:50 — 13:50" : "13:50 — 15:50";
    if (day.date === "2026-12-10" && period === "am") adjustedTime = "08:50 — 12:50";
    if (day.date === "2026-12-10" && period === "pm") adjustedTime = "12:50 — 14:50";
    return { ...item, period: period === "am" ? "上午" : "下午", time: adjustedTime };
  });
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}/${month}/${day}`;
}

export default function CourseDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/course/:course");
  const course = params?.course ? decodeURIComponent(params.course) : courseNames[0];
  const rows = schedule.flatMap((day) => [
    ...sessionsForDay(day, "am", course).map((session) => ({ ...session, date: day.date, weekday: day.weekday })),
    ...sessionsForDay(day, "pm", course).map((session) => ({ ...session, date: day.date, weekday: day.weekday })),
  ]);
  const totalHours = rows.reduce((sum, row) => sum + Number.parseInt(row.hours || "0", 10), 0);
  const teachers = Array.from(new Set(rows.map((row) => row.teacher).filter(Boolean)));
  const assistants = Array.from(new Set(rows.map((row) => row.assistant).filter(Boolean)));

  return (
    <main className="site-shell detail-shell">
      <div className="paper-glow" aria-hidden="true" />
      <header className="topbar">
        <Link href="/" className="brand-lockup detail-brand">
          <div className="brand-mark"><BookOpen size={19} strokeWidth={2.2} /></div>
          <div><p className="brand-kicker">LEARNER EDITION · 01</p><p className="brand-name">電腦應用與 AI 工具班</p></div>
        </Link>
        <span className="topbar-note">COURSE DETAIL · 課程專頁</span>
      </header>

      <section className="detail-hero">
        <button className="back-link" onClick={() => setLocation("/")}><ArrowLeft size={16} /> 回到月曆</button>
        <p className="eyebrow"><span /> COURSE PROFILE</p>
        <h1>{course}</h1>
        <p className="detail-lede">這門課的完整上課清單。按日期排列，講師與助教資訊一目了然。</p>
      </section>

      <section className="detail-stats">
        <div className="stat-card"><CalendarDays size={18} /><span>上課次數</span><strong>{rows.length}<small> 次</small></strong></div>
        <div className="stat-card"><Clock3 size={18} /><span>累計節數</span><strong>{totalHours}<small> 節</small></strong></div>
        <div className="stat-card"><GraduationCap size={18} /><span>授課講師</span><strong>{teachers.length}<small> 位</small></strong></div>
        <div className="stat-card"><UsersRound size={18} /><span>協助人員</span><strong>{assistants.length}<small> 位</small></strong></div>
      </section>

      <section className="detail-layout">
        <div className="course-list panel-card">
          <div className="list-heading"><div><span className="section-overline">CLASS SCHEDULE</span><h2>上課日期與時間</h2></div><span className="course-count">共 {rows.length} 筆</span></div>
          <div className="schedule-list">
            {rows.map((row, index) => (
              <div className="course-row" key={`${row.date}-${row.period}-${index}`}>
                <div className="row-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="row-date"><strong>{formatDate(row.date)}</strong><span>星期{row.weekday} · {row.period}</span></div>
                <div className="row-time"><Clock3 size={14} /> {row.time}<small>{row.hours} 節</small></div>
                <div className="row-staff"><span><GraduationCap size={14} /> {row.teacher || "未標示講師"}</span><span><UsersRound size={14} /> {row.assistant || "未標示助教"}</span></div>
              </div>
            ))}
          </div>
        </div>
        <aside className="people-card panel-card">
          <span className="section-overline">PEOPLE</span>
          <h2>授課團隊</h2>
          <div className="people-block"><span className="people-label">講師</span>{teachers.map((person) => <div className="person-name" key={person}><GraduationCap size={16} />{person}</div>)}</div>
          <div className="people-block"><span className="people-label">助教</span>{assistants.map((person) => <div className="person-name" key={person}><UsersRound size={16} />{person}</div>)}</div>
          <div className="detail-note">資料以 PDF 課表為準<br />時間與節數已依分段課程整理</div>
        </aside>
      </section>

      <section className="other-courses"><span className="section-overline">EXPLORE MORE</span><h2>其他課程</h2><div className="course-chips">{courseNames.filter((name) => name !== course).map((name, index) => <Link key={name} href={`/course/${encodeURIComponent(name)}`} className="course-chip"><span className="chip-number">{String(index + 1).padStart(2, "0")}</span>{name}</Link>)}</div></section>
      <footer className="footer-note"><span>115 · LEARNING ROUTE</span><span>資料依 PDF 課表整理 · 僅顯示講師與助教資訊</span><span>一門課，一條學習路線</span></footer>
    </main>
  );
}
