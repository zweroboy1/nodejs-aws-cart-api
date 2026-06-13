module.exports = (options, webpack) => {
  return {
    ...options,
    entry: './src/lambda.ts',
    externals: [],
    output: {
      filename: 'lambda.js',
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            '@nestjs/websockets/socket-module',
            'class-transformer/storage',
          ];
          return lazyImports.includes(resource);
        },
      }),
    ],
  };
};
