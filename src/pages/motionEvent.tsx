import React, { useState } from "react";
import { createMotionEvent } from "../helpers/motionEvent";
import deviceData from "../data/deviceData";

const { motionDeviceData } = deviceData;

export default function MotionEvent() {
    const [Msg, setMsg] = useState("Welcome");
    
    // Store the selected device ID from fbDeviceData
    const [selectedDeviceId, setSelectedDeviceId] = useState(motionDeviceData[0]?.deviceId || "");

    async function handleButtonClick(label: string) {
        if (!selectedDeviceId) {
            alert("Select DeviceId first...");
            return;
        }

        setMsg(label);

        const success = await createMotionEvent(label, selectedDeviceId);

        if (!success) {
            console.log('❌ Failed to record the feedback event');
        }
    }

    return (
        <div>
            
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <a href="/" style={{ color: 'pink', fontSize: '32px' }}>Home</a>
        </div>

        <p className="deviceId-dropdown-text">Device ID (^_^)☞</p>
            <select 
                className="deviceId-dropdown"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
                {motionDeviceData.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.deviceId}
                    </option>
                ))}
            </select>

        <div className="motion-device-container">
            
            
            <div className="motion-device">
                <div className="sensor-lens"></div>
            </div>
                <button className="clickable-circle" onClick={() => handleButtonClick("Motion Triggered")}> </button>
                <a className="no-motion-link" onClick={() => handleButtonClick("No Motion")}></a>
            </div>
        </div>
    );
};
