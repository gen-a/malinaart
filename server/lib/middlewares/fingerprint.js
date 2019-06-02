const Fingerprint = require('express-fingerprint');

module.exports = ()=> Fingerprint({
  parameters:[
    // Defaults
    Fingerprint.useragent,
    Fingerprint.acceptHeaders,
    Fingerprint.geoip,
    // Additional parameters
    function(next) {
      // ...do something...
      next(null,{
        'param1':'value1'
      })
    },
    function(next) {
      // ...do something...
      next(null,{
        'param2':'value2'
      })
    },
  ]
});

