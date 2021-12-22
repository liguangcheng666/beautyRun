"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const PACKAGE_NAME = 'cocos-build-template';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
}
exports.load = load;
function onBeforeBuild(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // log('***************************options', options)
        const platformName = options.platform;
        let sendAppID;
        //微信类型
        const appId = options.packages[platformName].appid;
        log('***************************platformName', platformName);
        if (appId) {
            log('***************************appId', appId);
            sendAppID = appId;
        }
        //oppo类型
        const packageName = options.packages[platformName].package;
        if (packageName) {
            log('***************************package', packageName);
            sendAppID = packageName;
        }
        //android类型
        const packageAndroidName = options.packages[platformName].packageName;
        if (packageAndroidName) {
            log('***************************packageAndroidName', packageAndroidName);
            sendAppID = packageAndroidName;
        }
        //@ts-ignore
        require('./cocosAnalytics');
        // log('***************************cocosAnalytics', globalThis.cocosAnalytics)
        if (globalThis.cocosAnalytics) {
            //@ts-ignore
            globalThis.cocosAnalytics.init({
                sendAppID: sendAppID,
                version: '1.0.0',
                storeID: platformName,
                engine: "cocos", // 游戏引擎
            });
        }
        log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
    });
}
exports.onBeforeBuild = onBeforeBuild;
function onBeforeCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgOptions = options.packages[PACKAGE_NAME];
        if (pkgOptions && pkgOptions.webTestOption) {
            console.debug('webTestOption', true);
        }
        // Todo some thing
        console.debug('get settings test', result.settings);
    });
}
exports.onBeforeCompressSettings = onBeforeCompressSettings;
function onAfterCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.log('webTestOption', 'onAfterCompressSettings');
    });
}
exports.onAfterCompressSettings = onAfterCompressSettings;
function onAfterBuild(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // change the uuid to test
        const uuidTestMap = {
            image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
        };
        for (const name of Object.keys(uuidTestMap)) {
            const uuid = uuidTestMap[name];
            console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
            console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
            console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
            console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
        }
    });
}
exports.onAfterBuild = onAfterBuild;
function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
exports.unload = unload;
