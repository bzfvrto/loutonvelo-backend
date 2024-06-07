var express = require("express");
const Bike = require("../models/bikes");
const User = require("../models/users");
const Booking = require("../models/bookings");
var router = express.Router();

router.get("/", async (req, res) => {
    const bookings = await Booking.find()
        .populate({
            path: "user",
            model: User,
        })
        .populate({
            path: "bikes",
            model: Bike,
        });
    // .populate({ path: "user", select: "username", select: "email" });
    console.log(bookings);
    return res.json({ result: true, bookings });
});

router.post("/", async (req, res) => {
    const { bikes, startAt, endAt, user } = req.body;
    // const bookedBikes = await Bike.find({ _id: { $in: bikes }, status: "available" });
    console.log(req.body);
    const newBooking = new Booking({
        bikes,
        startAt,
        endAt,
        user,
    });

    const savedBooking = await newBooking.save();
    const bookedBikes = await Bike.updateMany(
        { _id: { $in: bikes }, status: "available" },
        { $set: { status: "reserved" } }
    );
    console.log(req.body, newBooking, bookedBikes);
    return res.json({ data: { result: true, booking: savedBooking.populate("bikes") } });
});

module.exports = router;
