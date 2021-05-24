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

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;

        const result = await db.query(
            `SELECT code, industry
             FROM industries
             WHERE code = $1`,
          [code]
      );

      if (result.rows.length === 0) {
        throw new ExpressError(`No such industry: ${code}`, 404)
      }
  
      return res.json({"industry": result.rows[0]});
    }

    catch(e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;

        const results = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`, 
            [code, industry]);
        return res.status(201).json({company: results.rows[0]});
    }
    catch(e) {
        return next(e);
    }
});

module.exports = router;