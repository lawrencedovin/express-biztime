const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /companies
// Returns list of companies, like {companies: [{code, name}, ...]}
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});
    }
    catch(e) {
        return next(e);
    }
});

// GET /companies/[code]
// Return obj of company: {company: {code, name, description}}
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT * FROM companies 
            WHERE code=$1`, 
            [code]);
            
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find user with id of ${id}`, 404);
        }
        return res.json({company: results.rows[0]});
    }
    catch(e) {
        return next(e);
    }
});

// If the company given cannot be found, this should return a 404 status response.

// POST /companies
// Adds a company.

// Needs to be given JSON like: {code, name, description}
// Returns obj of new company: {company: {code, name, description}}

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    }
    catch(e) {
        return next(e);
    }
});

// PATCH /companies/[code]
// Edit existing company.
router.patch("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with id of ${code}`, 404);
        }
        return res.json({company: results.rows[0]});
    }
    catch(e) {
        return next(e);
    }
});

// DELETE /companies/[code]
// Deletes company.
router.delete("/:code", async(req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `DELETE FROM companies 
            WHERE code=$1`, 
            [code]
        );

        return res.json({message: 'Deleted'});
    }
    catch(e) {
        return next(e);
    }
});

module.exports = router;