

# 准备项目

可参考 Cocos Store 文档
[https://store.cocos.com/document/zh/](https://store.cocos.com/document/zh/)

![](./docImg/准备项目.png)   


# 项目介绍

## 文件结构

### 整体目录结构

- assets
    - res                       --- 资源
        - effect                --- 特效
        - model                 --- 模型
        - texture               --- UI资源
    - resources                 --- 动态加载的资源
        - aiWayData             --- ai路径配置
        - datas                 --- 配置文件(关卡地图)
        - prefab                --- 预制体
            - model             --- 基础块资源
            - ui                --- UI界面
        - roleMat               --- 角色皮肤材质
    - scene
        - art.scene             --- 预览资源场景（不打包）
        - main.scene            --- **主场景（入口场景）**
        - map.scene             --- **地图编辑器**（不打包）
    - script                    --- 脚本
        - framework             --- 基础框架(声音/界面/配置/数据等管理)
            - audioManager      --- 声音管理
            - clientEvent       --- 事件订阅与发布
            - constant          --- 游戏相关的配置
            - csvManager        --- 表格管理器
            - effectManager     --- 特效管理
            - localConfig       --- 配置文件，管理游戏中的配置文件
            - lodsh             --- 工具类
            - playerData        --- 玩家数据管理
            - poolManager       --- 节点池管理
            - resourceUtil      --- 加载资源管理
            - storageManager    --- 本地存储
            - uiManager         --- ui视图界面管理
            - util              --- 工具类
        - game
            - map               --- 地图编辑器相关代码
            - role              --- 角色控制和ai
            - utils             --- 
            - cameraFollow.ts   --- 跟随相机
            - gameManager.ts    --- **入口脚本**
        - lib                   --- 第三方库
        - ui                    --- UI类脚本，与UI预制体名字对应


### 游戏代码启动

- 启动场景：`main.scene`
    - 主灯光
    - 主摄像机 `cameraFollow.ts`
    - 水面
    - 天空盒
    - 入口脚本：`gameManager.ts`
        - step1: initPlayerData 加上用户数据/加载本地存储数据
        - step2: 注册 restartGame 重置游戏事件
        - step3: 获取场景中重要的节点，地图父节点/特效的父节点/结尾奖励阶段圆台父节点/铺设在地面上的砖块的父节点
        - step4: 加载CSV相关配置 
            - 初始化砖块堆信息   
        - step5: 初始化游戏 _initGame
            - 重置单局游戏数据
            - 加载玩家皮肤
            - 加载地图
            - 创建玩家控制脚本并初始化
            - 加载ai路径信息并创建ai
    - Canvas UI场景父节点
        - UI 摄像机
    - effectManager


## 地图编辑器

- 场景：`assets/scene/map.scene` 
- 配置：`assets/resources/datas`
- 地图块预制体：`assets/resources/prefab/model/road`

### 导入与导出

打开 `map.scene` 场景，选择 `mapNode` 节点，输入关卡数字，勾选对应的导出/加载关卡数据即可。  

![](./docImg/地图导入与导出.png)   

### 关卡数据说明

- `map[关卡].csv` 数据说明
    - 编号 ID 
    - 对应资源编号 
        - 1001~1008  普通路块
        - 1010 结尾路面（包含拱门）
        - 2001~2003 砖块堆，砖块堆数据见`module.csv`

### 编辑

地图基础块位于 `mapItem` 节点，只需拷贝需要的地图块至 `mapNode` 节点，并调整位置即可。(角色起始点为(0,0,0))

![](./docImg/地图编辑.png)   

<!-- > 实际代码运行中读取的地图块模型为`assets/resources/prefab/model/road` -->



## 游戏逻辑

### 地图
#### 天空球
天空球是由一个球模型(三角形面朝内)和一个旋转动画构成。

采用 `builtin-unlit` 无光照模式+贴图。  

![](./docImg/天空球.png)   
#### 水面
水面是由以下几部分构成
- 平面模型(四方形)
- 噪声贴图(用于显示水纹)
- 深度贴图(控制水的颜色，中心到边缘的变化)

![](./docImg/水面.png)   
#### 地图读取
加载配置表，并解析。详细见代码 `gameManager.ts` 中的 `_loadMap()` 部分。  

- 加载地图 `_loadMap` 逻辑
    - 1: 读取对应关卡数据`map[level]`
    - 2: 回收地图节点块到对象池
    - 3: 对于每一条数据处理
        - 如果是砖块堆，根据砖块堆配置，摆放砖块堆
        - 如果是地图块，根据地图块的位置等信息摆放


### 摄像机

根据目标点的位置，相机偏移位置，求出相机的位置和lookAt的点的位置，再每帧进行插值运算更新相应属性。  

![](./docImg/跟随相机.png)      

详见代码 `cameraFollow.ts`


### 玩家

相关代码见 `assets/script/game/role`

玩家控制采用状态机模型，设定了以下几种状态：
- IDLE              
- IDLE_TAKE_BRICK
- RUN
- RUN_TAKE_BRICK
- PUT_BRICK
- JUMP
- SWOOP
- CLIMB 
- FALL
- WIN
- FAIL

根据不同的状态切换角色动作。  

![](./docImg/玩家状态.png)      

玩家节点和地图块节点都添加了碰撞盒：
- 通过监听玩家与碰撞盒的触发，判断是否到终点。
- 通过监听玩家与地面盒的触发，保存一个玩家所踩的路面列表。

判断拾取方块的方法是根据位置关系。   

判断是否在路面的方法是，根据玩家路面碰撞体列表和已铺砖块的位置。  

![](./docImg/玩家碰撞器.png)      



### AI逻辑

采用读取配置的形式，为ai生成一个路径，ai按照该路径前行。  

编辑ai场景：`assets/scene/map.scene` 

![](./docImg/AI编辑.png)      

解析路径逻辑见 `gameUtils.ts` 中的 `getBezierCalculateList` 方法


## UI 界面

### 主界面

- 界面：`assets/resources/prefab/ui/main/mainPanel.prefab` 
- 脚本：`assets/script/ui/mainPanel.ts`

<!-- ### 商店界面
- 界面：`assets/resources/prefab/ui/main/mainPanel.prefab` 
- 脚本：`assets/script/ui/mainPanel.ts` -->

### 设置界面
- 界面：`assets/resources/prefab/ui/setting/settingPanel.prefab` 
- 脚本：`assets/script/ui/settingPanel.ts`

### 游戏中
- 界面：`assets/resources/prefab/ui/game/gamePanel.prefab` 
- 脚本：`assets/script/ui/gamePanel.ts`

### 复活界面
- 界面：`assets/resources/prefab/ui/resurrection/resurrectionPanel.prefab` 
- 脚本：`assets/script/ui/resurrectionPanel.ts`

### 结算界面
- 界面：`assets/resources/prefab/ui/gameOver/gameOverPanel.prefab` 
- 脚本：`assets/script/ui/gameOverPanel.ts`

<!-- ### 皮肤获取界面
- 界面：`assets/resources/prefab/ui/main/mainPanel.prefab` 
- 脚本：`assets/script/ui/mainPanel.ts` -->



# 发布项目

[https://docs.cocos.com/creator/3.0/manual/zh/editor/publish/](https://docs.cocos.com/creator/3.0/manual/zh/editor/publish/)

<!-- ## 安卓 -->
