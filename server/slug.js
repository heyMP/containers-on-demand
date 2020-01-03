const md5 = require("md5");
module.exports = (req, res, next) => {
  const slug = md5(`${JSON.stringify(req.query)}`)
  req.slug = slug
  next()
}