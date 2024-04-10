const esModules = ['nanoid', 'node-fetch', 'data-uri-to-buffer', 'fetch-blob', 'formdata-polyfill'].join('|');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))`],
  setupFiles: [
    'jest-fetch-mock/setupJest.js'
  ],
};
