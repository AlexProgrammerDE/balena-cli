(function() {
  var Mixpanel, Promise, _, packageJSON, resin;

  _ = require('lodash');

  Mixpanel = require('mixpanel');

  Promise = require('bluebird');

  resin = require('resin-sdk');

  packageJSON = require('../package.json');

  exports.getLoggerInstance = _.memoize(function() {
    return resin.models.config.getMixpanelToken().then(Mixpanel.init);
  });

  exports.trackCommand = function(capitanoCommand) {
    return Promise.props({
      resinUrl: resin.settings.get('resinUrl'),
      username: resin.auth.whoami(),
      mixpanel: exports.getLoggerInstance()
    }).then(function(data) {
      return data.mixpanel.track("[CLI] " + capitanoCommand.command, {
        distinct_id: data.username,
        argv: process.argv.join(' '),
        version: packageJSON.version,
        node: process.version,
        arch: process.arch,
        resinUrl: data.resinUrl,
        platform: process.platform,
        command: capitanoCommand
      });
    });
  };

}).call(this);
