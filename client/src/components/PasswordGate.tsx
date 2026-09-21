import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ArrowRight, BookOpen, LockKeyhole } from "lucide-react";

const ACCESS_KEY = "course-schedule-access";
const PASSWORD_HASH = "b66d2a7b44ffc72ca3dd368adf044529200cd5415576140e7162244c9dfbc116";

async function hashPassword(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(ACCESS_KEY) === "granted");
    setChecking(false);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    if ((await hashPassword(password)) === PASSWORD_HASH) {
      window.localStorage.setItem(ACCESS_KEY, "granted");
      setPassword("");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  return (
    <main className="access-gate">
      <div className="access-card">
        <div className="access-brand"><div className="brand-mark"><BookOpen size={20} /></div><span>電腦應用與 AI 工具班</span></div>
        <div className="access-icon"><LockKeyhole size={23} /></div>
        <p className="access-kicker">學員課表</p>
        <h1>請輸入查看密碼</h1>
        <p className="access-description">此課表僅提供學員查看，輸入密碼後即可瀏覽課程、講師與月曆。</p>
        <form onSubmit={submit} className="access-form">
          <label htmlFor="schedule-password">查看密碼</label>
          <input id="schedule-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="請輸入密碼" autoComplete="current-password" autoFocus />
          <button type="submit">進入課表 <ArrowRight size={16} /></button>
        </form>
        {error && <p className="access-error" role="alert">密碼不正確，請再試一次。</p>}
        <p className="access-note">本裝置驗證成功後會記住查看權限。</p>
      </div>
    </main>
  );
}
