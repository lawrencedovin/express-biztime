const express = require("express");
const app = require("../app");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM industries`);
        return res.json({industries: results.rows});
    }
    catch(e) {
        return next(e);
    }
});

module.exports = router;