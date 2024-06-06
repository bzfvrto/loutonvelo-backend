const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema({
    bikes: {
        type: [mongoose.Schema.Types.ObjectId],
        refs: "bikes",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refs: "users",
        required: true,
    },
    startAt: {
        type: Date,
        required: true,
    },
    endAt: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "paid", "due", "conflict", "rejected"],
    },
});

const Booking = mongoose.model("bookings", BookingSchema);

module.exports = Booking;
