import express from "express";
import cors from "cors";
import * as dotenv from "dotenv"; 
import connectDB from "./db.js";

import feedbackEvent from "./feedbackSchema.js";
import motionEvent from "./motionSchema.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

//feedback
app.get("/api/feedback/events/:device_id", async (req, res) => {
    const { device_id } = req.params;

    console.log(`➡️ GET request received for device_id: ${device_id}`);

    try {
        const event = await feedbackEvent.find({ deviceId: device_id });

        if (!event) {
            console.log(" No event found for device_id:", device_id);
            return res.status(200).json({}); 
        }

        console.log(" Returning event data:", JSON.stringify(event, null, 2));

        console.log(" Event found:", event);

        res.json(event);

    } catch (error) {
        console.error(" Error retrieving event:", error);
        res.status(500).json({ error: "Failed to retrieve event" });
    }
});

app.post("/api/feedback/events", async (req, res) => {
    try {
        console.log(" POST request received with body:", req.body);
        const { deviceId, timestamp, locationTags, device } = req.body;

        // 🆕 Always create a new feedback event
        console.log(` Creating new event for deviceId: ${deviceId}`);
        const newEvent = new feedbackEvent({
            deviceId, 
            timestamp, 
            locationTags, 
            device
        });

        await newEvent.save();
        console.log(" New event created successfully:", newEvent);
        res.status(201).json({ message: "Feedback event created successfully", newEvent });

    } catch (error) {
        console.error(" Error processing event:", error);
        res.status(500).json({ error: "Failed to process event" });
    }
});


//motion
app.get("/api/motion/events/:device_id", async (req, res) => {
    const { device_id } = req.params;

    console.log(`➡️ GET request received for device_id: ${device_id}`);

    try {
        const event = await motionEvent.find({ deviceId: device_id });

        if (!event) {
            console.log(" No event found for device_id:", device_id);
            return res.status(200).json({}); 
        }

        console.log(" Returning event data:", JSON.stringify(event, null, 2));

        console.log(" Event found:", event);

        res.json(event);

    } catch (error) {
        console.error(" Error retrieving event:", error);
        res.status(500).json({ error: "Failed to retrieve event" });
    }
});

app.post("/api/motion/events", async (req, res) => {
    try {
        console.log(" POST request received with body:", req.body);
        const { deviceId, timestamp, locationTags, device } = req.body;

        // 🆕 Always create a new motion event
        console.log(` Creating new event for deviceId: ${deviceId}`);
        const newEvent = new motionEvent({
            deviceId, 
            timestamp, 
            locationTags, 
            device
        });

        await newEvent.save();
        console.log(" New event created successfully:", newEvent);
        res.status(201).json({ message: "MOtion event created successfully", newEvent });

    } catch (error) {
        console.error(" Error processing event:", error);
        res.status(500).json({ error: "Failed to process event" });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
