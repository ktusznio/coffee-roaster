(function() {
  var compileFile, directoryPollingInterval, exec, fs, path, processDir, regex, watchFile, watchInterval, watchedFiles;
  exec = require('child_process').exec;
  fs = require('fs');
  path = require('path');
  watchedFiles = {};
  watchInterval = 500;
  directoryPollingInterval = 2500;
  regex = /^\s*#\s*@compileTo\s+(.*)$/m;
  compileFile = function(file) {
    return fs.readFile(file, function(err, data) {
      var regexResult, source;
      if (err) {
        throw err;
      }
      source = data.toString();
      if (regexResult = regex.exec(source)) {
        return exec("coffee -p -c " + file, function(err, js, stderr) {
          var match, outputPath, relativePath;
          if (err) {
            throw err;
          }
          if (stderr) {
            console.error(stderr);
          }
          relativePath = path.dirname(file);
          match = regexResult[0], outputPath = regexResult[1];
          outputPath = path.resolve(relativePath, outputPath);
          return fs.writeFile(outputPath, js, function(err) {
            if (err) {
              throw err;
            }
            return console.log("Compiled " + file + " to " + outputPath);
          });
        });
      }
    });
  };
  watchFile = function(file) {
    if (watchedFiles[file]) {
      return;
    }
    watchedFiles[file] = true;
    compileFile(file);
    console.log("Watching for changes to " + file);
    return fs.watchFile(file, {
      persistent: true,
      interval: watchInterval
    }, function(curr, prev) {
      if (curr.size === prev.size && curr.mtime.getTime() === prev.mtime.getTime()) {
        return;
      }
      return compileFile(file);
    });
  };
  processDir = function(dir) {
    return exec("find " + dir + " -name '*.coffee' -print", function(err, findResult, findErrs) {
      if (err) {
        throw err;
      }
      if (findErrs) {
        console.log(findErrs);
      }
      findResult.trim().split("\n").forEach(function(line) {
        return watchFile(line);
      });
      return setTimeout((function() {
        return processDir(dir);
      }), directoryPollingInterval);
    });
  };
  exports.run = function() {
    var inputs;
    inputs = process.argv.slice(2);
    return inputs.forEach(function(input) {
      return fs.stat(input, function(err, stats) {
        if (stats.isDirectory()) {
          return processDir(input);
        } else if (stats.isFile()) {
          return watchFile(input);
        }
      });
    });
  };
}).call(this);
