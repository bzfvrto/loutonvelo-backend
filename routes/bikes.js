var express = require("express");
const Brand = require("../models/brands");
const Bike = require("../models/bikes");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "./tmp/" });
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Booking = require("../models/bookings");

router.get("/", async (req, res) => {
    const bikes = await Bike.find();
    return res.json({ data: { result: true, bikes } });
});

router.get("/available", async (req, res) => {
    const { from, to } = req.query;
    const bookingsForPeriod = await Booking.find({
        $or: [
            { $and: [{ startAt: { $gte: new Date(from) } }, { startAt: { $lte: new Date(to) } }] },
            { $and: [{ endAt: { $gte: new Date(from) } }, { endAt: { $lte: new Date(to) } }] },
            { $and: [{ startAt: { $gte: new Date(from) } }, { endAt: { $lte: new Date(to) } }] },
            { $and: [{ startAt: { $lte: new Date(from) } }, { endAt: { $gte: new Date(to) } }] },
        ],
    }).select("bikes");
    const bookedBikes = bookingsForPeriod.map((bookedBikes) => bookedBikes.bikes).flat(1);
    const bikes = await Bike.find({ _id: { $not: { $in: bookedBikes } } });
    if (bikes.length === 0) {
        return res.json({ errors: { message: "No bikes availables" } });
    }
    console.log(`${bikes.length} bikes are available.`);
    return res.json({ data: { result: true, bikes: bikes } });
});

router.post("/", upload.array("pictures"), async (req, res) => {
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
    console.log(req.body, req.files);
    const brand = await Brand.findById(brandId);

    if (!brand) {
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
});

const storePicturesInCloudinary = async (pictures) => {
    const result = await Promise.all(
        pictures.map((picture) => cloudinary.uploader.upload(picture.path, { resource_type: "auto" }))
    );
    return result;
};

module.exports = router;
