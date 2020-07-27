#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const {argv} = require('yargs')
  .usage('Usage: memsearch <command> [options]')
  .command('compare', 'Compare snapshots and show repeated strings')
  .example('memsearch compare -d . -f res.txt', 'find all dumps in current directory, process and save output to res.txt')
  .option('f', {
    alias: 'file',
    describe: 'output file',
    nargs: 1,
    type: 'string',
  })
  .option('d', {
    alias: 'dir',
    describe: 'input directory',
    type: 'string',
    demandOption: true,
    nargs: 1,
  })
  .option('e', {
    alias: 'exclude',
    describe: 'exclude strings with this substring(s)',
    type: 'array',
  })
  .option('min', {
    describe: 'minimal string length',
    default: 20,
    type: 'number',
  })
  .option('max', {
    describe: 'maximal string length',
    default: 500,
    type: 'number',
  })
  .demandOption(['d'])
  .help('h')
  .alias('h', 'help');

function isBadStr(str) {
  const tst = (str.toString().trim());
  return tst.length < argv.min
        || tst.length > argv.max
        || tst.includes('use strict')
        || tst.includes('function')
        || tst.startsWith('application')
        || tst.startsWith('get ')
        || tst.startsWith('system ')
        || tst.startsWith('../')
        || tst.startsWith('./')
        || tst.startsWith('module.exports')
        || tst.startsWith('(')
        || tst.includes('WeakMap')
        || argv.exclude && argv.exclude.length && argv.exclude.some(exc => tst.includes(exc));
}

function getAllKeys() {
  const keys = {};
  let snapShotsNumber = 0;

  const inputDir = fs.existsSync(argv.dir) && argv.dir || path.join(__dirname, argv.dir);
  if (!fs.existsSync(inputDir)) {
    console.log(`Error: Input dir ${inputDir} does not exist`);
    process.exit(1);
  }
  fs.readdirSync(inputDir).forEach(file => {
    if (!file.includes('.heapsnapshot')) {
      return;
    }
    snapShotsNumber++;
    console.log(`reading ${file}`);
    const data = fs.readFileSync(path.join(inputDir, '/', file));
    console.log('read');
    const {strings} = JSON.parse(data);
    console.log('parsed');
    let count = 0;
    strings.forEach(str => {
      if (isBadStr(str)) {
        return;
      }
      if (!keys[str]) {
        keys[str] = 1;
        count++;
      } else {
        keys[str]++;
      }
    });
    console.log(`added ${count} new strings`);
  });
  console.log(`Read ${snapShotsNumber} snapshots\n\n`);
  return {keys, snapShotsNumber};
}
const {keys, snapShotsNumber} = getAllKeys();

if (snapShotsNumber === 1) {
  console.log('Error: Only one snapshot found, what should I compare?!');
  process.exit(1);
}
const minCount = snapShotsNumber === 2 ? 2 : Math.round(snapShotsNumber / 2);
const maxCount = snapShotsNumber === 2 ? false : snapShotsNumber;

console.log(`Searching for strings with >= ${minCount} entries`);
if (maxCount) {
  console.log(`excluding strings with number of entries equal to snapshots count: ${maxCount}`);
}

const manyKeys = Object.entries(keys).reduce((res, [key, count]) => {
  if (count >= minCount && (maxCount === false || count !== maxCount)) {
    res[key] = count;
  }
  return res;
}, {});

const sortedKeys = Object.entries(manyKeys)
  .sort(([key1, count1], [key2, count2]) => {
    if (count1 !== count2) {
      return count2 - count1;
    }
    return key1 - key2;
  })
  .map(val => val[0]);

if (!sortedKeys.length) {
  console.log('No common strings found :(');
} else {
  console.log(`Found ${sortedKeys.length} common strings`);
}

const data = sortedKeys.map(key => `${key}: ${manyKeys[key]}`).join('\n');

if (argv.file) {
  fs.writeFileSync(argv.file, data, 'utf8');
  console.log(`Report written to ${argv.file}`);
} else {
  console.log(data);
}
