const express = require("express");
const slugify = require("slugify");
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

        const compResult = await db.query(
            `SELECT c.name, c.description, i.industry
            FROM companies AS c
                LEFT JOIN companies_industries AS ci
                    ON c.code = ci.comp_code
                LEFT JOIN industries as i
                    ON ci.industry_code = i.code
             WHERE c.code = $1`,
          [code]
      );
  
      const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
  
      if (compResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }
  
      const company = compResult.rows[0];
      company.industries = compResult.rows.map(i => i.industry);
      company.invoices = invResult.rows.map(inv => inv.id);
  
      return res.json({"company": company});
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
        const { name, description } = req.body;
        const code = slugify(name, {lower: true});

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
            `UPDATE companies 
            SET name=$1, description=$2
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
            WHERE code=$1
            RETURNING code`,
            [code]
        );

        if (results.rows.length == 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
          } 
        else {
            return res.json({status: 'Deleted'});
        }
    }
    catch(e) {
        return next(e);
    }
});

module.exports = router;