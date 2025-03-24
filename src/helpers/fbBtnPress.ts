import deviceData from "../data/deviceData"; // Import default object
const { fbDeviceData } = deviceData;  // Extract fbDeviceData properly

export async function createFeedbackEvent(buttonLabel: string, deviceId: string | number) {
    console.log("🟡 Function createFeedbackEvent called with:", { buttonLabel, deviceId });

    // Find the device in fbDeviceData
    const device = fbDeviceData.find((d) => d.deviceId === deviceId);
    if (!device) {
        console.error(`❌ No device found for deviceId: ${deviceId}`);
        return false;
    }

    const { locationTags } = device;
    let buttonPresses = 1; // Default to 1

    try {
        console.log(`🟡 Fetching existing event data for deviceId: ${deviceId}...`);
        
        const response = await fetch(`http://localhost:5000/api/feedback/events/${deviceId}`);

        if (response.ok) {
            const existingEvents = await response.json();
            console.log("🟡 Existing Event Data:", existingEvents);

            // Ensure the existingEvents is an array and extract the last event
            if (Array.isArray(existingEvents) && existingEvents.length > 0) {
                const lastEvent = existingEvents[existingEvents.length - 1]; // Get the latest event

                if (lastEvent.device?.buttonPresses !== undefined) {
                    buttonPresses = lastEvent.device.buttonPresses + 1;
                } else {
                    console.warn("⚠️ No buttonPresses found in the latest event, starting from 1.");
                }
            } else {
                console.warn("⚠️ No previous events found, assuming first button press.");
            }
        } else {
            console.warn(`⚠️ No existing data found (Status: ${response.status}). Assuming first button press.`);
        }

        console.log(`✅ Updated buttonPresses count: ${buttonPresses}`);

        // Prepare the event data
        const eventData = {
            deviceId,
            timestamp: new Date().toISOString(),
            locationTags,
            device: {
                buttonPresses,
                button: {
                    buttonId: buttonLabel,
                    payload: { "Worst": 1, "Bad": 2, "Good": 3, "Excellent": 4 }[buttonLabel] || 0
                }
            },
            updateDate: new Date().toISOString()
        };

        console.log("🟡 Sending event data:", JSON.stringify(eventData, null, 2));

        const postResponse = await fetch("http://localhost:5000/api/feedback/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        if (!postResponse.ok) {
            throw new Error(`❌ Failed to create/update feedback event. Status: ${postResponse.status}`);
        }

        console.log(`✅ Event processed successfully for Device: ${deviceId}, Button: ${buttonLabel}`);
        return true;
    } catch (error) {
        console.error("❌ Error processing event:", error);
        return false;
    }
}
