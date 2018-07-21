const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/js/index.js',
        restaurant: './src/js/restaurant_info.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
};
