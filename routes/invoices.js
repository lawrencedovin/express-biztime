const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    }
    catch(e) {
        return next(e);
    }
});

router.get("/:comp_code", async (req, res, next) => {
    try {
        const { comp_code } = req.params;
        const results = await db.query(
            `SELECT * FROM invoices
            WHERE comp_code=$1`,
            [comp_code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find user with id of ${id}`, 404);
        }
        return res.json({invoices: results.rows[0]});
    }
    catch(e) {
        return next(e);
    }
});

module.exports = router;