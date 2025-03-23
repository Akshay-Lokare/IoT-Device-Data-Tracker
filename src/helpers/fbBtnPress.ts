import deviceData from "../data/deviceData"; // Import default object
const { fbDeviceData } = deviceData;  // Extract fbDeviceData properly

export async function createFeedbackEvent(buttonLabel: string, deviceId: string | number) {
    console.log("Function createFeedbackEvent called with:", { buttonLabel, deviceId });

    // Access `fbDeviceData` correctly
    const device = fbDeviceData.find((d) => d.deviceId === deviceId);
    if (!device) {
        console.error(`❌ No device found for deviceId: ${deviceId}`);
        return false;
    }

    const { locationTags } = device; // Extract location tags
    let buttonPresses = 1;

    try {
        console.log(`Checking existing data for deviceId: ${deviceId}`);

        // Fetch existing event data for the selected device
        const response = await fetch(`http://localhost:5000/api/feedback/events/${deviceId}`);

        if (response.ok) {
            const existingEvent = await response.json();

            if (existingEvent && existingEvent.device?.buttonPresses) {
                // Increment button press count based on existing data
                buttonPresses = existingEvent.device.buttonPresses + 1;
            }
        }

        console.log(`Updated buttonPresses count: ${buttonPresses}`);

        // Use deviceId instead of buttonLabel for identifying the device
        const eventData = {
            deviceId,
            timestamp: new Date().toISOString(),
            locationTags,
            device: {
                buttonPresses,
                button: {
                    buttonId: buttonLabel, // Use buttonLabel for the button pressed
                    payload: { "Worst": 1, "Bad": 2, "Good": 3, "Excellent": 4 }[buttonLabel] || 0
                }
            },
            updateDate: new Date().toISOString()
        };

        console.log("Sending event data:", JSON.stringify(eventData, null, 2));

        const postResponse = await fetch("http://localhost:5000/api/feedback/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        if (!postResponse.ok) {
            throw new Error(`Failed to create/update feedback event. Status: ${postResponse.status}`);
        }

        console.log(`✅ Event processed successfully for Device: ${deviceId}, Button: ${buttonLabel}`);
        return true;
    } catch (error) {
        console.error("❌ Error processing event:", error);
        return false;
    }
}
