import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";

export default function NotFound() {
  return (
    <main className="site-shell detail-shell not-found-shell">
      <div className="paper-glow" aria-hidden="true" />
      <SiteNav current="not-found" />
      <section className="not-found-card panel-card" aria-labelledby="not-found-title">
        <div className="not-found-icon"><AlertCircle size={30} /></div>
        <p className="eyebrow"><span /> 找不到頁面</p>
        <h1 id="not-found-title">這個頁面不存在</h1>
        <p>網址可能已變更，請回到課表首頁繼續瀏覽。</p>
        <Link href="/" className="not-found-home"><ArrowLeft size={16} /> 回到課表首頁</Link>
      </section>
    </main>
  );
}
