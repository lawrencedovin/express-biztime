SELECT c.name, i.industry
    FROM companies AS c
        LEFT JOIN companies_industries AS ci
            ON c.code = ci.comp_code
        LEFT JOIN industries as i
            ON ci.industry_code = i.code
    WHERE c.code = 'apple';

SELECT i.code, i.industry, c.name
    FROM industries AS i
        LEFT JOIN companies_industries AS ci
            ON i.code = ci.industry_code
        LEFT JOIN companies as c
            ON ci.comp_code = c.code
    WHERE i.code = 'sw';