/*!
 * logger middleware to send logs to fluentd
 *
 */

var logger = require('fluent-logger');

exports = module.exports = function fluentLogger(options) {
  if ('object' == typeof options) {
    options = options || {};
  } else {
    options = {};
  }

  // output on request instead of response
  var immediate = options.immediate;
  options.tag = options.tag || 'nodeweblog';
  options.host = options.host || 'localhost';
  options.port = options.port || 24224;
  logger.configure(options.tag, options);

  return function fluentLogger(req, res, next) {
    function logRequest() {
      res.removeListener('finish', logRequest);
      res.removeListener('close', logRequest);
      var record = {};
      var remoteHost = '';

      // get remote-host
      if (req.ip) {
        remoteHost = req.ip;
      } else if (req._host) {
        remoteHost = req._remoteAddress;
      } else {
        var sock = req.socket;
        if (sock.socket) {
          remoteHost = sock.socket.remoteAddress;
        } else {
          remoteHost = sock.remoteAddress;
        }
      }

      record.host = remoteHost;
      record.user = '';
      record.time = new Date().toUTCString();
      record.method = req.method;
      record.path = req.originalUrl || req.url;
      record.httpVersion = req.httpVersionMajor + '.' + req.httpVersionMinor;
      record.code = res.headerSent ? res.statusCode : null;
      record.size = (res._headers || {})["content-length"];
      record.referer = req.headers['referer'] || req.headers['referrer'];
      record.agent = req.headers['user-agent'];

      try {
        logger.emit('access', record);
      } catch (e) {
        process.stderr.write('error occuerd in fluent-logger' + util.inspect(e) + '\n');
      }
    };
    
    if (immediate) {
      logRequest();
    } else {
      res.on('finish', logRequest);
      res.on('close', logRequest);
    }

    next();
  };
}

