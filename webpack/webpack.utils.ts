import { PathLike, readdirSync } from "fs";
import path from "path";

export const getPreloadEntries = (source: PathLike) => {
    const dirNames: string[] = readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let entryList: { [x: string]: string } = {};

    dirNames.forEach((name: string) => {
        entryList[`preload_${ name }`] = path.resolve("app/preload", name, "preload.ts");
    });
    return entryList;
};

export const isDevelopment: boolean = process.env.NODE_ENV === "development";