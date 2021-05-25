/** Routes for companies. */


const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


/** GET / => list of companies.
 *
 * =>  {companies: [{code, name, descrip}, {code, name, descrip}, ...]}
 *
 * */

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(`SELECT code, name FROM companies`);
    return res.json({companies: result.rows});
  }

  catch (err) {
    return next(err);
  }
});


/** GET /[code] => detail on company
 *
 * =>  {company: {code, name, descrip, invoices: [id, ...]}}
 *
 * */

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


/** POST / => add new company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */

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


/** PUT /[code] => update company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */

router.put("/:code", async function (req, res, next) {
  try {
    let {name, description} = req.body;
    let code = req.params.code;

    const result = await db.query(
          `UPDATE companies
           SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
        [name, description, code]);

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({"company": result.rows[0]});
    }
  }

  catch (err) {
    return next(err);
  }

});


/** DELETE /[code] => delete company
 *
 * => {status: "added"}
 *
 */

router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const result = await db.query(
          `DELETE FROM companies
           WHERE code=$1
           RETURNING code`,
        [code]);

    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({"status": "deleted"});
    }
  }

  catch (err) {
    return next(err);
  }
});


module.exports = router;