var express = require("express");
const Brand = require("../models/brands");
const Bike = require("../models/bikes");
var router = express.Router();

router.get("/", async (req, res) => {
    const bikes = await Bike.find();
    return res.json({ data: { result: true, bikes } });
});

router.post("/", async (req, res) => {
    const { brandId, name, model, seats, availability, year, color, description, floorPrice, pricePerHour } = req.body;
    console.log(req.body);
    const brand = await Brand.findById(brandId);
    if (!brand) {
        return res.status(422).json({ result: false, error: "Brand not found" });
    }
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
    });

    const createdBike = await newBike.save();

    if (createdBike) {
        return res.json({ data: { result: true, bike: createdBike } });
    }
});

module.exports = router;
