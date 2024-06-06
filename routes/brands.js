var express = require("express");
const Brand = require("../models/brands");
var router = express.Router();

router.get("/", async (req, res) => {
    const brands = await Brand.find();
    return res.json({ result: true, brands });
});

router.post("/", (req, res) => {
    const { name, description, website } = req.body;
    console.log(req.body);
    Brand.find({ name: name }).then((brands) => {
        if (brands.length > 0) {
            return res.json({ result: false, error: "This brand already exist" });
        }
        const newBrand = new Brand({
            name: name,
            description: description,
            website: website,
        });

        newBrand.save().then((brand) => {
            return res.json({ result: true, brand: brand });
        });
    });
});

module.exports = router;
