module.exports = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
// module.exports = (checkRole) => (req, res, next) => {
//   !roles.includes(req.user.role)
//     ? res.status(401).json("Unauthorized")
//     : next();
// };
