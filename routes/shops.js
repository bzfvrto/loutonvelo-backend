var express = require("express");
const Shop = require("../models/shops");
const User = require("../models/users");
const Bike = require("../models/bikes");
var router = express.Router();
const authenticateUser = require("./middleware/authenticateMiddleware");
const Booking = require("../models/bookings");

router.post("/for-owner", async (req, res) => {
    const { userId } = req.body;
    const shops = await Shop.find({ user: userId });
    const shopOwner = await User.findById(userId);
    if (!shopOwner) {
        return res.status(404).json({ result: false, errors: [{ message: "User not found" }] });
    }

    if (!shops.length) {
        return res.json({ result: false, errors: [{ message: "No shop found" }] });
    }

    return res.json({ data: { result: true, shops: shops } });
});

router.get("/city/:city", async (req, res) => {
    const { city } = req.params;
    const shops = await Shop.find({ "address.city": { $regex: new RegExp(`^${city}$`, "ig") } });

    if (!shops.length) {
        return res.json({ result: false, errors: [{ message: "No shop found" }] });
    }

    return res.json({ data: { result: true, shops: shops } });
});

router.post("/", async (req, res) => {
    const { name, description, website, street, postcode, city, country, user } = req.body;

    console.log(req.body);
    const shopOwner = await User.findById(user);
    if (!shopOwner) {
        return res.status(404).json({ result: false, errors: [{ message: "User not found" }] });
    }

    const newShop = new Shop({
        name,
        description,
        website,
        address: {
            street,
            postcode,
            city,
            country,
        },
        user,
    });

    shopOwner.role = "reseller";
    await shopOwner.save();
    const shop = await newShop.save();
    res.json({ data: { result: true, shop: shop } });
});

router.get("/bikes", authenticateUser, async (req, res) => {
    const bikes = await Bike.find({ shop: req.user.user.shop });
    console.log(bikes);
    return res.json({ data: { result: true, bikes } });
});

router.get("/bookings/:id", authenticateUser, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate({ path: "user", model: User, select: "id email firstName lastName" })
        .populate({ path: "bikes", model: Bike })
        .populate({ path: "shop", model: Shop, select: "id" });

    if (booking.shop.id !== req.user.user?.shop) {
        return res
            .status(409)
            .json({ result: false, errors: [{ message: "This booking does not belongs to the current shop" }] });
    }
    console.log("fetched booking", booking);
    return res.json({ result: true, data: { booking } });
});

router.patch("/bookings/:id/start", authenticateUser, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate({ path: "user", model: User, select: "id" })
        .populate({ path: "bikes", model: Bike })
        .populate({ path: "shop", model: Shop, select: "id" });

    if (booking.shop.id !== req.user.user?.shop) {
        return res
            .status(409)
            .json({ result: false, errors: [{ message: "This booking does not belongs to the current shop" }] });
    }

    booking.startedAt = Date.now();
    booking.status = "started";
    const activeBooking = await booking.save();
    console.log("booking", booking, "activeBooking", activeBooking);

    return res.json({ result: true, data: { booking: activeBooking } });
});

router.patch("/bookings/:id/close", authenticateUser, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate({ path: "user", model: User, select: "id" })
        .populate({ path: "bikes", model: Bike })
        .populate({ path: "shop", model: Shop, select: "id" });

    if (booking.shop.id !== req.user.user?.shop) {
        return res
            .status(409)
            .json({ result: false, errors: [{ message: "This booking does not belongs to the current shop" }] });
    }

    booking.finishedAt = Date.now();
    booking.status = "finished";
    const closedBooking = await booking.save();
    console.log("booking", booking, "closedBooking", closedBooking);

    return res.json({ result: true, data: { booking: closedBooking } });
});

module.exports = router;
