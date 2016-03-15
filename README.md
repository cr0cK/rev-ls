# rev-ls

Revved a list of files outputed by a `ls` or `find`.

## Installation

`npm i -g rev-ls`

## How to use

Examples:

```
$ ls *.png |rev-ls -r ./manifest.json
$ find ./dist -type f -regextype posix-extended -regex ".*\.(png|svg)" |rev-ls -r ./dist/manifest.json
```
