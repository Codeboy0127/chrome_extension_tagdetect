let mix = require('laravel-mix');

mix.setPublicPath('./')
    .sass('assets/sass/popup.scss', 'dist/css')
    .js('assets/js/service_worker.js', 'dist/')
    .js('assets/js/popup.js', 'dist/js').vue()
    .copy('assets/images/', 'dist/images')
    .options({
        processCssUrls: false
    });