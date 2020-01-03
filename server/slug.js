const md5 = require("md5");
module.exports = (req, res, next) => {
  const slug = md5(`${JSON.stringify(req.options)}`)
  req.slug = slug
  next()
}