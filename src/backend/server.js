import express from "express";
import cors from "cors";
import * as dotenv from "dotenv"; 
import connectDB from "./db.js";
import { exec } from "child_process";   // for keybase commands

import feedbackEvent from "./feedbackSchema.js";
import motionEvent from "./motionSchema.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const KEYBASE_TEAM = process.env.KEYBASE_TEAM
const KEYBASE_CHANNEL = process.env.KEYBASE_CHANNEL

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

//webhooks
const webhookLogs = [];

const sendWebhookAlertsToKeybase = async (message) => {
    try {
        // Convert template literals to actual newlines
        const formattedMessage = message.replace(/\\n/g, '\n');
        
        // Escape for CLI while preserving newlines
        const cliSafeMessage = formattedMessage
            .replace(/"/g, '\\"')  // Escape quotes
            .replace(/([^\\])\n/g, '$1\\n');  // Only escape unescaped newlines

        const command = `keybase chat send "${KEYBASE_TEAM || 'akshays_channel'}" --channel="${KEYBASE_CHANNEL || 'iot_alerts'}" "${cliSafeMessage}"`;
        
        console.log("Sending to Keybase:", command);
        
        exec(command, (error, stdout, stderr) => {
            if (error) console.error(`❌ Keybase Error: ${error.message}`);
            if (stderr) console.error(`⚠️ Keybase Warning: ${stderr}`);
            console.log(`✅ Alert Sent`);
        });
    } catch (error) {
        console.error('Error in sendWebhookAlertsToKeybase:', error);
    }
};

app.post('/webhooks', (req, res) => {
    console.log('📦 Webhook payload received:', req.body);

    const { eventType, timestamp, payload, deviceId, locationTags } = req.body;

    // Store the event (for debugging)
    webhookLogs.push(req.body);

    let alertMessage;
    let responsePayload;

    // Handle different event types
    if (eventType === "motion") {
        alertMessage = [
            `🚨 **Motion Alert** 🚨`,
            `📅 **Time:** ${new Date(timestamp).toLocaleString()}`,
            `🎯 **Event:** ${payload || "Motion detected"}`,
            `🔧 **Device:** ${deviceId}`,
            `📍 **Location:** ${locationTags || 'Unknown'}`
        ].join('\n');

        responsePayload = {
            status: "success",
            event: {
                type: eventType,
                device: deviceId,
                time: timestamp,
                details: payload || "No additional details",
                location: locationTags
            }
        };
    } 
    else if (eventType === "feedback") {
        alertMessage = [
            `💬 **Feedback Alert** 💬`,
            `📅 **Time:** ${new Date(timestamp).toLocaleString()}`,
            `📝 **Feedback:** ${payload || "Feedback received"}`,
            `🔧 **Device:** ${deviceId}`,
            `📍 **Location:** ${locationTags || 'Unknown'}`
        ].join('\n');

        responsePayload = {
            status: "success",
            event: {
                type: eventType,
                device: deviceId,
                time: timestamp,
                feedback: payload || "No feedback content",
                location: locationTags
            }
        };
    }
    else {
        return res.status(200).json({
            status: "ignored",
            reason: "Unsupported event type",
            received_data: req.body
        });
    }

    // Send to Keybase
    sendWebhookAlertsToKeybase(alertMessage);

    // Add keybase info to response
    responsePayload.keybase = {
        status: "alert_sent",
        message: alertMessage
    };

    res.status(200).json(responsePayload);
});

app.get('/webhooks', (req, res) => {
    res.status(200).send({ logs: webhookLogs });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
