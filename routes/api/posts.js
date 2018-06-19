const express = require("express");
const router = express.Router();

//@router Get api/posts/test
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

module.exports = router;
