const chalk = require('chalk')

const log = console.log
const bold = chalk.bold
const error = chalk.red
const success = chalk.green
const warning = chalk.yellow

const logger = {
  log,
  bold,
  error,
  success,
  warning
}

module.exports = logger
