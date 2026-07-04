import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { HomeScreen } from "./pages/HomeScreen";
import { AnalysisView } from "./pages/AnalysisView";
import { BuildTracker } from "./pages/BuildTracker";
import { CommunityVerification } from "./pages/CommunityVerification";
import { ReproducibilityView } from "./pages/ReproducibilityView";
import { Shield } from "lucide-react";

const App: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("akip_cookie_consent");
    if (!consent) {
      // Small delay to present the banner elegantly
      const timer = setTimeout(() => setShowConsent(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("akip_cookie_consent", "all");
    setShowConsent(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("akip_cookie_consent", "essential");
    setShowConsent(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white">
        <NavBar />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/analyze/:id" element={<AnalysisView />} />
            <Route path="/build/:id" element={<BuildTracker />} />
            <Route path="/build/:id/community" element={<CommunityVerification />} />
            <Route path="/build/:id/manifest" element={<ReproducibilityView />} />
          </Routes>
        </main>

        {/* EU GDPR Compliance & Cookie Banner */}
        {showConsent && (
          <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] z-50 animate-fade-in-up">
            <div className="glass p-6 rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-950/95 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-100 tracking-tight">EU Privacy & Cookie Consent</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We use cookies and active session tokens to verify repository authenticity, secure patch dispatch keys, and enable GKI compilation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleAcceptEssential}
                  className="flex-1 py-2 px-3 text-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 py-2 px-3 text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-950/55 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
