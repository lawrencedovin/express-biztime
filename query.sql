SELECT c.name, i.industry
    FROM companies AS c
        LEFT JOIN companies_industries AS ci
            ON c.code = ci.comp_code
        LEFT JOIN industries as i
            ON ci.industry_code = i.code
    WHERE c.code = 'apple';