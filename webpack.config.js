// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    module: {
      rules: [
        {
          test: /\.s(c|a)ss$/,
          use: [
            'vue-style-loader',
            'css-loader',
          ],
          plugins: [
            new VueLoaderPlugin()
        ],
        },
      ],
    }
  }