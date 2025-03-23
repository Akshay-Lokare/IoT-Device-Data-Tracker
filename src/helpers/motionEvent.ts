import deviceData from "../data/deviceData"; // Import default object
const { motionDeviceData } = deviceData;  // Extract motionDeviceData properly

export async function createMotionEvent(buttonLabel: string, deviceId: string | number) {
    console.log("Function createMotionEvent called with:", { buttonLabel, deviceId });

    // Access `motionDeviceData` correctly
    const device = motionDeviceData.find((d) => d.deviceId === deviceId);
    if (!device) {
        console.error(`❌ No device found for deviceId: ${deviceId}`);
        return false;
    }

    const { locationTags } = device; // Extract location tags
    let motionEvents = 1;

    try {
        console.log(`Checking existing data for deviceId: ${deviceId}`);

        // Fetch existing event data for the selected device
        const response = await fetch(`http://localhost:5000/api/motion/events/${deviceId}`);

        if (response.ok) {
            const existingEvent = await response.json();

            if (existingEvent && existingEvent.device?.motionEvents) {
                // Increment button press count based on existing data
                motionEvents = existingEvent.device.motionEvents + 1;
            }
        }

        console.log(`Updated motionEvents count: ${motionEvents}`);

        // Use deviceId instead of buttonLabel for identifying the device
        const eventData = {
            deviceId,
            timestamp: new Date().toISOString(),
            locationTags,
            device: {
                motionEvents,
                events: {
                    eventsId: buttonLabel, // Use buttonLabel for the button pressed
                    payload: { "No Motion": 0, "Motion Triggered": 1, }[buttonLabel] || 0
                }
            },
            updateDate: new Date().toISOString()
        };

        console.log("Sending event data:", JSON.stringify(eventData, null, 2));

        const postResponse = await fetch("http://localhost:5000/api/motion/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        if (!postResponse.ok) {
            throw new Error(`Failed to create/update motion event. Status: ${postResponse.status}`);
        }

        console.log(`✅ Event processed successfully for Device: ${deviceId}, Button: ${buttonLabel}`);
        return true;
    } catch (error) {
        console.error("❌ Error processing event:", error);
        return false;
    }
}
