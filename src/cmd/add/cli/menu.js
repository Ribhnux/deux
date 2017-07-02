const path = require('path')
const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const jsonar = require('jsonar')
const rimraf = require('rimraf')

const {wpThemeDir} = global.const.require('path')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const compileFile = global.helpers.require('compiler/single')
const {colorlog, done, error} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')

module.exports = db => {
  colorlog('Register {New Menu}')

  const prompts = [
    {
      name: 'menu.location',
      message: 'Menu Location',
      default: 'primary',
      validate: value => validator(value, {slug: true, slugPattern: '[a-z0-9_]+', var: 'Menu Location'}),
      filter: value => slugify(value)
    },

    {
      name: 'menu.description',
      message: 'Menu Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'menu.walker',
      message: 'Require Menu Navigation Walker?',
      default: false
    },

    {
      type: 'confirm',
      name: 'menu.overwrite',
      message: 'Menu already exists. Continue to overwrite?',
      default: true,
      when: ({menu}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.menus[menu.location] !== undefined)
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({menu}) => {
    getCurrentTheme(db).then(theme => {
      if (menu.overwrite === false) {
        error({
          message: message.ERROR_MENU_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      const themePath = path.join(wpThemeDir, theme.details.slug)
      const libPath = path.join(themePath, 'includes', 'libraries')
      const navWalkerFile = path.join(global.templates.path, '_partials', 'nav-walker.php')
      const slugCapital = slugify(menu.location).split('-').map(item => capitalize(item))
      const niceName = slugCapital.join(' ')
      const className = slugCapital.join('_')

      const walker = {
        name: `${niceName} Nav Walker`,
        file: `class-${slugify(menu.location)}-menu-nav-walker`,
        description: `${niceName} Menu Navigation Walker Class`,
        className: `${className}_Nav_Walker`
      }

      const navWalkerPath = path.join(libPath, `${walker.file}.php`)
      if (menu.walker) {
        compileFile({
          srcPath: navWalkerFile,
          dstPath: navWalkerPath,
          syntax: {
            theme: theme.details,
            walker
          }
        })
        theme.libraries = theme.libraries.concat(walker.file)
      } else {
        theme.libraries = theme.libraries.filter(item => item !== walker.file)
        rimraf.sync(navWalkerPath)
      }

      theme.menus[menu.location] = jsonar.literal(`__( '${menu.description}', '${theme.details.slug}' )`)

      saveConfig(db, {
        menus: theme.menus,
        libraries: theme.libraries.filter(item => item)
      }).then(() => {
        done({
          message: message.SUCCEED_MENU_ADDED,
          padding: true,
          exit: true
        })
      })
    })
  })
}