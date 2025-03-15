import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    locationTags: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length === 3; // Ensures exactly 3 location tags
            },
            message: "Must have exactly 3 location tags",
        },
        required: true,
    },
    device: {
        buttonPresses: {
            type: Number,
            default: 0, // Starts at 0, increments when a button is pressed
        },
        button: {
            buttonId: {
                type: String,
                enum: ["Worst", "Bad", "Good", "Excellet"],
                required: true
            },
            payload: {
                type: Number, // Now a number (1, 2, 3, or 4)
                required: true,
            },
        }
    },
    updateDate: {
        type: Date,
        default: Date.now, // Stores the last time data was updated
    },
});

const feedbackEvent = mongoose.model("feedbackEvent", feedbackSchema);
export default feedbackEvent;
