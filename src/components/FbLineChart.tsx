import React, { useEffect, useState } from "react";
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
import "chartjs-adapter-date-fns"; // Required for time-based scales
import axios from "axios";

import deviceData from "../data/deviceData"; // Import default object
const { fbDeviceData } = deviceData;  // Extract fbDeviceData

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const FbLineChart = () => {
    const [eventData, setEventData] = useState<{ timestamp: string; value: number; deviceId: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ Fixed: Use `fbDeviceData`
    const [selectedDeviceId, setSelectedDeviceId] = useState(
        Array.isArray(fbDeviceData) && fbDeviceData.length > 0 ? fbDeviceData[0]?.deviceId : ""
    );
    const [previousDeviceId, setPreviousDeviceId] = useState(selectedDeviceId);

    // Using AbortController to cancel previous API call
    const fetchData = async () => {
        console.log("Fetching data...");
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const signal = controller.signal;

        try {
            console.log(`Requesting data from: http://localhost:5000/api/feedback/events/${selectedDeviceId}`);
            const response = await axios.get(`http://localhost:5000/api/feedback/events/${selectedDeviceId}`, { signal });

            console.log("HTTP Status:", response.status);
            console.log("Data received:", response.data);

            // Ensure response is an array
            if (Array.isArray(response.data)) {
                console.log("Received an array of events.");

                const extractedData = response.data
                .map(event => ({
                    timestamp: event.timestamp,
                    value: event.device?.button?.payload ?? 0, // Ensure payload is defined
                    deviceId: event.device?.button?.buttonId || "Unknown", // Extract buttonId as deviceId
                }))

                .filter(item => item.timestamp && item.value !== undefined);
             // filtering data based on what we want here

                console.log("Extracted Data:", extractedData);

                setEventData(extractedData.length > 0 ? extractedData : []);

            } else {
                console.warn("Unexpected data format:", response.data);
                setEventData([]);
            }
        } catch (err: any) {
            console.error("Error fetching event data:", err);

            if (err.response) {
                setError(`Server error: ${err.response.status} - ${err.response.data}`);
            } else if (err.request) {
                setError("No response from server.");
            } else {
                setError("Failed to fetch event data.");
            }

        } finally {
            console.log("Data fetch completed.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setPreviousDeviceId(selectedDeviceId);
    }, []);

    useEffect(() => {
        if (selectedDeviceId !== previousDeviceId) {
            fetchData();
            setPreviousDeviceId(selectedDeviceId);
        }
    }, [selectedDeviceId]);

    const deviceColorMap: { [key: string]: string } = {
        Worst: "#FF0000",      // Red
        Bad: "#FF8C00",        // Orange
        Good: "#32CD32",       // Green
        Excellent: "#1E90FF",  // Blue
    };
    
    const data = {
        labels: eventData.map((item) => item.timestamp),
        datasets: [
            {
                label: "Sensor Readings", // General label for legend
                data: eventData.map((item) => ({
                    x: item.timestamp,
                    y: item.value,
                    deviceId: item.deviceId, // Attach deviceId to each data point
                })),
                borderColor: eventData.map((item) => deviceColorMap[item.deviceId] || "#000000"),
                backgroundColor: eventData.map((item) => deviceColorMap[item.deviceId] || "rgba(0, 0, 0, 0.2)"),
                tension: 0.4,
                pointRadius: 5, // Make points visible
                pointBackgroundColor: eventData.map((item) => deviceColorMap[item.deviceId] || "#000000"),
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
                        const deviceId = pointData.deviceId || "Unknown"; // Retrieve deviceId
    
                        return `🫧 ${deviceId}: ${tooltipItem.raw.y}`;
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
                    {Array.isArray(fbDeviceData) && fbDeviceData.length > 0 ? (
                        fbDeviceData.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
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

export default FbLineChart;
