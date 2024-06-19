var express = require("express");
const Brand = require("../models/brands");
var router = express.Router();
const authenticateUser = require("./middleware/authenticateMiddleware");

router.get("/", authenticateUser, async (req, res) => {
    const brands = await Brand.find({ shop: req.user.user.shop });
    return res.json({ result: true, brands });
});

router.post("/", (req, res) => {
    const { name, description, website, shop } = req.body;
    console.log(req.body);
    Brand.find({ name: name }).then((brands) => {
        if (brands.length > 0) {
            return res.json({ result: false, error: "This brand already exist" });
        }
        const newBrand = new Brand({
            name: name,
            description: description,
            website: website,
            shop: shop,
        });

        newBrand.save().then((brand) => {
            return res.json({ result: true, brand: brand });
        });
    });
});

module.exports = router;
