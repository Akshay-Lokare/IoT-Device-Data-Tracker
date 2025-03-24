import React, { useEffect, useState, useRef, useCallback } from "react";
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const MotionLineChart = () => {
    const [eventData, setEventData] = useState<{ timestamp: string; value: number; eventsId: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ Set initial selectedDeviceId safely
    const [selectedDeviceId, setSelectedDeviceId] = useState(
        motionDeviceData.length > 0 ? String(motionDeviceData[0]?.deviceId) : ""
    );

    // ✅ Use `useRef` to track previous ID without triggering re-renders
    const previousDeviceId = useRef(selectedDeviceId);

    // ✅ Fetch motion event data
    const fetchData = useCallback(async () => {
        if (!selectedDeviceId) return; // Prevent unnecessary API call
        console.log(`Fetching data for Device ID: ${selectedDeviceId}`);

        setLoading(true);
        setError(null);

        try {
            const url = `http://localhost:5000/api/motion/events/${selectedDeviceId}`;
            console.log("Requesting data from:", url);
            const response = await axios.get(url);

            console.log("HTTP Status:", response.status);
            console.log("Data received:", response.data);

            if (Array.isArray(response.data)) {
                console.log("Received an array of events.");

                const extractedData = response.data
                    .map(event => {
                        const eventsId = event.device?.events?.eventsId || "Unknown"; // Ensure valid eventsId
                        return {
                            timestamp: event.timestamp,
                            value: event.device?.events?.payload ?? 0, // Default to 0 if undefined
                            eventsId,
                        };
                    })
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
            setLoading(false);
            console.log("Data fetch completed.");
        }
    }, [selectedDeviceId]); // ✅ Only recreate when `selectedDeviceId` changes

    // ✅ Fetch Data on Component Mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Fetch Data when `selectedDeviceId` changes
    useEffect(() => {
        if (selectedDeviceId !== previousDeviceId.current) {
            fetchData();
            previousDeviceId.current = selectedDeviceId; // ✅ Update ref instead of state
        }
    }, [selectedDeviceId, fetchData]);

    // ✅ Map event IDs to colors
    const deviceColorMap: { [key: string]: string } = {
        "Motion Triggered": "#32CD32",
        "No Motion": "#FF0000",
    };

    const data = {
        labels: eventData.map((item) => item.timestamp),
        datasets: [
            {
                label: "Sensor Readings",
                data: eventData.map((item) => ({
                    x: item.timestamp,
                    y: item.value,
                    eventsId: item.eventsId, // Attach eventsId to each data point
                })),
                borderColor: eventData.map((item) => deviceColorMap[item.eventsId] || "#000000"),
                backgroundColor: eventData.map((item) => deviceColorMap[item.eventsId] || "rgba(0, 0, 0, 0.2)"),
                tension: 0.4,
                pointRadius: 5, // Make points visible
                pointBackgroundColor: eventData.map((item) => deviceColorMap[item.eventsId] || "#000000"),
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const dataIndex = tooltipItem.dataIndex;
                        const pointData = tooltipItem.dataset.data[dataIndex];
                        const eventsId = pointData.eventsId || "Unknown"; // Retrieve eventsId
                        return `🫧 ${eventsId}: ${tooltipItem.raw.y}`;
                    },
                },
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "minute",
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
