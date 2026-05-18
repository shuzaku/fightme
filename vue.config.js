module.exports = {
  transpileDependencies: ['vuetify'],
  outputDir: '../Node-Fighters-Edge/dist',
  configureWebpack: config => {
    // Replace eval-based source maps with file-based ones in dev.
    // This eliminates the thousands of 'unsafe-eval' CSP violations in the
    // browser console without losing useful source-map debugging.
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-module-source-map';
    }
  },
}