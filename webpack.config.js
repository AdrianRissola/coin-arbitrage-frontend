const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({ path: './.env.local' });
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, './src/index.js'),
  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].[hash].bundle.js',
    publicPath: '/'

  },
  resolve: {
    fallback: {
      util: require.resolve("util/")
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          '@svgr/webpack'
        ],
      },
      {
        test: /\.yml$/,
        use: ['json-loader', 'yaml-loader']
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
              loader: 'css-loader',
              options: {
                  sourceMap: true,
              },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['./src']
              },
            },
          },
        ],
      }
    ],
    
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      assets: path.resolve(__dirname, "src", "assets"),
      app: path.resolve(__dirname, "src", "app"),
    }
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parsed)
    }),
    new HtmlWebPackPlugin({
      template: './public/index.html'
   })
  ]
};