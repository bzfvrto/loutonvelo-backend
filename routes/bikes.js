var express = require("express");
const Brand = require("../models/brands");
const Bike = require("../models/bikes");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "./tmp/" });
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Booking = require("../models/bookings");
const Shop = require("../models/shops");
const authenticateUser = require("./middleware/authenticateMiddleware");

router.get("/", async (req, res) => {
    const { limit } = req.query;
    console.log(limit);
    let query = Bike.find().sort({ createdAt: -1 });
    if (limit) {
        query.limit(Number(limit));
    }
    const bikes = await query
        .populate({
            path: "shop",
            model: Shop,
        })
        .populate({
            path: "brand",
            model: Brand,
        })
        .exec();
    console.log(bikes);
    return res.json({ data: { result: true, bikes } });
});

router.get("/available", async (req, res) => {
    const { from, to, city } = req.query;
    let regex = new RegExp(`^${city}$`, "i");
    const availableShops = await Shop.find({ "address.city": { $regex: regex } });
    console.log(
        `availableShops for ${city}`,
        availableShops,
        availableShops.map((item) => item.id)
    );
    const bookingsForPeriod = await Booking.find({
        $or: [
            { $and: [{ startAt: { $gte: new Date(from) } }, { startAt: { $lte: new Date(to) } }] },
            { $and: [{ endAt: { $gte: new Date(from) } }, { endAt: { $lte: new Date(to) } }] },
            { $and: [{ startAt: { $gte: new Date(from) } }, { endAt: { $lte: new Date(to) } }] },
            { $and: [{ startAt: { $lte: new Date(from) } }, { endAt: { $gte: new Date(to) } }] },
        ],
        $whereIn: { shop: availableShops.map((item) => item.id) },
        status: { $or: [{ $ne: "finished" }, { $ne: "conflict" }, { $ne: "rejected" }] },
    }).select("bikes");
    const availableShopKey = availableShops.map((item) => item.id);
    console.log("bookingsForPeriod", bookingsForPeriod, "availableShopKey", availableShopKey);
    const bookedBikes = bookingsForPeriod.map((bookedBikes) => bookedBikes.bikes).flat(1);
    const bikes = await Bike.find({
        _id: { $not: { $in: bookedBikes } },
        shop: { $in: availableShopKey },
    });
    if (bikes.length === 0) {
        return res.json({ errors: { message: "No bikes availables" } });
    }
    console.log(`${bikes.length} bikes are available.`);
    return res.json({ data: { result: true, bikes: bikes } });
});

router.post("/", [upload.array("pictures"), authenticateUser], async (req, res, next) => {
    const {
        brandId,
        name,
        model,
        seats,
        availability,
        year,
        color,
        description,
        floorPrice,
        pricePerHour,
        size,
        shop,
    } = req.body;
    // console.log(req.body, req.files);
    try {
        const brand = await Brand.findById(brandId);

        if (!brand) {
            // throw new Error("Brand not found")
            return res.status(422).json({ result: false, error: "Brand not found" });
        }
        const pictures = await storePicturesInCloudinary(req.files);

        const newBike = new Bike({
            name,
            brand: brandId,
            model,
            seats,
            availability,
            year,
            color,
            description,
            floorPrice,
            pricePerHour,
            size,
            shop,
            pictures: pictures.map((picture) => {
                return {
                    url: picture.secure_url,
                };
            }),
        });

        const createdBike = await newBike.save();

        if (createdBike) {
            return res.json({ data: { result: true, bike: createdBike } });
        }
    } catch (error) {
        next(error);
    }
});

const storePicturesInCloudinary = async (pictures) => {
    const result = await Promise.all(
        pictures.map((picture) => cloudinary.uploader.upload(picture.path, { resource_type: "auto" }))
    );
    return result;
};

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    console.log("id id id ", id);
    // res.end();
    const bike = await Bike.findById(id);
    console.log("getting bike", bike);
    return res.json({ data: { result: true, bike } });
});

router.patch("/:id", authenticateUser, async (req, res) => {
    const id = req.params.id;
    // res.end();
    console.log(`finding & updating bike ${id}`, req.body);
    const bike = await Bike.findByIdAndUpdate(id, { ...req.body });
    // .populate({
    //     path: "shop",
    //     model: Shop,
    // })
    // .populate({
    //     path: "brand",
    //     model: Brand,
    // })
    // .exec();
    console.log("getting bike", bike);
    return res.json({ data: { result: true, bike } });
});

module.exports = router;
