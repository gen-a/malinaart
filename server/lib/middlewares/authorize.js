const { response } = require('../response/response');
const jwt = require('../jwt/index');

/**
 *
 * @param roles {Array}
 */
module.exports = (roles = []) => (req, res, next) => {
  const user = jwt.extract(req.headers['authorization']);


  if( user!== null ){
    if(roles.length === 0 || roles.includes(user.role) ){
      req.user = user;
      return next();
    }
    res.status(403).json(response({}, 'youDoNotHaveEnoughPrivilege', 1));
    return null;
  }
  res.status(401).json(response({}, 'youHaveNotLoggedIn', 1));
  return null;

};