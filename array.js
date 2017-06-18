// empty :: [a] -> Boolean
const empty = xs => xs.length === 0

// notEmpty :: [a] -> Boolean
const notEmpty = xs => xs.length > 0

module.exports = {
  empty,
  notEmpty
}
