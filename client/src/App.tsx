import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CourseDetail from "./pages/CourseDetail";
import Directories from "./pages/Directories";
import Home from "./pages/Home";
import LecturerDetail from "./pages/LecturerDetail";
import PasswordGate from "./components/PasswordGate";

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={Directories} />
      <Route path="/lecturers" component={Directories} />
      <Route path="/course/:course" component={CourseDetail} />
      <Route path="/lecturer/:person" component={LecturerDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
      </Switch>
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
