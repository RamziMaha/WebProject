function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.message);
      res.status(400).json({ error: 'Invalid payload', details: issues });
      return;
    }
    req.body = result.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.message);
      res.status(400).json({ error: 'Invalid query', details: issues });
      return;
    }
    req.query = result.data;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery
};
