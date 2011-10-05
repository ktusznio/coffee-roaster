exec = require('child_process').exec
fs = require 'fs'
path = require 'path'

watchedFiles = {}
watchInterval = 500
directoryPollingInterval = 2500

regex = /^\s*#\s*@compileTo\s+(.*)$/m

# Compile file to its compileTo location
compileFile = (file) ->
  fs.readFile file, (err, data) ->
    throw err if err

    source = data.toString()
    if regexResult = regex.exec source
      exec "coffee -p -c #{file}", (err, js, stderr) ->
        throw err if err
        console.error stderr if stderr

        relativePath = path.dirname file
        [match, outputPath] = regexResult
        outputPath = path.resolve relativePath, outputPath

        fs.writeFile outputPath, js, (err) ->
          throw err if err
          console.log "Compiled #{file} to #{outputPath}"

# Watch file and compile when it changes
watchFile = (file) ->
  return if watchedFiles[file]
  watchedFiles[file] = true

  # Compile immediately the first time
  compileFile file

  console.log "Watching for changes to #{file}"
  fs.watchFile file, {persistent:true, interval:watchInterval}, (curr, prev) ->
    return if curr.size is prev.size and
      curr.mtime.getTime() is prev.mtime.getTime()
    compileFile file

# Find and watch .coffee files in dir
processDir = (dir) ->
  exec "find #{dir} -name '*.coffee' -print", (err, findResult, findErrs) ->
    throw err if err
    console.log findErrs if findErrs
    findResult.trim().split("\n").forEach (line) ->
      watchFile line
    setTimeout (-> processDir dir), directoryPollingInterval

# Examine inputs and either process a directory or watch a file.
exports.run = ->
  inputs = process.argv.slice 2
  inputs.forEach (input) ->
    fs.stat input, (err, stats) ->
      if stats.isDirectory()
        processDir input
      else if stats.isFile()
        watchFile input
