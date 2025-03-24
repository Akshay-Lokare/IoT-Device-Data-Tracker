import axios from "axios";

const WEBHOOK_URL = "http://localhost:5000/webhooks";

export const motionWebhookAlert = async (newEvent: { timestamp: string; value: number; deviceId: string }) => {
    try {
        const response = await axios.post(WEBHOOK_URL, {
            eventType: "motion",
            timestamp: newEvent.timestamp,
            payload: newEvent.value,
            deviceId: newEvent.deviceId,
        });

        console.log(`🕸️ Webhook Alert Sent:`, response.data);
    } catch (error) {
        console.error("🕸️ Webhook Failed:", error);
    }
};


export const feedbackWebhookAlert = async (newEvent: { timestamp: string; value: number; deviceId: string }) => {
    try {
        const response = await axios.post(WEBHOOK_URL, {
            eventType: "feedback",
            timestamp: newEvent.timestamp,
            payload: newEvent.value,
            deviceId: newEvent.deviceId,
        }); 

        console.log(`🕸️ Webhook Alert Sent:`, response.data);
    } catch (error) {
        console.error("🕸️ Webhook Failed:", error);
    }
}