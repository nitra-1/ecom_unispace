const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin')
const DotenvWebpackPlugin = require('dotenv-webpack')
const { HotModuleReplacementPlugin } = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2)$/,
        type: 'asset/resource'
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      icons: path.resolve(__dirname, 'src/icons/'),
      fonts: path.resolve(__dirname, 'src/fonts/')
    }
  },
  devServer: {
    compress: true,
    port: 8080,
    historyApiFallback: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin()
    ]
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Admin | Aparna',
      template: './public/index.html',
      favicon: './public/favicon.ico'
    }),
    new DotenvWebpackPlugin({ systemvars: true }),
    new HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [{ from: 'public/robots.txt', to: '' }]
    })
  ],
  performance: {
    hints: false
  }
}
