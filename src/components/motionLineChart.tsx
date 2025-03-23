import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import axios from "axios";

import deviceData from "../data/deviceData"; // Import device data
const { motionDeviceData } = deviceData;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const MotionLineChart = () => {
    const [eventData, setEventData] = useState<{ timestamp: string; value: number }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ Ensure `selectedDeviceId` is set correctly
    const [selectedDeviceId, setSelectedDeviceId] = useState(
        motionDeviceData.length > 0 ? String(motionDeviceData[0]?.deviceId) : ""
    );
    
    // ✅ Use `useRef` for tracking previous ID without re-renders
    const previousDeviceId = useRef(selectedDeviceId);

    const fetchData = async () => {
        console.log("Fetching data...");
        setLoading(true);
        setError(null);

        try {
            console.log(`Requesting data from: http://localhost:5000/api/motion/events/${selectedDeviceId}`);
            const response = await axios.get(`http://localhost:5000/api/motion/events/${selectedDeviceId}`);

            console.log("HTTP Status:", response.status);
            console.log("Data received:", response.data);

            if (Array.isArray(response.data)) {
                console.log("Received an array of events.");

                const extractedData = response.data
                    .map(event => ({
                        timestamp: event.timestamp,
                        value: event.device?.events?.payload ?? 0, // ✅ Ensure fallback for missing data
                    }))
                    .filter(item => item.timestamp && item.value !== undefined);

                console.log("Extracted Data:", extractedData);
                setEventData(extractedData.length > 0 ? extractedData : []);
            } else {
                console.warn("Unexpected data format:", response.data);
                setEventData([]);
            }
        } catch (err: any) {
            console.error("Error fetching event data:", err);
            setError(err.response ? `Server error: ${err.response.status} - ${err.response.data}` : "Failed to fetch event data.");
        } finally {
            console.log("Data fetch completed.");
            setLoading(false);
        }
    };

    // ✅ Fetch Data on Mount
    useEffect(() => {
        fetchData();
    }, []);

    // ✅ Fetch Data when `selectedDeviceId` changes
    useEffect(() => {
        if (selectedDeviceId !== previousDeviceId.current) {
            fetchData();
            previousDeviceId.current = selectedDeviceId; // ✅ Update ref instead of state
        }
    }, [selectedDeviceId]);

    const data = {
        labels: eventData.map((item) => item.timestamp),
        datasets: [
            {
                label: "Sensor Readings",
                data: eventData.map((item) => item.value),
                borderColor: "#f5407f",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: "minute" as const,
                    tooltipFormat: "HH:mm",
                    displayFormats: { minute: "HH:mm" },
                },
                title: { display: true, text: "Time" },
            },
            y: {
                title: { display: true, text: "Sensor Readings" },
                ticks: { stepSize: 1 },
            },
        },
    };

    return (
        <div className="graph-container">
            <div className="button-container">
                <button className="refetch-btn" onClick={fetchData} disabled={loading}>
                    {loading ? "Fetching..." : "Refetch"}
                </button>

                <select
                    className="dropdown-btn-line"
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                    {motionDeviceData.length > 0 ? (
                        motionDeviceData.map((device) => (
                            <option key={device.deviceId} value={String(device.deviceId)}>
                                {device.deviceId}
                            </option>
                        ))
                    ) : (
                        <option disabled>No Devices Available</option>
                    )}
                </select>
            </div>

            {error && <p className="error">{error}</p>}
            {loading && <p className="loading-text">Loading event data...</p>}
            {!loading && eventData.length === 0 && <p className="no-data">No event data available.</p>}

            {eventData.length > 0 && <Line data={data} options={options} />}
        </div>
    );
};

export default MotionLineChart;
