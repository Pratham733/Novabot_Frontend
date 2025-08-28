// web.config.js
module.exports = {
    // Webpack configuration for React Native Web
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Configure React Native Web compatibility
        config.resolve.alias = {
            'react-native$': 'react-native-web',
            ...config.resolve.alias,
        };

        // Handle React Native Web CSS issues
        config.module.rules.push({
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                    plugins: [
                        ['react-native-web', { commonjs: true }],
                    ],
                },
            },
        });

        return config;
    },
};
