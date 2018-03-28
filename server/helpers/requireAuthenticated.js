export default function requireAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }
  next();
}
