import { resources } from 'cc';
// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component } from "cc";
import { CSVManager } from "./csvManager";
import { resourceUtil } from "./resourceUtil";
const { ccclass, property } = _decorator;

@ccclass("localConfig")
export class localConfig {
    /* class member could be defined like this */
    private static _instance: localConfig;
    private _csvManager: CSVManager = new CSVManager();

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new localConfig();
        return this._instance;
    }

    private _callback: Function = new Function();
    private _currentLoad: number = 0;
    private _cntLoad: number = 0;

    /**
     * 加载配置文件
     * @param {Function}cb 回调函数 
     */
    public loadConfig (cb: Function) {
        this._callback = cb;
        this._loadCSV();
    }

    private _loadCSV () {
        //新增数据表 请往该数组中添加....
        resources.loadDir("datas", (err: any, assets)=>{
            if (err) {
                return;
            }

            this._cntLoad = assets.length; //+1主要是后续还有技能配置的加载，特殊处理
    
            //客户端加载
            assets.forEach((item, index, array)=> {
                resourceUtil.getTextData(item.name, (err: any, content: any) => {
                    this._csvManager.addTable(item.name, content);
                    this._tryToCallbackOnFinished();
                });
            });
        })        
    }

    /**
     * 查询一条表内容
     * @param {string} tableName 表名
     * @param {string} key 列名
     * @param {any} value 值
     * @returns {Object} 一条表内容
     */
    queryOne (tableName: string, key: string, value: any) {
        return this._csvManager.queryOne(tableName, key, value);
    }

    /**
     * 根据ID查询一条表内容
     * @param {string}tableName 表名
     * @param {string}ID
     * @returns {Object} 一条表内容
     */
    queryByID (tableName: string, ID: string) {
        return this._csvManager.queryByID(tableName, ID);
    }

    /**
     * 根据表名获取表的所有内容
     * @param {string} tableName  表名
     * @returns {object} 表内容
     */
    getTable (tableName: string) {
        return this._csvManager.getTable(tableName);
    }

    /**
     * 根据表名获取表的所有内容
     * @param {string} tableName  表名
     * @returns {object} 表内容
     */
    getTableArr (tableName: string) {
        return this._csvManager.getTableArr(tableName);
    }

    /**
     * 查询key和value对应的所有行内容
     * @param {string} tableName 表名
     * @param {string} key 列名
     * @param {any} value 值
     * @returns {Object}
     */
    queryAll (tableName: string, key: string, value: any) {
        return this._csvManager.queryAll(tableName, key, value);
    }

    // 
    /**
     * 选出指定表里所有 key 的值在 values 数组中的数据，返回 Object，key 为 ID
     * @param {string} tableName 表名
     * @param {string} key  列名
     * @param {Array}values 数值
     * @returns 
     */
    queryIn (tableName: string, key: string, values: any[]) {
        return this._csvManager.queryIn(tableName, key, values);
    }

    /**
     * 选出符合条件的数据。condition key 为表格的key，value 为值的数组。返回的object，key 为数据在表格的ID，value为具体数据
     * @param {string} tableName 表名
     * @param {any} condition 筛选条件
     * @returns 
     */
    queryByCondition (tableName: string, condition: any) {
        return this._csvManager.queryByCondition(tableName, condition);
    }

    private _tryToCallbackOnFinished () {
        if (this._callback) {
            this._currentLoad++;
            if (this._currentLoad >= this._cntLoad) {
                this._callback();
            }
        }
    }
}
