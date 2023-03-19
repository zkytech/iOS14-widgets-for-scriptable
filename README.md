> 如果本项目对你有帮助，欢迎在[Github](https://github.com/zkytech/iOS14-widgets-for-scriptable)点个star表示支持。
> 
> 联系邮箱：zhangkunyuan@hotmail.com ，PR请提交到[Github](https://github.com/zkytech/iOS14-widgets-for-scriptable)
# iOS 14小组件
<!-- vscode-markdown-toc -->
- [iOS 14小组件](#ios-14小组件)
  - [1 使用方法](#1-使用方法)
    - [1.1 安装scriptable](#11-安装scriptable)
    - [1.2 安装脚本](#12-安装脚本)
    - [1.3 使用](#13-使用)
  - [2 bilibili最近更新番剧列表](#2-bilibili最近更新番剧列表)
    - [2.1 效果预览](#21-效果预览)
    - [2.2 安装](#22-安装)
    - [2.3 参数](#23-参数)
  - [3 LOL近期赛事列表](#3-lol近期赛事列表)
    - [3.1 效果预览](#31-效果预览)
    - [3.2 安装](#32-安装)
  - [4 深蓝SL03车辆状态](#4-深蓝sl03车辆状态)
    - [4.1 效果预览](#41-效果预览)
    - [4.2 安装](#42-安装)
    - [4.2 参数](#42-参数)
    - [4.3 自定义车辆图片、LOGO、型号文本...](#43-自定义车辆图片logo型号文本)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
## <a name='1-使用方法'></a>1 使用方法
### <a name='1.1-安装scriptable'></a>1.1 安装scriptable
安装[Scriptable测试版](https://testflight.apple.com/join/uN1vTqxk) 或 直接安装app store 中的[scriptable](https://apps.apple.com/cn/app/scriptable/id1405459188) .
<!-- > 这里建议安装测试版，因为测试版支持更多特性，且我的脚本一般是以测试版为基础编写的。 -->

### <a name='1.2-安装脚本'></a>1.2 安装脚本

下方各组件的章节内有对应脚本的安装链接，点击下载后用`Scriptable APP`打开。选择`Add to my scripts`即可。


![](./preview/安装脚本.jpg)

### <a name='1.3-使用'></a>1.3 使用

1. 安装scriptable后会自动创建几个Demo脚本，其中有一个脚本是`Random Scriptable API`，先点击运行一次这个脚本。

2. 在桌面创建小组件 选择 `scriptable`

3. 编辑 小组件，点击`选取 script` 并选择前面导入的脚本。


## <a name='2-bilibili最近更新番剧列表'></a>2 bilibili最近更新番剧列表

### <a name='2.1-效果预览'></a>2.1 效果预览

![](./preview/bilibili预览.JPEG)

### <a name='2.2-安装'></a>2.2 安装

下载[安装脚本](https://gitee.com/zkytech/iOS14-widgets-for-scriptable/releases/download/1.0.1/bilibili.scriptable)后，用`scriptable`打开

### <a name='2.3-参数'></a>2.3 参数

小组件的parameter可以设置以下几个值

<table>
    <thead>
        <tr>
            <th>参数</th> <th>必填</th> <th>值/示例</th> <th>说明</th> 
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="3">type</td> <td rowspan="3">否</td> <td>番剧/global/进口</td> <td>进口番剧</td>
        </tr>
        <tr>
            <td>国创/cn/国产</td> <td>国产动画</td>
        </tr>
        <tr>
            <td>all/全部</td> <td>进口+国产</td>
        </tr>
        <tr>
            <td rowspan="2">onlyFollowed</td> <td rowspan = "2">否</td> <td>追番/true</td> <td>仅显示已追</td>
        </tr>
        <tr>
            <td>全部/false</td> <td>未追番 + 已追番</td>
        </tr>
        <tr>
            <td>uid</td> <td>当onlyFollowed为追番/true时 必填</td> <td>8165988</td> <td>Bilibili账号的UID，如果要设置仅显示追番，必须同时设定这个值。同时要设置空间公开显示番剧订阅</td>
        </tr>
    </tbody>
</table>

> 获取uid：B站APP - 我的 - 点击头像 - 详情

在小组件的编辑界面，按照以下格式进行配置

```javascript
// 配置格式
type,onlyFollowed,uid  //注意必须用英文逗号

// 示例
示例1: 国创,追番,8165988

示例2: cn,true,8165988

示例3: ,追番,8165988

示例4: ,true,8165988

示例5: 番剧,追番,8165988

示例6: global,true,8165988

示例7: 全部,追番,8165988

示例8: all,true,8165988
```

配置示例

![](preview/bilibili配置1.jpg)


![](preview/bilibili配置2.jpg)

## <a name='3-lol近期赛事列表'></a>3 LOL近期赛事列表

### <a name='3.1-效果预览'></a>3.1 效果预览

![](./preview/LOL%E9%A2%84%E8%A7%88.PNG)

### <a name='3.2-安装'></a>3.2 安装

下载[安装脚本](https://gitee.com/zkytech/iOS14-widgets-for-scriptable/releases/download/1.0.1/lol.scriptable)后，用`scriptable`打开

## <a name='4-深蓝sl03车辆状态'></a>4 深蓝SL03车辆状态

> 声明：脚本所展示的信息不保证准确无误，锁车、充电、电量、油量等信息仅供参考。由于脚本展示数据错误/误差造成的任何后果，本人概不负责。

### <a name='4.1-效果预览'></a>4.1 效果预览
桌面组件
![](./preview/SL03%E9%A2%84%E8%A7%88.jpg)
锁屏电量
![](./preview/SL03%E9%94%81%E5%B1%8F%E9%A2%84%E8%A7%88.jpg)
### <a name='4.2-安装'></a>4.2 安装

为了顺利打开下面的链接，**请在safari浏览器中打开本页面**。

1. 安装[Scriptable APP](https://apps.apple.com/cn/app/scriptable/id1405459188)
2. 下载[桌面组件安装脚本](https://gitee.com/zkytech/iOS14-widgets-for-scriptable/releases/download/1.0.1/SL03Widget.scriptable)后，用`Scriptable`打开
3. 安装scriptable后会自动创建几个Demo脚本，其中有一个脚本是`Random Scriptable API`，先点击运行一次这个脚本。

> 增程车型的油、电续航数据可能会变成-1、0，这种情况是深蓝APP的API问题，我无法解决，请知悉。
> 车型颜色需要收集比对各种颜色车子的抓包数据来判断是哪个字段，目前没有足够的数据支撑，所以统一白色。
### <a name='4.2-参数'></a>4.2 参数

- 桌面组件参数: `refresh_token`
- 锁屏组件参数: `模式`
  - 非必填，可以填写:`电`、`油`，默认显示电量
  - 请先设置好桌面组件再使用锁屏组件，否则锁屏组件无法获取到`refresh_token`

本组件需要获取refresh_token，操作过程涉及抓包。抓包方法我会讲，如果看不懂，请自行百度。以桌面组件为例，使用方法如下：
> 为了节省你的时间，<font color="red">请认真阅读下面的操作步骤</font>，并依照文档进行操作，<font color="red">跳过任何一个字都只会成倍地浪费你的时间</font>。为了帮助小白理解，最下面有抓包操作流程图。

1. 目前脚本运行依赖`iCloud`，为了确保脚本能够执行，请打开手机上的`iCloud`。
2. 安装[Stream APP](https://apps.apple.com/cn/app/stream/id1312141691)，并开启<font color="red"><b>HTTPS抓包</b></font>功能，必须要显示“<font color="blue">设置成功：CA证书已经安装且信任</font>”。
![](./preview/HTTPS%E6%8A%93%E5%8C%85%E5%BC%80%E5%90%AF%E7%95%8C%E9%9D%A2.PNG)
1. 点击`开始抓包`
2. 打开`深蓝`APP，进入控车页面，下拉刷新车辆状态，为了确保请求能被抓到，建议多刷几次。
3. 回到`Stream` APP，停止抓包
4. 进入抓包历史，查看刚刚生成的抓包记录，搜索`refresh`(注意搜索框里不要输入空格)，可以看到URI为`/appapi/v1/member/ms/refreshCacToken`的请求
5. 点击查看请求详情，查看`响应-响应主体-查看json`
6. 将`refresh_token`的<font color="red"><b>值</b></font>复制下来。比如你看到的是`"refresh_token":"ajj1f73b21DSUbias"`这里要复制保存的就是`ajj1f73b21DSUbias`，不要带引号。
7. 回到桌面，新增桌面组件，创建Scriptable中等大小组件。
8. **长按**上一步添加到桌面的组件进行**编辑**，脚本选择前面安装的`SL03Widget`，将前面复制的`refresh_token`值粘贴到小组件的`parameter`栏中。

> 锁屏组件目前只支持小号电量/油量圆环，添加方法请参考[视频教程](https://www.bilibili.com/video/BV19d4y1q7vi/?spm_id_from=333.337.search-card.all.click&vd_source=5b7cf4daa7d98506767a0757e0b64d77)

![](./preview/refresh_token%E6%8A%93%E5%8F%96%E6%B5%81%E7%A8%8B.JPEG)

### 4.3 自定义车辆图片、LOGO、型号文本...

![](/preview/SL03%E7%BB%84%E4%BB%B6%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD.JPEG)