import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import BtnPress from "./pages/btnPress";

const App: React.FC = () => {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-btn-event" element={<BtnPress />} />
      </Routes>
    </Router>
  );
};

export default App;
