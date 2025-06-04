module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    'babel-plugin-react-native-web', // Add react-native-web babel plugin
    'transform-inline-environment-variables', // For process.env handling, often used with react-native-web
  ],
};
