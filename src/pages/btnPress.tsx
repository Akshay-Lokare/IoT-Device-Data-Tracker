import React, { useState } from "react";
import { createFeedbackEvent } from "../helpers/btnPress";
import deviceData from "../data/deviceData";

const BtnPress: React.FC = () => {
    const [Msg, setMsg] = useState("Welcome");
    
    // Store the selected device ID instead of using the button label
    const [selectedDeviceId, setSelectedDeviceId] = useState(deviceData[0]?.deviceId || "");

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
    }

    return (
        <div>            
            {/* Dropdown to select device ID */}
            <select 
                className="deviceId-dropdown"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
                {deviceData.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.deviceId}
                    </option>
                ))}
            </select>

            <p>Selected Device ID: {selectedDeviceId}</p>

            <div className="device">
                <div className="device-screen">{Msg}</div>
                <div className="device-buttons">
                    {["Worst", "Bad", "Good", "Excellet"].map((label) => (
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
