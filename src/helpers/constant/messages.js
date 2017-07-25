const chalk = require('chalk')

const removehint = (cmd, prefix = 'Please choose another name') => {
  return `${prefix}, type: ${chalk.bold.cyan(`deux remove ${cmd}`)} to remove from list`
}

exports.INIT = 'Initializing'
exports.INIT_PROJECT = 'Init Deux Project'
exports.SUCCEED_INITIALIZED = 'Deux project has been initialized'
exports.CREATE_NEW_THEME = `Please create new theme, type: ${chalk.bold.cyan('deux new')}`
exports.PROMPT_YES = 'Okay'
exports.PROMPT_NO = 'Nope'
exports.DONE_FINISH = 'Finish'
exports.DONE_UPDATED = 'Updated'
exports.DONE_NO_REMOVE = 'Good, nothing to remove, keep your config safe.'
exports.SUCCEED_ALREADY_IN_CURRENT_PROJECT = 'Theme already used as current project.'
exports.SUCCEED_THEME_SWITCHED = `Switched with another theme, type: ${chalk.bold.cyan('deux status')} to view project details.`
exports.SUCCEED_COMPONENT_ADDED = 'Yay, new component has been added to `components` directory.'
exports.SUCCEED_PARTIAL_TEMPLATE_ADDED = 'Yay, new partial template has been added to `partial-templates` directory.'
exports.SUCCEED_PAGE_TEMPLATE_ADDED = 'Yay, new page template has been added to `page-templates` directory.'
exports.SUCCEED_PLUGIN_ADDED = 'Yay, plugin has been added in dependencies list.'
exports.SUCCEED_ASSET_ADDED = 'Yay, assets has been added in dependencies list.'
exports.SUCCEED_WIDGET_ADDED = 'Yay, new widget has been registered.'
exports.SUCCEED_HELPER_ADDED = 'Yay, new helper has been added to `includes/helpers` directory.'
exports.SUCCEED_MENU_ADDED = 'Yay, new menu has been registered.'
exports.SUCCEED_FEATURE_ADDED = 'Yay, feature has added on the list.'
exports.SUCCEED_REMOVED_ASSET = 'Congrats, you have been removed some assets from theme.'
exports.SUCCEED_REMOVED_PLUGIN = 'Congrats, you have been removed some plugins from theme.'
exports.SUCCEED_REMOVED_COMPONENT = 'Congrats, you have been removed some components from theme.'
exports.SUCCEED_REMOVED_HELPER = 'Congrats, you have been removed some helpers from theme.'
exports.SUCCEED_REMOVED_FEATURE = 'Congrats, you have been removed some features from theme.'
exports.SUCCEED_REMOVED_WIDGET = 'Congrats, you have been removed some widgets from theme.'
exports.SUCCEED_REMOVED_MENU = 'Congrats, you have been removed some menus from theme.'
exports.ERROR_INVALID_COMMAND = 'Invalid Command.'
exports.ERROR_NOT_WP_FOLDER = 'You are not in WordPress installation directory.'
exports.ERROR_NO_THEME = 'You have 0 themes in project.'
exports.ERROR_NO_THEME_FOUND = 'Theme not found.'
exports.ERROR_INVALID_PROJECT = 'Invalid project, please check .deuxproject in current directory.'
exports.ERROR_THEME_NAME_BLANK = 'Theme Name cannot be empty'
exports.ERROR_PROJECT_FILE_NOT_EXISTS = '.deuxproject File not exists.'
exports.ERROR_PROJECT_FILE_INVALID_JSON = 'Invalid format.'
exports.ERROR_INVALID_URL = 'Invalid URL.'
exports.ERROR_INVALID_VERSION = 'Invalid Version.'
exports.ERROR_REPOSITORY_URL_NOT_ZIP = 'Repository URL does not contains .zip extension.'
exports.ERROR_CANCELED = 'Canceled'
exports.ERROR_THEME_ALREADY_EXISTS = `Theme already exists. type: ${chalk.bold.cyan('deux remove theme')} to remove existing theme.`
exports.ERROR_COMPONENT_ALREADY_EXISTS = `Component already exists. ${removehint('component')}`
exports.ERROR_PLUGIN_ALREADY_EXISTS = `Plugin already exists. ${removehint('component', 'Please add another one')}`
exports.ERROR_TEMPLATE_ALREADY_EXISTS = `Template already exists. ${removehint('template')}`
exports.ERROR_SASS_FILE_ALREADY_EXISTS = `SASS file already exists. ${removehint('sass')}`
exports.ERROR_WIDGET_ALREADY_EXISTS = `Widget already exists. ${removehint('widget')}`
exports.ERROR_HELPER_ALREADY_EXISTS = `Helper already exists. ${removehint('helper')}`
exports.ERROR_MENU_ALREADY_EXISTS = `Menu location already exists. ${removehint('menu')}`
exports.ERROR_FEATURE_ALREADY_EXISTS = `Feature already exists. ${removehint('menu', 'Please add another feature')}`
exports.ERROR_IMGSIZE_ALREADY_EXISTS = `Image Size already exists. ${removehint('imgsize')}`
exports.ERROR_THEME_CREATION_CANCELED = 'Theme creation was canceled.'
exports.ERROR_GIT_INIT = 'There is something wrong when initializing git.'
exports.ERROR_GIT_REMOTE_ADD = 'There is something wrong when add remote url to git.'
exports.ERROR_THEME_NOT_IN_LIST = 'Theme is not part of project list.'
exports.ERROR_QUERY_NOT_FOUND = 'Search query are not matched with any results.'
exports.ERROR_INVALID_API_KEY = 'Invalid Google Fonts API Key.'
