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
    // Replace newlines with escaped versions for CLI
    const cliFormattedMessage = message.replace(/\n/g, '\\n');
    
    const command = `keybase chat send "akshays_channel" --channel="iot_alerts" "${cliFormattedMessage}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Keybase Error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`⚠️ Keybase Warning: ${stderr}`);
            return;
        }

        console.log(`✅ Keybase Alert Sent: ${stdout} \n ${cliFormattedMessage}`);
    });
}



app.post('/webhooks', (req, res) => {
    console.log('📦 Webhook payload received:', req.body);

    const { eventType, timestamp, payload, deviceId } = req.body;

    // Store the event (for debugging)
    webhookLogs.push(req.body);

    // Handle motion events
    if (eventType === "motion") {
        // Format the Keybase alert message
        const alertMessage = [
            `🚨 **Motion Alert** 🚨`,
            `📅 **Time:** ${new Date(timestamp).toLocaleString()}`,
            `🎯 **Event:** ${payload || "Motion detected"}`,
            `🔧 **Device:** ${deviceId}`
        ].join('\n');

        // Send to Keybase
        sendWebhookAlertsToKeybase(alertMessage);

        // Enhanced response
        res.status(200).json({
            status: "success",
            event: {
                type: eventType,
                device: deviceId,
                time: timestamp,
                details: payload || "No additional details"
            },
            keybase: {
                status: "alert_sent",
                message: alertMessage
            }
        });
    } else if (eventType === "feedback") {
        // Format the Keybase alert message
        const alertMessage = [
            `🚨 **Feedback Alert** 🚨`,
            `📅 **Time:** ${new Date(timestamp).toLocaleString()}`,
            `🎯 **Event:** ${payload || "Motion detected"}`,
            `🔧 **Device:** ${deviceId}`
        ].join('\n');

        // Send to Keybase
        sendWebhookAlertsToKeybase(alertMessage);

        // Enhanced response
        res.status(200).json({
            status: "success",
            event: {
                type: eventType,
                device: deviceId,
                time: timestamp,
                details: payload || "No additional details"
            },
            keybase: {
                status: "alert_sent",
                message: alertMessage
            }
        });
    } else {
        // Handle other event types
        res.status(200).json({
            status: "ignored",
            reason: "Not a valid event",
            received_data: req.body
        });
    }
});

app.get('/webhooks', (req, res) => {
    res.status(200).send({ logs: webhookLogs });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
