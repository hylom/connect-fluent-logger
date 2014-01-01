connect-fluent-logger
====

A Connect middleware to send access log to fluentd.

Usage example
----
    var logger = require('./connect-fluent-logger');
  
    app.configure(function(){
      app.use(logger({tag:"test-app"}));
    }
  

fluentd config example
----
    # output log to file
    <match test-app.access>
      type file
      path /var/log/td-agent/test-app/access.log
      time_slice_format %Y%m%d
      time_slice_wait 10m
      compress gzip
    </match>
