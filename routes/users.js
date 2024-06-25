var express = require("express");
const User = require("../models/users");
var router = express.Router();
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../modules/generateToken");
const Shop = require("../models/shops");
const authenticateUser = require("./middleware/authenticateMiddleware");

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email: email })
        .select("password")
        .select("email")
        .select("role")
        .select("firstName")
        .select("lastName");

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.sendStatus(401);
    }

    const userPayload = { email: user.email, _id: user._id };

    if (user.role === "reseller") {
        const shop = await Shop.findOne({ user: user._id });
        userPayload.shop = shop?._id;
    }
    console.log("userPayload", userPayload);

    user.token = generateAccessToken({ user: userPayload });

    user.username = `${user.firstName} ${user.lastName}`;
    console.log("user", user);
    return res.json({ data: { result: true, user: user } });
});

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
        return res.status(409).json({ result: false, errors: [{ message: "Users already exist" }] });
    }

    const accessToken = generateAccessToken({ email });

    const newUser = new User({
        firstName,
        lastName,
        email,
        token: accessToken,
        password: bcrypt.hashSync(password, 10),
    });

    const createdUser = await newUser.save();

    return res.json({ data: { result: true, user: createdUser } });
});

router.put("/update-reseller-account", authenticateUser, async (req, res) => {
    const { isActive } = req.body;
    // console.log(isActive, req.user);
    const updatedUser = await User.findByIdAndUpdate(req.user.user._id, { role: isActive ? "reseller" : "user" });
    // console.log("updatedUser", updatedUser);
    return res.json({ data: { result: true, user: updatedUser } });
});

module.exports = router;
