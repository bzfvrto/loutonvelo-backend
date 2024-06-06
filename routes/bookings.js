var express = require("express");
const Bike = require("../models/bikes");
const Booking = require("../models/bookings");
var router = express.Router();

router.get("/", async (req, res) => {
    const bookings = await Booking.find();
    return res.json({ result: true, bookings });
});

router.post("/", async (req, res) => {
    const { bikes, startAt, endAt } = req.body;
    const bookedBikes = await Bike.find({ _id: { $in: bikes } });

    const newBooking = new Booking({
        bikes,
        startAt,
        endAt,
    });

    const savedBooking = await newBooking.save();
    await bikes.update({ status: "reserved" });
    console.log(req.body, newBooking);
    return res.json({ data: { result: true, booking: savedBooking.populate("bikes") } });
});

module.exports = router;
