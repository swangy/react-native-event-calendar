/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const reactNativeLib = path.resolve(__dirname, '..', 'node_modules');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    providesModuleNodeModules: [
      'react-native',
      'react',
      'prop-types',
      'lodash',
      'moment',
    ],
    blacklistRE: blacklist([
      new RegExp(`${reactNativeLib}/.*`),
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
