import mongoose from "mongoose";

const motionSchema = new mongoose.Schema({
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
                return arr.length === 3;
            },
            message: "Must have exactly 3 location tags",
        },
        required: true,
    },
    device: {
        motionEvents: {
            type: Number,
            default: 0,
        },
        events: {
            eventsId: {
                type: String,
                enum: ["Motion Triggered", "No Motion"],
                required: true
            },
            payload: {
                type: Number,
                required: true,
            },
        }
    },
    updateDate: {
        type: Date,
        default: Date.now,
    },
});

const motionEvent = mongoose.model("motionEvent", motionSchema);
export default motionEvent;
