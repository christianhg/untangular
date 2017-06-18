#!/usr/bin/env node

const program = require('commander')

const untangular = require('./untangular')

program
  .arguments('<pattern>')
  .action(untangular)
  .parse(process.argv)
