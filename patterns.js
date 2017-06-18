const controllerAsPattern = /public controllerAs: string = '(.*)';/
const controllerMethodsPattern = /(public|private) ([a-zA-Z:{}\s]+)\(.*\)/g
const controllerNamePattern = /public controller: any = (.*);/
const controllerTemplateMethodsPattern = controllerAs =>
  new RegExp(`${controllerAs}.([a-zA-Z]+)\\(.*\\)`, 'g')
const templateUrlPattern = /public templateUrl: string = '(.*)';/
const templateUrlRoot = './app/'

module.exports = {
  controllerAsPattern,
  controllerMethodsPattern,
  controllerTemplateMethodsPattern,
  controllerNamePattern,
  templateUrlPattern,
  templateUrlRoot
}
