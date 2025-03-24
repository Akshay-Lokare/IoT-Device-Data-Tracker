import React from "react";
import { useNavigate } from "react-router-dom";

import FbLineChart from "../components/FbLineChart";
import MotionLineChart from "../components/motionLineChart";

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <p className="home-h1-clock">{new Date().toLocaleDateString()}</p>
            <h1 className="home-h1">Welcome to IoT Data Manager</h1>

            <div className="nav-btn-row">
                <button className="nav-btn" onClick={() => navigate("/create-fb-event")}>Feedback</button>
                <button className="nav-btn" onClick={() => navigate("/create-motion-event")}>Motion</button>
            </div>

            <FbLineChart />
            <MotionLineChart />
        </div>
    );
};

export default Home;
