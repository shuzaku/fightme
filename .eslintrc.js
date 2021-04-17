module.exports = {
  root: true,
  globals: {
    "$": true,
    "jQuery": true
  },
  env: {
    node: true
  },
  'extends': [
    "plugin:vue/recommended",
    "plugin:vue/strongly-recommended",
    'plugin:vue/essential',
    'eslint:recommended',
    "prettier"
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/require-v-for-key': 'off',
    'vue/attribute-hyphenation': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint'
  }, 

}
