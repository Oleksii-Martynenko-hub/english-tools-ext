const { resolve, join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: resolve(__dirname, "src"),
  entry: {
    "service-worker": "./Containers/service-worker.ts",
    popup: "./Containers/Popup.tsx",
    options: "./Containers/Options.tsx",
    "content-script": "./Containers/content-script.ts",
  },
  output: {
    publicPath: "/",
    path: resolve(__dirname, "dist"),
    filename: "[name].js",
  },

  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    // plugins: [new TsconfigPathsPlugin()],
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    ...["popup", "options"].map(
      (name) =>
        new HtmlWebpackPlugin({
          filename: `${name}.html`,
          template: `./html/${name}.html`,
          chunks: [name],
          inject: "body",
        })
    ),
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
};
