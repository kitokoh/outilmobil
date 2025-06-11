const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // Ensure environment is set (development or production)
  const newEnv = {
    ...env,
    projectRoot: env.projectRoot || path.resolve(__dirname), // Ensure projectRoot is set
    // Default to development if not specified, or if running webpack-dev-server
    mode: env.mode || argv.mode || (env.WEBPACK_SERVE ? 'development' : 'production'),
  };

  const config = await createExpoWebpackConfigAsync(newEnv, argv);

  // Customize webpack configuration
  // Alias react-native-svg to react-native-svg-web for Lucide icons
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-svg': 'react-native-svg-web',
  };

  // @expo/webpack-config should handle platform extension resolution (e.g., .web.js)
  // and transpilation of node_modules like react-native-vector-icons if needed.

  // You can add further customizations to the Webpack config here if necessary.
  // For example, handling specific fonts or assets not covered by @expo/webpack-config.

  return config;
};
