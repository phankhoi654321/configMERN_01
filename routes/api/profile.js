const express = require("express");
const router = express.Router();

//@router Get api/profile/test
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

module.exports = router;
