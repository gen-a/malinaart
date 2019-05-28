const { response } = require('../lib/response/response');
const User = require('../models/user');
const mongoose = require('mongoose');
const {handleErrors} = require('../lib/response/mongoose-error-to-response');

/**
 * Add user to collection
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.add = (req, res, next) => {
  const { email, password } = req.body;
  const newUser = new User({ email, password, _id: new mongoose.Types.ObjectId() });

  newUser.save()
    .then((result)=>{
      res.status(200).json(response(result, 'user.info.addedSuccessfully', 0));
      next();
    })
    .catch((err)=>{
      handleErrors(err, res, next, {email_1: 'email'});
    });

};
