import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasswordGate from "./components/PasswordGate";

const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Directories = lazy(() => import("./pages/Directories"));
const Home = lazy(() => import("./pages/Home"));
const LecturerDetail = lazy(() => import("./pages/LecturerDetail"));

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Suspense fallback={<div className="page-loading">載入課表中…</div>}>
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={Directories} />
      <Route path="/lecturers" component={Directories} />
      <Route path="/course/:course" component={CourseDetail} />
      <Route path="/lecturer/:person" component={LecturerDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
      </Switch>
      </Suspense>
    </WouterRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <PasswordGate><Router /></PasswordGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
