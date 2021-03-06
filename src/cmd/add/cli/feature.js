const url = require('url')
const inquirer = require('inquirer')
const slugify = require('node-slugify')
const rimraf = require('rimraf')
const jsonar = require('jsonar')
const uniq = require('lodash.uniq')
const mkdirp = require('mkdirp')
const {
  featureTypes,
  featureLabels,
  html5markup,
  postFormats,
  postTypes,
  positionTypes,
  bgPresetTypes,
  bgPresetLabels,
  bgSizeTypes,
  bgRepeatTypes,
  bgAttachmentTypes
} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddFeature extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup add feature prompts
   */
  prepare() {
    this.$title = 'Add {Theme Features}'
    this.$prompts = [
      {
        type: 'list',
        name: 'feature.type',
        message: 'Choose Feature',
        validate: value => validator(value, {minimum: 1, array: true, var: 'Feature'}),
        choices: () => new Promise(resolve => {
          const list = []
          for (const type in featureTypes) {
            if (Object.prototype.hasOwnProperty.call(featureTypes, type)) {
              list.push({
                value: featureTypes[type],
                name: featureLabels[type]
              })
            }
          }

          resolve(list)
        })
      },

      {
        type: 'checkbox',
        name: 'feature.options',
        message: 'Pick Supported Theme Markup',
        when: ({feature}) => feature.type === featureTypes.HTML5,
        validate: value => validator(value, {minimum: 2, array: true, var: 'Options'}),
        choices: [new inquirer.Separator()].concat(html5markup)
      },

      {
        type: 'checkbox',
        name: 'feature.options',
        message: 'Pick Supported Post Formats',
        when: ({feature}) => feature.type === featureTypes.POST_FORMATS,
        validate: value => validator(value, {minimum: 1, array: true, var: 'Options'}),
        choices: [new inquirer.Separator()].concat(postFormats)
      },

      {
        type: 'confirm',
        name: 'feature.posttype',
        message: 'Support all Post Types?',
        default: true,
        when: ({feature}) => feature.type === featureTypes.POST_THUMBNAILS
      },

      {
        type: 'list',
        name: 'feature.options',
        message: 'Post Type',
        when: ({feature}) => !feature.posttype && feature.type === featureTypes.POST_THUMBNAILS,
        choices: [
          {
            value: postTypes.POST,
            name: 'Post'
          },
          {
            value: postTypes.PAGE,
            name: 'Page'
          },
          new inquirer.Separator(),
          {
            value: postTypes.CUSTOM,
            name: 'Other (specify)'
          }
        ]
      },

      {
        name: 'feature.options',
        message: 'Custom Post Type',
        default: postTypes.POST,
        when: ({feature}) => !feature.posttype && feature.type === featureTypes.POST_THUMBNAILS && feature.options === postTypes.CUSTOM,
        validate: value => validator(value, {minimum: 2, var: `"${value}"`}),
        filter: value => value.split(',').map(item => slugify(item.trim().toLowerCase()))
      },

      // Custom background options
      {
        name: 'feature.options.imageUrl',
        message: 'Background image URL',
        when: ({feature}) => feature.type === featureTypes.CUSTOM_BACKGROUND
      },

      {
        name: 'feature.options.color',
        message: 'Background color',
        when: ({feature}) => feature.type === featureTypes.CUSTOM_BACKGROUND,
        validate: value => validator(value, {color: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'feature.advanced',
        message: 'Set advanced settings?',
        default: true,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_BACKGROUND
      },

      {
        type: 'list',
        name: 'feature.options.preset',
        message: 'Background preset',
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_BACKGROUND,
        choices: () => new Promise(resolve => {
          const list = []
          for (const type in bgPresetTypes) {
            if (Object.prototype.hasOwnProperty.call(bgPresetTypes, type)) {
              list.push({
                value: bgPresetTypes[type],
                name: bgPresetLabels[type]
              })
            }
          }

          resolve(list)
        })
      },

      {
        type: 'list',
        name: 'feature.options.position',
        message: 'Image position',
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_BACKGROUND && feature.options.preset !== bgPresetTypes.DEFAULT,
        choices: [
          new inquirer.Separator(),

          {
            name: 'Top Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Top Center',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Top Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Center Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Center Middle',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Center Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Bottom Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.BOTTOM
            }
          },

          {
            name: 'Bottom Center',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.BOTTOM
            }
          },

          {
            name: 'Bottom Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.BOTTOM
            }
          }
        ]
      },

      {
        type: 'list',
        name: 'feature.options.imageSize',
        message: 'Image size',
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_BACKGROUND && feature.options.preset === bgPresetTypes.CUSTOM,
        choices: [
          {
            value: bgSizeTypes.AUTO,
            name: 'Original'
          },

          {
            value: bgSizeTypes.CONTAIN,
            name: 'Fit to Screen'
          },

          {
            value: bgSizeTypes.COVER,
            name: 'Fill Screen'
          }
        ]
      },

      {
        type: 'confirm',
        name: 'feature.options.repeat',
        message: 'Repeat background image?',
        when: ({feature}) => {
          return feature.advanced &&
            feature.type === featureTypes.CUSTOM_BACKGROUND &&
            feature.options.preset !== bgPresetTypes.DEFAULT &&
            feature.options.preset !== bgPresetTypes.FILL &&
            feature.options.preset !== bgPresetTypes.REPEAT
        }
      },

      {
        type: 'list',
        name: 'feature.options.attachment',
        message: 'Background attachment',
        when: ({feature}) => {
          return feature.advanced &&
            feature.type === featureTypes.CUSTOM_BACKGROUND &&
            feature.options.preset !== bgPresetTypes.DEFAULT &&
            feature.options.preset !== bgPresetTypes.FILL &&
            feature.options.preset !== bgPresetTypes.FIT
        },
        choices: [
          {
            value: bgAttachmentTypes.SCROLL,
            name: 'Scroll with Page'
          },

          {
            value: bgAttachmentTypes.FIXED,
            name: 'Fixed Background'
          }
        ]
      },

      // Custom header options
      {
        name: 'feature.options.imageUrl',
        message: 'Header image URL',
        when: ({feature}) => feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        name: 'feature.options.width',
        message: 'Image width in px',
        default: 2000,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_HEADER,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        name: 'feature.options.height',
        message: 'Image height in px',
        default: 1200,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_HEADER,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        type: 'confirm',
        name: 'feature.advanced',
        message: 'Set advanced settings?',
        default: true,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        type: 'confirm',
        name: 'feature.options.flexWidth',
        message: 'Allow flexible width?',
        default: true,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        type: 'confirm',
        name: 'feature.options.flexHeight',
        message: 'Allow flexible height?',
        default: true,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        type: 'confirm',
        name: 'feature.options.random',
        message: 'Allow random image rotation?',
        default: false,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        type: 'confirm',
        name: 'feature.options.headerText',
        message: 'Display default header text?',
        default: false,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        name: 'feature.options.textColor',
        message: 'Header text color?',
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER && feature.options.headerText,
        validate: value => validator(value, {color: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'feature.options.video',
        message: 'Suppot custom video?',
        default: true,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER
      },

      {
        type: 'confirm',
        name: 'feature.options.videoAlwaysActive',
        message: 'Is video always active?',
        default: true,
        when: ({feature}) => feature.advanced && feature.type === featureTypes.CUSTOM_HEADER && feature.options.video
      },

      // Custom logo options
      {
        name: 'feature.options.width',
        message: 'Logo width in px',
        default: 250,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_LOGO,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        name: 'feature.options.height',
        message: 'Logo height in px',
        default: 250,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_LOGO,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        type: 'confirm',
        name: 'feature.options.flexWidth',
        message: 'Allow flexible width?',
        default: true,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_LOGO
      },

      {
        type: 'confirm',
        name: 'feature.options.flexHeight',
        message: 'Allow flexible height?',
        default: true,
        when: ({feature}) => feature.type === featureTypes.CUSTOM_LOGO
      },

      // WordPress wp_head callback for custom background and custom header
      {
        type: 'confirm',
        name: 'feature.options.wpHeadCallback',
        message: 'Custom output in `wp_head`?',
        default: false,
        when: ({feature}) => feature.advanced && (feature.type === featureTypes.CUSTOM_BACKGROUND || feature.type === featureTypes.CUSTOM_HEADER)
      },

      {
        type: 'confirm',
        name: 'overwrite',
        message: ({feature}) => {
          for (const type in featureTypes) {
            if (Object.prototype.hasOwnProperty.call(featureTypes, type) && featureTypes[type] === feature.type) {
              return `${featureLabels[type]} already used as feature. Continue to overwrite?`
            }
          }
        },
        default: true,
        when: ({feature}) => new Promise(resolve => {
          resolve(this.themeInfo('features')[feature.type] !== undefined)
        })
      }
    ]
  }

  /**
   * Compile features file and config
   *
   * @param {Object} {feature}
   */
  action({feature, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_FEATURE_ALREADY_EXISTS)
    }

    let {options: featureOptions} = feature
    const theme = this.themeInfo()

    const initHelper = (checker, options, key, helper) => {
      const callbackPath = this.currentThemePath('includes', 'helpers', `${helper.file}.php`)
      if (checker) {
        options[key] = `${theme.$details.slugfn}_${helper.slugfn}`
        compileFile({
          srcPath: this.templateSourcePath('_partials', 'helper.php'),
          dstPath: callbackPath,
          syntax: {
            theme: theme.$details,
            helper
          }
        })
        theme.helpers = theme.helpers.concat(helper.file)
      } else {
        theme.helpers = theme.helpers.filter(item => item !== helper.file)
        rimraf.sync(callbackPath)
      }
    }

    if (!feature.options) {
      featureOptions = true
    }

    Promise.all([
      new Promise(resolve => {
        if (feature.type === featureTypes.CUSTOM_BACKGROUND) {
          feature.options = Object.assign({
            preset: bgPresetTypes.DEFAULT,
            repeat: bgRepeatTypes.REPEAT,
            attachment: bgAttachmentTypes.SCROLL,
            imageSize: bgSizeTypes.AUTO,
            imageUrl: '',
            color: '#ffffff',
            position: {
              x: positionTypes.LEFT,
              y: positionTypes.TOP
            }
          }, feature.options)

          switch (feature.options.preset) {
            case bgPresetTypes.FILL:
              feature.options.repeat = bgRepeatTypes.NO_REPEAT
              feature.options.attachment = bgAttachmentTypes.FIXED
              feature.options.imageSize = bgSizeTypes.COVER
              break

            case bgPresetTypes.FIT:
              feature.options.attachment = bgAttachmentTypes.FIXED
              feature.options.imageSize = bgSizeTypes.CONTAIN
              break

            case bgPresetTypes.REPEAT:
              feature.options.repeat = bgRepeatTypes.REPEAT
              feature.options.imageSize = bgSizeTypes.AUTO
              break

            default:
              break
          }

          const bgImageUri = url.parse(feature.options.imageUrl)
          const bgImageUrl = bgImageUri.host && bgImageUri.protocol ? feature.options.imageUrl : jsonar.literal(`get_parent_theme_file_uri( '${feature.options.imageUrl}' )`)

          featureOptions = {
            'default-image': bgImageUrl,
            'default-color': feature.options.color,
            'default-preset': feature.options.preset,
            'default-position-x': feature.options.position.x,
            'default-position-y': feature.options.position.y,
            'default-size': feature.options.imageSize,
            'default-repeat': feature.options.repeat,
            'default-attachment': feature.options.attachment
          }

          initHelper(feature.options.wpHeadCallback, featureOptions, 'wp-head-callback', {
            name: 'Custom Background Callback',
            file: 'custom-background',
            slugfn: 'custom_background_callback',
            description: 'Callback used to write custom background output in wp_head'
          })
        }

        if (feature.type === featureTypes.CUSTOM_HEADER) {
          const headerImageUri = url.parse(feature.options.imageUrl)
          const headerImageUrl = headerImageUri.host && headerImageUri.protocol ? feature.options.imageUrl : jsonar.literal(`get_parent_theme_file_uri( '${feature.options.imageUrl}' )`)

          /* eslint-disable quote-props */
          featureOptions = {
            'default-image': headerImageUrl,
            'width': feature.options.width,
            'height': feature.options.height,
            'flex-width': feature.options.flexWidth,
            'flex-height': feature.options.flexHeight,
            'header-text': feature.options.headerText,
            'random-default': feature.options.random,
            'uploads': true,
            'video': feature.options.video
          }
          /* eslint-enable */

          if (feature.options.headerText) {
            featureOptions['default-text-color'] = feature.options.textColor
          }

          initHelper(feature.options.videoAlwaysActive === false, featureOptions, 'video-active-callback', {
            name: 'Video Active Callback',
            file: 'custom-header-video',
            slugfn: 'video_active_callback',
            description: 'Callback used to determine whether the video should be shown for the current request.'
          })

          initHelper(feature.options.wpHeadCallback, featureOptions, 'wp-head-callback', {
            name: 'Custom Header Callback',
            file: 'custom-header',
            slugfn: 'custom_header_callback',
            description: 'Callback used to write custom header output in wp_head'
          })
        }

        if (feature.type === featureTypes.CUSTOM_LOGO) {
          /* eslint-disable quote-props */
          featureOptions = {
            'width': feature.options.width,
            'height': feature.options.height,
            'flex-width': feature.options.flexWidth,
            'flex-height': feature.options.flexHeight,
            'header-text': ''
          }
          /* eslint-enable */
        }

        if (feature.type === featureTypes.WOOCOMMERCE) {
          mkdirp.sync(this.currentThemePath('woocommerce'))
        }

        theme.features[feature.type] = featureOptions
        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          features: theme.features,
          helpers: uniq(theme.helpers)
        })

        resolve()
      })
    ]).then(
      this.$logger.finish(messages.SUCCEED_FEATURE_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddFeature
