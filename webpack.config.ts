import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
// @ts-ignore
import HtmlMinimizerPlugin from "html-minimizer-webpack-plugin";
import path from "path";
import TerserWebpackPlugin from "terser-webpack-plugin";

const isDevelopment: boolean = process.env.NODE_ENV === "development";

const commonConfig = {
    devtool: isDevelopment ? "source-map" : false,
    mode: isDevelopment ? "development" : "production",
    module: {
        rules: [
            {
                test: /\.(css|html)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.join(__dirname, "tsconfig.json")
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js", ".json" ]
    },
    output: {
        filename: "[name].bundle.js",
        path: path.join(__dirname, "./build")
    },
    optimization: {
        minimize: true,
        minimizer: [ new CssMinimizerPlugin(), new HtmlMinimizerPlugin(), new TerserWebpackPlugin() ]
    }
};

const mainConfig = {
    ...commonConfig,
    entry: {
        electron: path.join(__dirname, "app", "app.ts")
    },
    target: "electron-main",
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: path.join(__dirname, "public"),
                    from: "./**/*.{css,html}"
                }
            ]
        })
    ]
};

const preloadConfig = {
    ...commonConfig,
    entry: {
        "preload_app": path.join(__dirname, "app", "preload", "preload.ts"),
        "preload_slack": path.join(__dirname, "app", "preload", "slack", "preload.ts")
    },
    target: "electron-preload"
};

const rendererConfig = {
    ...commonConfig,
    entry: {
        "renderer_preferences": path.join(__dirname, "app", "renderer", "preferences.ts")
    },
    target: "electron-renderer"
};

export default [ mainConfig, preloadConfig, rendererConfig ];