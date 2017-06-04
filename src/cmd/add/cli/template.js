const path = require('path')
const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const {templateTypes, postTypes} = require('./const')

const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')
const {error, done, colorlog} = global.helpers.require('logger')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const compileFile = global.helpers.require('compiler/single')
const validator = global.helpers.require('util/validator')

module.exports = db => {
  colorlog('Add a {New Template}')

  const prompts = [
    {
      type: 'list',
      name: 'template.type',
      message: 'Select template type',
      choices: [
        {
          value: templateTypes.PAGE,
          name: 'Page Template'
        },
        {
          value: templateTypes.PARTIAL,
          name: 'Partial Template'
        }
      ]
    },

    {
      name: 'template.name',
      message: 'Template Name',
      when: ({template}) => template.type === templateTypes.PAGE,
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      type: 'list',
      name: 'template.posttype',
      message: 'Post Type',
      when: ({template}) => template.type === templateTypes.PAGE,
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
      name: 'template.posttype',
      message: 'Custom Post Type',
      default: postTypes.POST,
      when: ({template}) => {
        return template.type === templateTypes.PAGE && template.posttype === postTypes.CUSTOM
      },
      validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
      filter: value => value.toLowerCase()
    },

    {
      name: 'template.prefix',
      message: 'Template Prefix',
      when: ({template}) => template.type === templateTypes.PARTIAL,
      validate: value => validator(value, {minimum: 3, slug: true, var: `"${value}"`})
    },

    {
      name: 'template.name',
      message: 'Template Name [optional]',
      when: ({template}) => template.type === templateTypes.PARTIAL
    },

    {
      name: 'template.description',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]

  inquirer.prompt(prompts).then(({template}) => {
    getCurrentTheme(db).then(theme => {
      const themePath = path.join(wpThemeDir, theme.details.slug)
      let srcPath
      let dstPath
      let config
      let successMsg

      if (template.type === templateTypes.PARTIAL) {
        template.slug = slugify(template.prefix)

        if (template.name.length > 0) {
          template.slug += '-' + slugify(template.name)
        }

        if (theme.template.partials.includes(template.slug)) {
          error({
            message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
            paddingTop: true,
            exit: true
          })
        }

        srcPath = path.join(global.templates.path, '_partials', 'partial-template.php')
        dstPath = path.join(themePath, 'partial-templates', `${template.slug}.php`)
        successMsg = message.SUCCEED_PARTIAL_TEMPLATE_ADDED
        config = {
          template: {
            partials: theme.template.partials.concat(template.slug)
          }
        }
      }

      if (template.type === templateTypes.PAGE) {
        template.slug = slugify(template.name)

        if (theme.template.pages.includes(template.slug)) {
          error({
            message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
            paddingTop: true,
            exit: true
          })
        }

        srcPath = path.join(global.templates.path, '_partials', 'page-template.php')
        dstPath = path.join(themePath, 'page-templates', `${template.slug}.php`)
        successMsg = message.SUCCEED_PAGE_TEMPLATE_ADDED
        config = {
          template: {
            pages: theme.template.pages.concat(template.slug)
          }
        }
      }

      compileFile({
        srcPath,
        dstPath,
        syntax: {
          theme: theme.details,
          template
        }
      })

      saveConfig(db, config).then(() => {
        done({
          message: successMsg,
          padding: true,
          exit: true
        })
      })
    })
  })
}