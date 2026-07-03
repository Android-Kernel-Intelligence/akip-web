import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { HomeScreen } from "./pages/HomeScreen";
import { AnalysisView } from "./pages/AnalysisView";
import { BuildTracker } from "./pages/BuildTracker";
import { CommunityVerification } from "./pages/CommunityVerification";
import { ReproducibilityView } from "./pages/ReproducibilityView";

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
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
      </div>
    </Router>
  );
};

export default App;
