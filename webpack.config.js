const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const { ProvidePlugin, DefinePlugin } = require('webpack')

require('@babel/register')

module.exports = {
  entry: ['@babel/polyfill', './src/index.tsx'],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules\/(?!(melonjs)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              generatorOpts: { compact: false },
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      hash: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/game/data',
          to: './data',
          filter: async (resourcePath) => {
            const data = await fs.promises.readFile(resourcePath)

            // add your custom extension here if not listed
            var texture = /\.(jpe?g|gif|png|svg|heic|pkm|pvr)$/
            var fnt = /\.(woff|woff2|ttf|fnt)$/
            var map = /\.(tmx|tsx)$/
            var audio =
              /\.(wav|mp3|mpeg|opus|ogg|oga|wav|aac|caf|m4a|m4b|mp4|weba|webm|dolby|flac)$/
            var misc = /\.(xml|bin|glsl|ym|json|js)$/

            // only copy production files
            var ret =
              texture.test(resourcePath) ||
              fnt.test(resourcePath) ||
              map.test(resourcePath) ||
              audio.test(resourcePath) ||
              misc.test(resourcePath)

            if (ret === false) {
              console.log('ignoring data: ' + resourcePath)
            }
            return ret
          }
        }
      ]
    }),
    new NodePolyfillPlugin({ excludeAliases: ['process'] }),
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.release.name': 'your-mum'
    })
  ],
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.ts', '.js', '.tsx', '...'],
    fallback: {
      util: require.resolve(`util/`),
      url: require.resolve(`url/`),
      assert: require.resolve(`assert/`),
      tls: require.resolve('tls-browserify'),
      net: require.resolve('net-browserify'),
      async_hooks: false,
      path: false,
      fs: false
    },
    symlinks: false
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    hot: true,
    port: 9000,
    open: true
  },
  externals: {
    bufferutil: 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  },
  watch: false
}
