var express = require("express");
const Shop = require("../models/shops");
const User = require("../models/users");
var router = express.Router();

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

module.exports = router;
