var express = require("express");
const Bike = require("../models/bikes");
const User = require("../models/users");
const Booking = require("../models/bookings");
const authenticateUser = require("./middleware/authenticateMiddleware");
var router = express.Router();

router.get("/", authenticateUser, async (req, res) => {
    const { type = "shop" } = req.query;
    console.log(req.user, type);

    if (type === "shop" && !req.user.user.shop) {
        return res.json({ result: true, bookings: [] });
    }

    let query = type === "shop" && req.user.user.shop ? { shop: req.user.user.shop } : { user: req.user.user._id };
    console.log("query", query);
    const bookings = await Booking.find(query)
        .populate({
            path: "user",
            model: User,
        })
        .populate({
            path: "bikes",
            model: Bike,
        });
    console.log(bookings);
    return res.json({ result: true, bookings });
});

router.post("/", authenticateUser, async (req, res) => {
    const { bikes, shop, startAt, endAt } = req.body;
    // const bookedBikes = await Bike.find({ _id: { $in: bikes }, status: "available" });
    // let bikes = req.body.bikes;

    let bikesToBook = [];
    if (typeof bikes === "string" && bikes.includes(",")) {
        bikesToBook = bikes.split(",");
    } else {
        bikesToBook = [bikes];
    }

    const newBooking = new Booking({
        bikes: bikesToBook,
        shop,
        startAt,
        endAt,
        user: req.user.user,
    });

    const savedBooking = await newBooking.save();
    // Bike is reserved for duration not globally
    // const bookedBikes = await Bike.updateMany({ _id: { $in: bikes } }, { $set: { availability: "reserved" } });
    console.log(req.body, newBooking);
    return res.json({ data: { result: true, booking: savedBooking.populate("bikes") } });
});

module.exports = router;
