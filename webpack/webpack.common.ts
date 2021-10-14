import path from "path";
import { isDevelopment } from "./webpack.utils";

export default {
    devtool: isDevelopment ? "source-map" : false,
    mode: isDevelopment ? "development" : "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.join(__dirname, "../tsconfig.json")
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
        path: path.join(__dirname, "../build")
    }
};