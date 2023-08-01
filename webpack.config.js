const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    Hello: "./src/Hello/HelloSUGCON.js",
    PublicLink: "./src/PublicLinks/publiclinks.jsx",
    CreatePublicLink: "./src/CreatePublicLinks/CreatePublicLinks.jsx",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    fallback: {
      https: require.resolve("https-browserify"),
      url: require.resolve("url/"),
      http: require.resolve("stream-http"),
      buffer: require.resolve("buffer/"),
    },
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/public",
    library: {
      type: "module",
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "src/static", to: "static" }],
    }),
  ],
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        exclude: /static/,
      }),
    ],
  },
  experiments: {
    outputModule: true,
  },
};
