import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import FbEvent from "./pages/fbEvent";
import MotionEvent from "./pages/motionEvent";
import NotFoundPage from "./pages/404";

const App: React.FC = () => {
  return (
    <Router> 

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/create-fb-event" element={<FbEvent />} />
        <Route path="/create-motion-event" element={<MotionEvent />} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>

    </Router>
  );
};

export default App;
