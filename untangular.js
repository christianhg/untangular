const Maybe = require('folktale/data/maybe')
const glob = require('glob')
const { compose, path, prop } = require('ramda')

const { empty, notEmpty } = require('./array')
const { bold, error, log, success, warning } = require('./logger')
const {
  getControllerMethods,
  getControllerTemplateMethods,
  getTemplateMethodControllerAppearances,
  pathsToControllers
} = require('./ng')

const untangular = pattern =>
  glob(pattern, undefined, (err, paths) => {
    if (err) {
      log(error(err))
    }

    pathsToControllers(paths)
      .map(controller => ({
        controller,
        templateMethodAppearances: Maybe.of(getTemplateMethodControllerAppearances)
          .ap(controller)
          .ap(controller.chain(getControllerMethods))
          .ap(controller.chain(getControllerTemplateMethods))
      }))
      .map(({ controller, templateMethodAppearances }) => ({
        controller: controller.getOrElse(undefined),
        templateMethodAppearances: templateMethodAppearances.getOrElse(undefined)
      }))
      .filter(({ controller, templateMethodAppearances }) =>
        controller !== undefined && templateMethodAppearances !== undefined)
      .map(({ controller, templateMethodAppearances }) => ({
        controller,
        templateMethodAppearances: {
          found: templateMethodAppearances.filter(compose(notEmpty, prop('appearances'))),
          notFound: templateMethodAppearances.filter(compose(empty, prop('appearances')))
        }
      }))
      .map(({ controller, templateMethodAppearances }) => ({
        controller,
        templateMethodAppearances: {
          found: templateMethodAppearances.found
            .map(({ templateMethodName }) =>
              success(`${bold(`${controller.controllerAs}.${templateMethodName}()`)} is found in controller`)),
          notFound: templateMethodAppearances.notFound
            .map(({ templateMethodName }) =>
              warning(`${bold(`${controller.controllerAs}.${templateMethodName}()`)} is not found in controller`))
        }
      }))
      .filter(compose(notEmpty, path(['templateMethodAppearances', 'notFound'])))
      .forEach(({ controller, templateMethodAppearances }) => {
        log(`${bold(controller.name)} (${controller.path})`)

        templateMethodAppearances
          .notFound
          .forEach(warning => log(`- ${warning}`))
        log()
      })
  })

module.exports = untangular
