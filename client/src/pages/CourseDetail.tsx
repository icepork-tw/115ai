import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronDown, ChevronRight, ChevronUp, Clock3, GraduationCap, UsersRound } from "lucide-react";
import { courseNames, schedule, type ScheduleDay, type Session } from "@/data/schedule";
import SiteNav from "@/components/SiteNav";

function expandSession(session: Session) {
  const courses = session.course === "電腦軟體、硬體架構" ? [session.course] : session.course.split("、").map((item) => item.trim()).filter(Boolean);
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

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function CourseDetail() {
  const [, params] = useRoute("/course/:course");
  const course = params?.course ? decodeURIComponent(params.course) : courseNames[0];
  const rows = schedule.flatMap((day) => [
    ...sessionsForDay(day, "am", course).map((session) => ({ ...session, date: day.date, weekday: day.weekday })),
    ...sessionsForDay(day, "pm", course).map((session) => ({ ...session, date: day.date, weekday: day.weekday })),
  ]);
  const todayKey = getTodayKey();
  const completedRows = rows.filter((row) => row.date < todayKey);
  const upcomingRows = rows.filter((row) => row.date >= todayKey);
  const shouldCollapseCompleted = rows.length >= 4 && completedRows.length > 0 && upcomingRows.length > 0;
  const [showCompleted, setShowCompleted] = useState(!shouldCollapseCompleted);
  const displayedRows = shouldCollapseCompleted && !showCompleted ? upcomingRows : rows;
  const totalHours = rows.reduce((sum, row) => sum + Number.parseInt(row.hours || "0", 10), 0);
  const teachers = Array.from(new Set(rows.map((row) => row.teacher).filter(Boolean)));
  const assistants = Array.from(new Set(rows.map((row) => row.assistant).filter(Boolean)));
  const currentIndex = Math.max(0, courseNames.indexOf(course));
  const previousCourse = courseNames[currentIndex - 1];
  const nextCourse = courseNames[currentIndex + 1];
  const courseSummary = (name: string) => {
    const sessions = schedule.flatMap((day) => [
      ...expandSession(day.am).filter((item) => item.course === name),
      ...expandSession(day.pm).filter((item) => item.course === name),
    ]);
    return { sessions: sessions.length, hours: sessions.reduce((sum, item) => sum + Number.parseInt(item.hours || "0", 10), 0) };
  };

  return (
    <main className="site-shell detail-shell">
      <div className="paper-glow" aria-hidden="true" />
      <SiteNav current="course-detail" />

      <section className="detail-hero">
        <p className="eyebrow"><span /> 課程資料</p>
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
          <div className="list-heading"><div><span className="section-overline">上課安排</span><h2>上課日期與時間</h2></div><span className="course-count">共 {rows.length} 筆</span></div>
          {shouldCollapseCompleted && <button className="completed-toggle" type="button" onClick={() => setShowCompleted((visible) => !visible)} aria-expanded={showCompleted}><span>{showCompleted ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>{showCompleted ? "收起已完成課程" : `顯示已完成課程（${completedRows.length} 堂）`}</button>}
          <div className="schedule-list">
            {displayedRows.map((row) => {
              const index = rows.indexOf(row);
              return <div className={`course-row ${row.date < todayKey ? "completed-row" : ""}`} key={`${row.date}-${row.period}-${index}`}>
                <div className="row-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="row-date"><strong>{formatDate(row.date)}</strong><span>星期{row.weekday} · {row.period}</span></div>
                <div className="row-time"><Clock3 size={14} /> {row.time}<small>{row.hours} 節</small></div>
                <div className="row-staff"><span><GraduationCap size={14} /> {row.teacher || "未標示講師"}</span><span><UsersRound size={14} /> {row.assistant || "未標示助教"}</span></div>
              </div>;
            })}
          </div>
        </div>
        <aside className="people-card panel-card">
          <span className="section-overline">授課團隊</span>
          <h2>授課團隊</h2>
          <div className="people-block"><span className="people-label">講師</span>{teachers.map((person) => <div className="person-name" key={person}><GraduationCap size={16} />{person}</div>)}</div>
          <div className="people-block"><span className="people-label">助教</span>{assistants.map((person) => <div className="person-name" key={person}><UsersRound size={16} />{person}</div>)}</div>
          <div className="detail-note">資料以 PDF 課表為準<br />時間與節數已依分段課程整理</div>
        </aside>
      </section>

      <section className="course-navigation">
        <div className="course-nav-arrows">
          {previousCourse ? <Link href={`/course/${encodeURIComponent(previousCourse)}`} className="course-nav-button previous"><ArrowLeft size={17} /><span><small>上一門課程</small><strong>{previousCourse}</strong></span></Link> : <span />}
          <Link href="/courses" className="course-index-button"><BookOpen size={16} /><span>課程索引</span><small>{currentIndex + 1} / {courseNames.length}</small></Link>
          {nextCourse ? <Link href={`/course/${encodeURIComponent(nextCourse)}`} className="course-nav-button next"><span><small>下一門課程</small><strong>{nextCourse}</strong></span><ArrowRight size={17} /></Link> : <span />}
        </div>
        <div className="course-directory-heading"><div><span className="section-overline">瀏覽其他課程</span><h2>課程導覽</h2></div><p>選擇其他課程，直接查看完整上課資訊。</p></div>
        <div className="course-directory-grid">{courseNames.map((name, index) => { const summary = courseSummary(name); const isCurrent = name === course; return <Link key={name} href={`/course/${encodeURIComponent(name)}`} className={`course-directory-card ${isCurrent ? "current" : ""}`}><div className="directory-number">{String(index + 1).padStart(2, "0")}</div><div className="course-directory-copy"><div className="course-card-title"><h3>{name}</h3>{isCurrent && <span className="current-badge">目前瀏覽中</span>}</div><div className="directory-meta"><span><CalendarDays size={13} /> {summary.sessions} 次上課</span><span><span className="meta-dot" /> {summary.hours} 節</span></div></div><ChevronRight size={17} className="directory-arrow" /></Link>; })}</div>
      </section>
      <footer className="footer-note"><span>115 · 學習路線</span><span>資料依 PDF 課表整理 · 僅顯示講師與助教資訊</span><span>一門課，一條學習路線</span></footer>
    </main>
  );
}
