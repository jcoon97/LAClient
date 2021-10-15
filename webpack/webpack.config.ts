import path from "path";
import commonConfig from "./webpack.common";
import { getPreloadEntries } from "./webpack.utils";

const mainConfig = {
    ...commonConfig,
    entry: {
        electron: path.join(__dirname, "../app/main", "bootstrap.ts")
    },
    target: "electron-main"
};

const preloadConfig = {
    ...commonConfig,
    entry: {
        ...getPreloadEntries(path.join(__dirname, "../app/preload"))
    },
    target: "electron-preload"
};

export default [ mainConfig, preloadConfig ];