import React, { useState } from "react";
import { createFeedbackEvent } from "../helpers/fbBtnPress";
import deviceData from "../data/deviceData";

const { fbDeviceData } = deviceData; // Extract fbDeviceData properly
import { feedbackWebhookAlert } from "../helpers/webhookAlert";

const BtnPress: React.FC = () => {
    const [Msg, setMsg] = useState("Welcome");
    
    // Store the selected device ID from fbDeviceData
    const [selectedDeviceId, setSelectedDeviceId] = useState(fbDeviceData[0]?.deviceId || "");

    async function handleButtonClick(label: string) {
        if (!selectedDeviceId) {
            alert("Select DeviceId first...");
            return;
        }

        setMsg(label);

        // Pass the selected deviceId instead of buttonLabel
        const success = await createFeedbackEvent(label, selectedDeviceId);

        if (!success) {
            console.log('❌ Failed to record the feedback event');
        }

        const webhookMsg = {
            eventType: "feedback",
            timestamp: new Date().toISOString(),
            value: Number(label),
            deviceId: String(selectedDeviceId)
        }

        feedbackWebhookAlert(webhookMsg);

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
                {fbDeviceData.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.deviceId}
                    </option>
                ))}
            </select>

            <div className="device">
                <div className="device-screen">{Msg}</div>
                <div className="device-buttons">
                    {["Worst", "Bad", "Good", "Excellent"].map((label) => (
                        <button 
                            className="device-button" 
                            onClick={() => handleButtonClick(label)}
                            key={label}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BtnPress;
