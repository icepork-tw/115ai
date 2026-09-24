import { ArrowLeft, BookOpen, CalendarDays, Clock3, GraduationCap, UsersRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { schedule, type Session } from "@/data/schedule";
import SiteNav from "@/components/SiteNav";

function expand(session: Session) { const courses = session.course === "電腦軟體、硬體架構" ? [session.course] : session.course.split("、").map((x) => x.trim()).filter(Boolean); const hours = session.hours.split("、").map((x) => x.trim()).filter(Boolean); return courses.map((course, i) => ({ course, hours: hours[i] ?? hours[0] ?? "0", teacher: session.teacher, assistant: session.assistant })); }
function formatDate(value: string) { const [year, month, day] = value.split("-"); return `${year}/${month}/${day}`; }

export default function LecturerDetail() {
  const [, params] = useRoute("/lecturer/:person");
  const person = params?.person ? decodeURIComponent(params.person) : "";
  const rows = schedule.flatMap((day) => [
    ...expand(day.am).filter((x) => x.teacher === person).map((x) => ({ ...x, date: day.date, weekday: day.weekday, period: "上午", time: "08:50 — 11:50" })),
    ...expand(day.pm).filter((x) => x.teacher === person).map((x) => ({ ...x, date: day.date, weekday: day.weekday, period: "下午", time: "12:50 — 15:50" })),
  ]);
  const courses = Array.from(new Set(rows.map((x) => x.course)));
  const totalHours = rows.reduce((sum, row) => sum + Number.parseInt(row.hours, 10), 0);
  const assistants = Array.from(new Set(rows.map((row) => row.assistant).filter(Boolean)));
  return <main className="site-shell detail-shell"><div className="paper-glow" aria-hidden="true" /><SiteNav current="lecturer-detail" /><section className="detail-hero"><Link href="/lecturers" className="back-link"><ArrowLeft size={16} /> 回到講師專頁</Link><p className="eyebrow"><span /> 講師資料</p><h1>{person}</h1><p className="detail-lede">這位講師的完整授課清單，依日期排列。</p></section><section className="detail-stats"><div className="stat-card"><CalendarDays size={18} /><span>授課時段</span><strong>{rows.length}<small> 個</small></strong></div><div className="stat-card"><Clock3 size={18} /><span>累計節數</span><strong>{totalHours}<small> 節</small></strong></div><div className="stat-card"><BookOpen size={18} /><span>授課課程</span><strong>{courses.length}<small> 門</small></strong></div><div className="stat-card"><UsersRound size={18} /><span>合作助教</span><strong>{assistants.length}<small> 位</small></strong></div></section><section className="detail-layout"><div className="course-list panel-card"><div className="list-heading"><div><span className="section-overline">授課安排</span><h2>授課日期與時間</h2></div><span className="course-count">共 {rows.length} 筆</span></div><div className="schedule-list">{rows.map((row, index) => <div className="course-row" key={`${row.date}-${row.period}-${index}`}><div className="row-index">{String(index + 1).padStart(2, "0")}</div><div className="row-date"><strong>{formatDate(row.date)}</strong><span>星期{row.weekday} · {row.period}</span></div><div className="row-time"><Clock3 size={14} /> {row.time}<small>{row.hours} 節</small></div><div className="row-staff"><span><GraduationCap size={14} /> {row.course}</span><span><UsersRound size={14} /> {row.assistant || "無助教"}</span></div></div>)}</div></div><aside className="people-card panel-card"><span className="section-overline">授課課程</span><h2>授課課程</h2>{courses.map((course) => <Link className="person-name course-person-link" href={`/course/${encodeURIComponent(course)}`} key={course}><BookOpen size={16} />{course}</Link>)}<div className="detail-note">資料以 PDF 課表為準<br />僅列出教師授課紀錄</div></aside></section><footer className="footer-note"><span>115 · 學習路線</span><span>資料依 PDF 課表整理</span><span>一位講師，一條教學路線</span></footer></main>;
}
