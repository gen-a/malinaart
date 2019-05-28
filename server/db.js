const config = require('./config');
const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

exports.connect = () => mongoose.connect( config.get('db.mongo.url'), { useNewUrlParser: true, promiseLibrary: true } );
exports.disconnect = () => mongoose.connection.close();