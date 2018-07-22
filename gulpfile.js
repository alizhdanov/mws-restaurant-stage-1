const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const csso = require('gulp-csso');
const lqip = require('gulp-lqip');
const responsive = require('gulp-responsive');
const critical = require('critical').stream;
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.prod.js');
const webpack = require('webpack');

const srcPath = 'src';
const distPath = 'dist';

// Generate & Inline Critical-path CSS
gulp.task('html', () => {
    const options = {
        base: 'dist/',
        inline: true,
        css: [`${srcPath}/css/styles.css`],
        minify: true,
    };
    return gulp.src([`${srcPath}/index.html`, `${srcPath}/restaurant.html`])
        .pipe(critical(options))
        .on('error', function(err) { log.error(err.message); })
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(distPath));
});

gulp.task('css', () => {
    return gulp.src(`${srcPath}/css/styles.css`)
        .pipe(csso())
        .pipe(gulp.dest(distPath))
});

gulp.task('js', () => {
    return gulp.src('*')
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(distPath));
});

// Images!!!!
gulp.task('images', () => {
    return gulp.src('images/*.{png,jpg}')
        .pipe(responsive({
            '*': {

            }
        }))

    // make thumbnail svg
    // make webp
    // resize - gulp-responsive
});

gulp.task('default', gulp.parallel('html', 'css', 'js', (done) => {
    console.log('finished');
    done();
}));
