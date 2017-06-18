const fs = require('fs')
const Maybe = require('folktale/data/maybe')

const findInContent = content =>
  regex =>
    Maybe.fromNullable(content.match(regex))

const findInFile = ({ content }) =>
  regex =>
    findInContent(content)(regex)

const getFileContent = path =>
  fs.readFileSync(path, 'utf-8')

const pathToFile = path =>
  ({
    path,
    content: getFileContent(path)
  })

module.exports = {
  findInContent,
  findInFile,
  getFileContent,
  pathToFile
}
