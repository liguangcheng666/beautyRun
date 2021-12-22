import { util } from './util';
import { _decorator, Component, Node, AudioClip, sys } from "cc";
import { StorageManager } from "./storageManager";
import { resourceUtil } from "./resourceUtil";
const { ccclass, property } = _decorator;
const DEFAULT_MUSIC_VOLUME: number = 0.8;
const DEFAULT_SOUND_VOLUME: number = 1;
@ccclass("AudioManager")
export class AudioManager  {
    private static _instance: AudioManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new AudioManager();
        this._instance.init();
        return this._instance;
    }

    private _musicVolume: number = 0.8;
    private _soundVolume: number = 1;
    private _audios: any = {};
    private _arrSound: any = [];

    init () {
        this._musicVolume = this._getAudioSetting(true) ? this._musicVolume: 0;
        this._soundVolume = this._getAudioSetting(false) ? this._soundVolume : 0;
    }

    /**
     * 获取Audio相关配置
     * @param {Boolean} isMusic 是否为音乐
     * @returns 
     */
    private _getAudioSetting (isMusic: boolean) {
        let state: string;
        if (isMusic) {
            state = StorageManager.instance.getGlobalData('music');
        } else {
            state = StorageManager.instance.getGlobalData('sound');
        }
        return !state || state === 'true' ? true : false;
    }

    /**
     * 播放音乐
     * @param {String} name 音乐名称可通过constants.AUDIO_MUSIC 获取
     * @param {Boolean} loop 是否循环播放
     */
    public playMusic (name:string, loop: boolean) {
        let path: string = 'audio/music/' + name;
        resourceUtil.loadRes(path, AudioClip, (err: any, clip: any)=> {
            let tmp = {} as any;
            tmp.clip = clip;
            tmp.loop = loop;
            tmp.isMusic = true;
            this._audios[name] = tmp;
            this._playClip(name, true); 
        });     
    }

    /**
     * 播放音效
     * @param {String} name 音效名称可通过constants.AUDIO_SOUND 获取
     * @param {Boolean} loop 是否循环播放
     */
     public playSound (name:string, loop:boolean = false) {
        if (!this._soundVolume) {
            return;
        }

        //音效一般是多个的，不会只有一个
        let path: string  = 'audio/sound/';
        resourceUtil.loadRes(path + name, AudioClip, (err: any, clip: any)=> {
            let tmp = {} as any;
            tmp.clip = clip;
            tmp.loop = loop;
            tmp.isMusic = false;
            this._arrSound.push(tmp);

            if (loop) {
                this._audios[name] = tmp;
                clip.setLoop(loop);
            }

            clip.setVolume(this._soundVolume);
            
            clip.playOneShot();

            clip.once('ended', ()=>{
                util.remove(this._arrSound, (obj: any)=>{
                    return obj.clip === tmp.clip;
                });
            })
        });
    }

    /**
     * 播放AudioClip
     * @param {String} name 音乐名称可通过constants.AUDIO_MUSIC 获取
     * @param {Boolean} loop 是否循环播放
     */
    private _playClip (name: string, isMuisc?: boolean) {
        let audio = this._audios[name];
        let volume = this._musicVolume;
        if (!isMuisc) {
            volume = this._soundVolume;
        }

        let clip = audio.clip as AudioClip;
        clip.setVolume(volume);
        clip.setLoop(audio.loop);
        clip.play();
    }

    /**
     * 暂停Audio
     * @param {String} name
     */
     public stop (name: any) {
        if (this._audios.hasOwnProperty(name)) {
            let audio = this._audios[name];
            audio.clip.stop();
        }
    }

    /**
     * 暂停所有Audio
     */
    public stopAll () {
        for (const i in this._audios) {
            if (this._audios.hasOwnProperty(i)) {
                let audio = this._audios[i];
                audio.clip.stop();
            }
        }
    }

    /**
     *  设置音乐volume
     * @param {number}volume 
     */
    private _setMusicVolume (volume: number) {
        this._musicVolume = volume;
        for (let item in this._audios) {
            if (this._audios.hasOwnProperty(item) && this._audios[item].isMusic) {
                let audio = this._audios[item];
                audio.clip.setVolume(this._musicVolume);
            }
        }
    }
    /**
     *  设置音乐volume
     * @param {number}volume 
     */
     public getMusicVolume () {
        return StorageManager.instance.getGlobalData('music');
    }

    /**
     * 将全部Audio暂停
     */
    public pauseAll () {
        console.log("pause all music!!!");
        for (let item in this._audios) {
            if (this._audios.hasOwnProperty(item)) {
                let audio = this._audios[item];
                audio.clip.pause();
            }
        }
    }

    /**
     * 将全部Audio恢复
     */
    public resumeAll () {
        for (let item in this._audios) {
            if (this._audios.hasOwnProperty(item)) {
                let audio = this._audios[item];
                audio.clip.play();
            }
        }
    }

    /**
     * 开启音乐
     */
    public openMusic () {
        this._setMusicVolume(DEFAULT_MUSIC_VOLUME);
        StorageManager.instance.setGlobalData('music', 'true');
    }

    /**
     * 关闭音乐
     */
    public closeMusic () {
        this._setMusicVolume(0);
        StorageManager.instance.setGlobalData('music', 'false');
    }

    /**
     * 开启音效
     */
    public openSound () {
        this._setSoundVolume(DEFAULT_SOUND_VOLUME);
        StorageManager.instance.setGlobalData('sound', 'true');
    }

    /**
     * 开启音效
     */
    public closeSound () {
        this._setSoundVolume(0);
        StorageManager.instance.setGlobalData('sound', 'false');
    }

    /**
     *  设置音效volume
     * @param {number}volume 
     */
    private _setSoundVolume (volume: number) {
        this._soundVolume = volume;
        for (let item in this._audios) {
            if (this._audios.hasOwnProperty(item) && !this._audios[item].isMusic) {
                let audio = this._audios[item];
                audio.clip.setVolume(this._soundVolume);
            }
        }

        for (let idx: number = 0; idx < this._arrSound.length; idx++) {
            let audio = this._arrSound[idx];
            audio.clip.setVolume(this._soundVolume);
        }
    }

    /**
     * 暂停音效，主要是可循环的音效
     * @param {String} name 音效名称可通过constants.AUDIO_SOUND 获取
     */
    public stopSound (name: string) {
        if (this._audios.hasOwnProperty(name) && !this._audios[name].isMusic) {
            let audio: any = this._audios[name];
            audio.clip.stop();
        }
    }
}
