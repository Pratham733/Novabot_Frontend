const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for React Native Web CSS issues
config.resolver.alias = {
    'react-native': 'react-native-web',
    ...config.resolver.alias,
};

module.exports = config;
