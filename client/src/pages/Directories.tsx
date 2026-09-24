import { BookOpen, CalendarDays, ChevronRight, GraduationCap, UsersRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { courseNames, schedule, type Session } from "@/data/schedule";
import SiteNav from "@/components/SiteNav";

function expand(session: Session) {
  const courses = session.course === "電腦軟體、硬體架構" ? [session.course] : session.course.split("、").map((x) => x.trim()).filter(Boolean);
  const hours = session.hours.split("、").map((x) => x.trim()).filter(Boolean);
  return courses.map((course, i) => ({ course, hours: Number.parseInt(hours[i] ?? hours[0] ?? "0", 10), teacher: session.teacher, assistant: session.assistant }));
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="directory-hero"><Link href="/" className="back-link"><ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> 回到首頁</Link><p className="eyebrow"><span /> {eyebrow}</p><h1>{title}</h1><p className="detail-lede">{description}</p></section>;
}

export default function Directories() {
  const [, courseRoute] = useRoute("/courses");
  const isCourses = Boolean(courseRoute);
  const people = Array.from(new Set(schedule.flatMap((day) => [day.am.teacher, day.pm.teacher]).filter(Boolean))).sort();

  if (isCourses) {
    return <main className="site-shell directory-shell"><div className="paper-glow" aria-hidden="true" /><SiteNav current="courses" /><PageHeader eyebrow="課程索引" title="課程專頁" description="選一門課，查看完整的講師、助教、上課日期、時間與統計資訊。" /><div className="directory-grid">{courseNames.map((course, index) => { const rows = schedule.flatMap((day) => [expand(day.am).map((x) => ({ ...x, date: day.date })).filter((x) => x.course === course), expand(day.pm).map((x) => ({ ...x, date: day.date })).filter((x) => x.course === course)]).flat(); const hours = rows.reduce((sum, x) => sum + x.hours, 0); return <Link className="directory-card" href={`/course/${encodeURIComponent(course)}`} key={course}><div className="directory-number">{String(index + 1).padStart(2, "0")}</div><div className="directory-card-body"><h2>{course}</h2><div className="directory-meta"><span><CalendarDays size={14} /> {rows.length} 次上課</span><span><span className="meta-dot" /> {hours} 節</span></div></div><ChevronRight className="directory-arrow" size={18} /></Link>; })}</div><DirectoryFooter /></main>;
  }

  return <main className="site-shell directory-shell"><div className="paper-glow" aria-hidden="true" /><SiteNav current="lecturers" /><PageHeader eyebrow="講師索引" title="講師專頁" description="選一位講師，查看他的授課日期、課程與時間清單。" /><div className="directory-grid lecturer-grid">{people.map((person, index) => { const rows = schedule.flatMap((day) => [expand(day.am).map((x) => ({ ...x, date: day.date, period: "上午" })).filter((x) => x.teacher === person), expand(day.pm).map((x) => ({ ...x, date: day.date, period: "下午" })).filter((x) => x.teacher === person)]).flat(); const courses = Array.from(new Set(rows.map((x) => x.course))); return <Link className="directory-card lecturer-card" href={`/lecturer/${encodeURIComponent(person)}`} key={person}><div className="avatar-mark"><GraduationCap size={18} /></div><div className="directory-card-body"><h2>{person}</h2><div className="directory-meta"><span><CalendarDays size={14} /> {rows.length} 個時段</span><span><BookOpen size={14} /> {courses.length} 門課</span></div></div><ChevronRight className="directory-arrow" size={18} /></Link>; })}</div><DirectoryFooter /></main>;
}

function DirectoryFooter() { return <footer className="footer-note"><span>115 · 學習路線</span><span>資料依 PDF 課表整理</span><span>選擇一頁，開始瀏覽</span></footer>; }
