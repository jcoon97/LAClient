const path = require("path");
const { notarize } = require("electron-notarize");

require("dotenv").config();

exports.default = async function onCall(context) {
    const { appOutDir, electronPlatformName } = context;
    if (electronPlatformName !== "darwin") return;
    console.log("afterSign: Hook was triggered");

    const appBundleId = "dev.jcoon.laclient";
    const appPath = path.join(appOutDir, `${ context.packager.appInfo.productFilename }.app`);
    console.log(`afterSign: Notarizing app ${ appBundleId } found at ${ appPath }`);

    try {
        return await notarize({
            appBundleId,
            appPath,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PASSWORD
        })
    } catch (err) {
        console.error(err);
    }
}