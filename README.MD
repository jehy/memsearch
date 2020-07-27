# MemSearch

[![Build Status](https://travis-ci.com/jehy/memsearch.svg?branch=master)](https://travis-ci.com/jehy/memsearch)
[![dependencies Status](https://david-dm.org/jehy/memsearch/status.svg)](https://david-dm.org/jehy/memsearch)
[![devDependencies Status](https://david-dm.org/jehy/memsearch/dev-status.svg)](https://david-dm.org/jehy/memsearch?type=dev)

`memsearch` is a simple CLI tool to find duplicate strings in your memory snapshots.

After you find leaked strings, it is usually really simple to find the leak source.

I recommend taking 3 snapshots ore more for best results.

## Install

```bash
npm i -g memsearch
```

## Usage

```bash
memsearch -h
Usage: memsearch <command> [options]

Commands:
  index.js compare  Compare snapshots and show repeated strings

Options:
  --version      Show version number                                   [boolean]
  -f, --file     output file                                            [string]
  -d, --dir      input directory                             [string] [required]
  -e, --exclude  exclude strings with this substring(s)                  [array]
  --min          minimal string length                    [number] [default: 20]
  --max          maximal string length                   [number] [default: 500]
  -h, --help     Show help                                             [boolean]

Examples:
  memsearch compare -d . -f res.txt  find all dumps in current directory,
                                     process and save output to res.txt

```
