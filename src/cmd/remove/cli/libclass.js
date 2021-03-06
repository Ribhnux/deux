const {existsSync} = require('fs')
const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveLibClass extends CLI {
  constructor(options) {
    super()
    this.themeLibraries = undefined
    this.init(options)
  }

  /**
   * Setup remove libclass rompts
   */
  prepare() {
    this.themeLibraries = this.themeInfo('libraries')

    if (this.themeLibraries.length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Libraries}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'lib',
        message: 'Select libraries you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all(this.themeLibraries.map(
            value => new Promise((resolve, reject) => {
              const libPath = this.currentThemePath('includes', 'libraries', `${value}.php`)
              if (existsSync(libPath)) {
                wpFileHeader(libPath).then(info => {
                  let resolver = {}

                  if (info.className) {
                    resolver = {
                      name: info.className,
                      value
                    }
                  }

                  resolve(resolver)
                }).catch(reject)
              } else {
                resolve({})
              }
            })
          )).then(libraries => {
            libraries = libraries.filter(item => item.value)

            if (libraries.length > 0) {
              libraries = separatorMaker('Library List').concat(libraries)
            } else {
              reject()
            }

            resolve(libraries)
          }).catch(reject)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({lib}) => lib.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({lib, captcha}) => lib.length > 0 && captcha,
        default: false,
        message: () => 'Removing libraries from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  action({lib, confirm}) {
    if (lib.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(lib.map(
      item => new Promise(resolve => {
        const libPath = this.currentThemePath('includes', 'libraries', `${item}.php`)
        if (existsSync(libPath)) {
          rimraf.sync(libPath)
        }
        resolve(item)
      })
    )).then(libraries => {
      this.themeLibraries = this.themeLibraries.filter(item => !libraries.includes(item))
      this.setThemeConfig({
        libraries: this.themeLibraries
      })
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_LIBCLASS)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveLibClass
