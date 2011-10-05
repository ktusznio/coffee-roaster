# coffee-roaster

Watches a directory or file for .coffee files with "#@compileTo outputFile" directives, and compiles those files when they change. 

This tool is meant for small projects that don't want to deal with Cakefiles and/or muffin.

Works on nested directories, single files, and for multiple inputs. Detects new files as they are created.

## Installation

npm install coffee-roaster

## Examples

Single file: coffee-roaster examples/sample.coffee

Directory: coffee-roaster examples/

Multiple inputs: coffee-roaster examples somewhereElse some/file.coffee

## TODO

- Tests
- Loosen up @compileTo; right now it expects strictly "#@compileTo <ouputFile>".
