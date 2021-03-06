import { IBuildTaskOption } from '../@types';
import { IBuildResult } from '../@types';

interface IOptions {
    commonTest1: number;
    commonTest2: 'opt1' | 'opt2';
    webTestOption: boolean;
}

const PACKAGE_NAME = 'cocos-build-template';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError = true;

export async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
}

export async function onBeforeBuild(options: ITaskOptions) {
    // Todo some thing
    // log('***************************options', options)
    const platformName = options.platform;

    let sendAppID;
    //微信类型
    const appId = options.packages[platformName].appid;
    log('***************************platformName', platformName)
    if (appId) {
        log('***************************appId', appId)
        sendAppID = appId;
    }

    //oppo类型
    const packageName = options.packages[platformName].package;
    if (packageName) {
        log('***************************package', packageName)
        sendAppID = packageName;
    }

    //android类型
    const packageAndroidName = options.packages[platformName].packageName;
    if (packageAndroidName) {
        log('***************************packageAndroidName', packageAndroidName)
        sendAppID = packageAndroidName;
    }

    //@ts-ignore
    require('./cocosAnalytics')
    // log('***************************cocosAnalytics', globalThis.cocosAnalytics)
    if (globalThis.cocosAnalytics) {
        //@ts-ignore
        globalThis.cocosAnalytics.init({
            sendAppID: sendAppID,              // 游戏ID
            version: '1.0.0',           // 游戏/应用版本号
            storeID: platformName,     // 分发渠道
            engine: "cocos",            // 游戏引擎
        });
    }
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
}

export async function onBeforeCompressSettings(options: ITaskOptions, result: IBuildResult) {
    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions && pkgOptions.webTestOption) {
        console.debug('webTestOption', true);
    }
    // Todo some thing
    console.debug('get settings test', result.settings);
}

export async function onAfterCompressSettings(options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    console.log('webTestOption', 'onAfterCompressSettings');
}

export async function onAfterBuild(options: ITaskOptions, result: IBuildResult) {
    // change the uuid to test
    const uuidTestMap = {
        image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
    }
    for (const name of Object.keys(uuidTestMap)) {
        const uuid = uuidTestMap[name];
        console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
        console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
        console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
        console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
    }
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
