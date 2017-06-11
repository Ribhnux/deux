const path = require('path')
const browserSync = require('browser-sync')
const gulp = require('gulp')
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const srcmap = require('gulp-sourcemaps')
const cssnano = require('gulp-cssnano')
const cssbeautify = require('gulp-cssbeautify')
const sequence = require('gulp-sequence')
const stripComments = require('gulp-strip-css-comments')
const merge = require('gulp-merge')
const clone = require('gulp-clone')
const watch = require('gulp-watch')

const {getEnv, getCurrentTheme} = global.helpers.require('db/utils')
const {wpThemeDir} = global.const.require('path')

const tasklist = [
  'start-server',
  'watcher'
]

module.exports = db => {
  getCurrentTheme(db).then(theme => {
    const themePath = path.join(wpThemeDir, theme.details.slug)
    const publicPath = path.join(themePath, 'assets', 'public')
    const srcPath = path.join(themePath, 'assets', 'src')
    const sassPath = path.join(srcPath, 'scss')

    const compileCSS = () => {
      const gulpPlumber = plumber({
        errorHandler(err) {
          console.log(err)
          this.emit('end')
        }
      })

      const compiledCSS = gulp
        .src(path.join(sassPath, '*.scss'))
        .pipe(gulpPlumber)
        .pipe(
          sass({
            outputStyle: 'compressed'
          })
        )
        .pipe(rename('style.css'))

      const style = compiledCSS
        .pipe(clone())
        .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
        .pipe(gulp.dest(publicPath))

      const minStyle = compiledCSS
        .pipe(clone())
        .pipe(
          srcmap.init({
            loadMaps: true
          })
        )
        .pipe(rename({suffix: '.min'}))
        .pipe(srcmap.write(`./`))
        .pipe(gulp.dest(publicPath))

      return merge(style, minStyle)
    }

    gulp.task('start-server', () => {
      const watchFiles = [
        path.join(publicPath, '*.css'),
        path.join(publicPath, '*.js'),
        path.join(themePath, '**', '*.php')
      ]

      browserSync.init(watchFiles, {
        proxy: getEnv(db).devUrl,
        logLevel: 'info',
        logPrefix: theme.details.name,
        notify: false
      })
    })

    gulp.task('watcher', () => {
      return watch(path.join(sassPath, '**', '*.scss'), compileCSS)
    })

    const args = [tasklist]
    gulp.start.apply(gulp, args)
  })
}
