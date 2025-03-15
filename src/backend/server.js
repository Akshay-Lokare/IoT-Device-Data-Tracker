import express from "express";
import cors from "cors";
import * as dotenv from "dotenv"; 
import connectDB from "./db.js";
import feedbackEvent from "./feedbackSchema.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

app.get("/backend-test", (req, res) => {
    console.log("✅ /backend-test route hit!");
    res.send("API is running...");
});

// ✅ Fix: Log incoming GET request for debugging
app.get("/api/events/:device_id", async (req, res) => {
    const { device_id } = req.params;
    console.log(`➡️ GET request received for device_id: ${device_id}`);

    try {
        const event = await feedbackEvent.findOne({ deviceId: device_id });
        if (!event) {
            console.log("❌ No event found for device_id:", device_id);
            return res.status(404).json({ message: "Event not found" });
        }
        console.log("✅ Event found:", event);
        res.json(event);
    } catch (error) {
        console.error("❌ Error retrieving event:", error);
        res.status(500).json({ error: "Failed to retrieve event" });
    }
});

app.post("/api/events", async (req, res) => {
    try {
        console.log("➡️ POST request received with body:", req.body);
        const { deviceId, timestamp, locationTags, device } = req.body;

        // 🆕 Always create a new feedback event
        console.log(`🆕 Creating new event for deviceId: ${deviceId}`);
        const newEvent = new feedbackEvent({
            deviceId, 
            timestamp, 
            locationTags, 
            device
        });

        await newEvent.save();
        console.log("✅ New event created successfully:", newEvent);
        res.status(201).json({ message: "Feedback event created successfully", newEvent });

    } catch (error) {
        console.error("❌ Error processing event:", error);
        res.status(500).json({ error: "Failed to process event" });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
