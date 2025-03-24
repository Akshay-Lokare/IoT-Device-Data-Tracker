import deviceData from "../data/deviceData"; 
const { motionDeviceData } = deviceData;

export async function createMotionEvent(buttonLabel: string, deviceId: string | number) {
    console.log("🟡 Function createMotionEvent called with:", { buttonLabel, deviceId });

    // Find the device in motionDeviceData
    const device = motionDeviceData.find((d) => d.deviceId === deviceId);
    if (!device) {
        console.error(`❌ No device found for deviceId: ${deviceId}`);
        return false;
    }

    const { locationTags } = device; // Extract location tags
    let motionEvents = 1; // Default to 1

    try {
        console.log(`🟡 Fetching existing motion event data for deviceId: ${deviceId}...`);
        
        const response = await fetch(`http://localhost:5000/api/motion/events/${deviceId}`);

        if (response.ok) {
            const existingEvents = await response.json();
            console.log("🟡 Existing Event Data:", existingEvents);

            // Extract last event from array
            if (Array.isArray(existingEvents) && existingEvents.length > 0) {
                const lastEvent = existingEvents[existingEvents.length - 1];

                if (lastEvent.device?.motionEvents !== undefined) {
                    motionEvents = lastEvent.device.motionEvents + 1;
                } else {
                    console.warn("⚠️ No motionEvents found in the latest event, starting from 1.");
                }
            } else {
                console.warn("⚠️ No previous events found, assuming first motion event.");
            }
        } else {
            console.warn(`⚠️ No existing data found (Status: ${response.status}). Assuming first motion event.`);
        }

        console.log(`✅ Updated motionEvents count: ${motionEvents}`);

        const payloadMapping: Record<string, number> = {
            "No Motion": 0,
            "Motion Triggered": 1,
        };

        if (!(buttonLabel in payloadMapping)) {
            console.error(`❌ Unknown button label: '${buttonLabel}'. Valid options: ${Object.keys(payloadMapping).join(", ")}`);
            return false;
        }

        const eventData = {
            deviceId,
            timestamp: new Date().toISOString(),
            locationTags,
            device: {
                motionEvents,
                events: {
                    eventsId: buttonLabel,
                    payload: payloadMapping[buttonLabel]
                }
            },
            updateDate: new Date().toISOString()
        };

        console.log("🟡 Sending event data:", JSON.stringify(eventData, null, 2));

        const postResponse = await fetch("http://localhost:5000/api/motion/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        if (!postResponse.ok) {
            throw new Error(`❌ Failed to create/update motion event. Status: ${postResponse.status}`);
        }

        console.log(`✅ Event processed successfully for Device: ${deviceId}, Event: ${buttonLabel}`);
        return true;
    } catch (error) {
        console.error("❌ Error processing motion event:", error);
        return false;
    }
}
