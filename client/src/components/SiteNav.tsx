import { BookOpen, House, UserRound } from "lucide-react";
import { Link } from "wouter";

type NavArea = "courses" | "lecturers" | "course-detail" | "lecturer-detail";

export default function SiteNav({ current }: { current: NavArea }) {
  const links = [
    { href: "/", label: "回首頁", icon: House, active: false },
    { href: "/courses", label: "課程專頁", icon: BookOpen, active: current === "courses" || current === "course-detail" },
    { href: "/lecturers", label: "講師專頁", icon: UserRound, active: current === "lecturers" || current === "lecturer-detail" },
  ];

  return (
    <header className="topbar">
      <Link href="/" className="brand-lockup detail-brand">
        <div className="brand-mark"><BookOpen size={19} strokeWidth={2.2} /></div>
        <div><p className="brand-kicker">學員版 · 第 01 期</p><p className="brand-name">電腦應用與 AI 工具班</p></div>
      </Link>
      <nav className="topbar-nav page-navigation" aria-label="頁面功能選單">
        {links.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} className={`topbar-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={15} /> <span>{label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
