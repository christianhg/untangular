const Maybe = require('folktale/data/maybe')

const { findInContent, findInFile, getFileContent, pathToFile } = require('./files')
const {
  controllerAsPattern,
  controllerMethodsPattern,
  controllerNamePattern,
  controllerTemplateMethodsPattern,
  templateUrlPattern,
  templateUrlRoot
} = require('./patterns')

// gtZero :: Number -> Boolean
const gtZero = x => x > 0

const searchString = regex => s => s.search(regex)

const getControllerAs = file =>
  findInFile(file)(controllerAsPattern)
    .map(match => match[1])

const getControllerName = file =>
  findInFile(file)(controllerNamePattern)
    .map(match => match[1])

const getTemplateUrl = file =>
  findInFile(file)(templateUrlPattern)
    .map(match => match[1])

const getTemplatePath = templateUrl =>
  `${templateUrlRoot}${templateUrl}`

const getTemplate = file =>
  Maybe.of(getFileContent)
    .ap(getTemplateUrl(file).map(getTemplatePath))

const getControllerTemplateMethods = ({ controllerAs, template }) =>
  findInContent(template)(controllerTemplateMethodsPattern(controllerAs))

const getControllerMethods = ({ content }) =>
  findInContent(content)(controllerMethodsPattern)

const getTemplateMethodName = controllerAs =>
  templateMethod =>
    templateMethod
      .replace(`${controllerAs}.`, '')
      .replace(/\(.*\)/, '')

const getTemplateMethodControllerAppearances = ({ controllerAs }) =>
  methods =>
    templateMethods =>
      templateMethods
        .map(getTemplateMethodName(controllerAs))
        .map(templateMethodName =>
          ({
            appearances: methods
              .map(searchString(templateMethodName))
              .filter(gtZero),
            templateMethodName
          }))

const fileToController = ({ content, path }) =>
  name =>
    controllerAs =>
      template =>
        ({
          path,
          content,
          name,
          controllerAs,
          template
        })

const pathsToControllers = paths =>
  paths
    .map(pathToFile)
    .map(file => Maybe.of(fileToController(file))
      .ap(getControllerName(file))
      .ap(getControllerAs(file))
      .ap(getTemplate(file)))

module.exports = {
  getControllerMethods,
  getControllerTemplateMethods,
  getTemplateMethodControllerAppearances,
  pathsToControllers
}
