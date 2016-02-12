
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function() {
  var commandOptions;

  commandOptions = require('./command-options');

  exports.list = {
    signature: 'keys',
    description: 'list all ssh keys',
    help: 'Use this command to list all your SSH keys.\n\nExamples:\n\n	$ resin keys',
    permission: 'user',
    action: function(params, options, done) {
      var resin, visuals;
      resin = require('resin-sdk');
      visuals = require('resin-cli-visuals');
      return resin.models.key.getAll().then(function(keys) {
        return console.log(visuals.table.horizontal(keys, ['id', 'title']));
      }).nodeify(done);
    }
  };

  exports.info = {
    signature: 'key <id>',
    description: 'list a single ssh key',
    help: 'Use this command to show information about a single SSH key.\n\nExamples:\n\n	$ resin key 17',
    permission: 'user',
    action: function(params, options, done) {
      var resin, visuals;
      resin = require('resin-sdk');
      visuals = require('resin-cli-visuals');
      return resin.models.key.get(params.id).then(function(key) {
        console.log(visuals.table.vertical(key, ['id', 'title']));
        return console.log('\n' + key.public_key);
      }).nodeify(done);
    }
  };

  exports.remove = {
    signature: 'key rm <id>',
    description: 'remove a ssh key',
    help: 'Use this command to remove a SSH key from resin.io.\n\nNotice this command asks for confirmation interactively.\nYou can avoid this by passing the `--yes` boolean option.\n\nExamples:\n\n	$ resin key rm 17\n	$ resin key rm 17 --yes',
    options: [commandOptions.yes],
    permission: 'user',
    action: function(params, options, done) {
      var patterns, resin;
      resin = require('resin-sdk');
      patterns = require('../utils/patterns');
      return patterns.confirm(options.yes, 'Are you sure you want to delete the key?').then(function() {
        return resin.models.key.remove(params.id);
      }).nodeify(done);
    }
  };

  exports.add = {
    signature: 'key add <name> [path]',
    description: 'add a SSH key to resin.io',
    help: 'Use this command to associate a new SSH key with your account.\n\nIf `path` is omitted, the command will attempt\nto read the SSH key from stdin.\n\nExamples:\n\n	$ resin key add Main ~/.ssh/id_rsa.pub\n	$ cat ~/.ssh/id_rsa.pub | resin key add Main',
    permission: 'user',
    action: function(params, options, done) {
      var Promise, _, capitano, fs, resin;
      _ = require('lodash');
      Promise = require('bluebird');
      fs = Promise.promisifyAll(require('fs'));
      capitano = require('capitano');
      resin = require('resin-sdk');
      return Promise["try"](function() {
        if (params.path != null) {
          return fs.readFileAsync(params.path, {
            encoding: 'utf8'
          });
        }
        return Promise.fromNode(function(callback) {
          return capitano.utils.getStdin(function(data) {
            return callback(null, data);
          });
        });
      }).then(_.partial(resin.models.key.create, params.name)).nodeify(done);
    }
  };

}).call(this);
