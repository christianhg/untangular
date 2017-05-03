#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const glob = require('glob')
const Maybe = require('folktale/data/maybe')
const program = require('commander')

const log = console.log
const bold = chalk.bold
const error = chalk.red
const success = chalk.green
const warning = chalk.yellow

const controllerAsPattern = /public controllerAs: string = '(.*)';/
const controllerMethodsPattern = /(public|private) ([a-zA-Z:{}\s]+)\(.*\)/g
const controllerTemplateMethodsPattern = controllerAs =>
  new RegExp(`${controllerAs}.([a-zA-Z]+)\\(.*\\)`, 'g')
const controllerNamePattern = /public controller: any = (.*);/
const templateUrlPattern = /public templateUrl: string = '(.*)';/
const templateUrlRoot = './app/'

const findInFile = ({ content }) =>
  regex =>
    findInContent(content)(regex)

const findInContent = content =>
  regex =>
    Maybe.fromNullable(content.match(regex))

const getFileContent = path =>
  fs.readFileSync(path, 'utf-8')

const getTemplateUrl = file =>
  findInFile(file)(templateUrlPattern)
    .map(match => match[1])

const getTemplatePath = templateUrl =>
  `${templateUrlRoot}${templateUrl}`

const getTemplate = file =>
  Maybe.of(getFileContent)
    .ap(getTemplateUrl(file).map(getTemplatePath))

const getControllerAs = file =>
  findInFile(file)(controllerAsPattern)
    .map(match => match[1])

const getControllerName = file =>
  findInFile(file)(controllerNamePattern)
    .map(match => match[1])

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
            controllerAppearances: methods
              .map(method => method.search(templateMethodName))
              .filter(index => index > 0),
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

const pathToFile = path =>
  ({
    path,
    content: getFileContent(path)
  })

const pathsToControllers = paths =>
  paths
    .map(pathToFile)
    .map(file => Maybe.of(fileToController(file))
      .ap(getControllerName(file))
      .ap(getControllerAs(file))
      .ap(getTemplate(file)))

const untangular = pattern => {
  glob(pattern, undefined, (err, paths) => {
    if (err) {
      error(err)
    }

    pathsToControllers(paths)
      .map(controller => ({
        controller,
        templateMethodControllerAppearances: Maybe.of(getTemplateMethodControllerAppearances)
          .ap(controller)
          .ap(controller.chain(getControllerMethods))
          .ap(controller.chain(getControllerTemplateMethods))
      }))
      .map(({ controller, templateMethodControllerAppearances }) => ({
        controller: controller.getOrElse(undefined),
        templateMethodControllerAppearances: templateMethodControllerAppearances.getOrElse(undefined)
      }))
      .filter(({ controller, templateMethodControllerAppearances }) =>
        controller !== undefined && templateMethodControllerAppearances !== undefined)
      .map(({ controller, templateMethodControllerAppearances }) => ({
        controller,
        templateMethodControllerAppearances: {
          found: templateMethodControllerAppearances
            .filter(({ controllerAppearances }) => controllerAppearances.length > 0)
            .map(({ templateMethodName }) =>
              success(`${bold(`${controller.controllerAs}.${templateMethodName}()`)} is found in controller`)),
          notFound: templateMethodControllerAppearances
            .filter(({ controllerAppearances }) => controllerAppearances.length < 1)
            .map(({ templateMethodName }) =>
              warning(`${bold(`${controller.controllerAs}.${templateMethodName}()`)} is not found in controller`))
        }
      }))
      .filter(({ templateMethodControllerAppearances }) => templateMethodControllerAppearances.notFound.length > 0)
      .forEach(({ controller, templateMethodControllerAppearances }) => {
        log(`${bold(controller.name)} (${controller.path})`)

        templateMethodControllerAppearances.notFound
          .forEach(warning => log(`- ${warning}`))
        log()
      })
  })
}

program
  .arguments('<pattern>')
  .action(untangular)
  .parse(process.argv)
