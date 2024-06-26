var express = require("express");
const Bike = require("../models/bikes");
const User = require("../models/users");
const Shop = require("../models/shops");
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
        activationCode: generateActivationCode(),
        user: req.user.user,
    });

    const savedBooking = await newBooking.save();
    // Bike is reserved for duration not globally
    // const bookedBikes = await Bike.updateMany({ _id: { $in: bikes } }, { $set: { availability: "reserved" } });
    console.log(req.body, newBooking);
    return res.json({ data: { result: true, booking: savedBooking.populate("bikes") } });
});

router.get("/:id", authenticateUser, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate({ path: "user", model: User, select: "id" })
        .populate({ path: "bikes", model: Bike })
        .populate({ path: "shop", model: Shop, select: "name" });
    // console.log(booking.user.id, req.user);
    if (booking.user.id !== req.user.user._id) {
        return res
            .status(409)
            .json({ result: false, errors: [{ message: "This booking does not belongs to current user" }] });
    }
    console.log("fetched booking", booking);
    return res.json({ result: true, data: { booking } });
});

const generateActivationCode = (length = 4) => {
    let result = "";
    const characters = "0123456789";
    const charactersLength = characters.length;

    for (let index = 0; index < length; index++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

module.exports = router;
