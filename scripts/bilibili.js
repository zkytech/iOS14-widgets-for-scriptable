// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: video;
// iOS 14 widget --- bilibili最近更新番剧信息
// 支持大、中、小 组件
// 可通过传入参数( all/global/cn )来控制显示 全部番剧、国外番剧、国内番剧
// 如果组件崩溃或出现任何问题，请尝试重新下载 Release：https://github.com/zkytech/iOS14-widgets-for-scriptable/releases
// 如果仍无法解决，请反馈至：https://github.com/zkytech/iOS14-widgets-for-scriptable/issues
const LW = new ListWidget() // widget对象
LW.url = "bilibili://" // 点击小组件跳转到bilibili
let presentSize = "large" // 预览组件的大小,可设置为 large/medium/small
const mainColor = new Color("#FB7299")

let userDefineTarget = "global" // 用户界面传入widget的参数：全部/国外/国内/all/global/cn
let followLimited = false // 是否仅显示追番
const followType = 1 // 1 、2 对应 追番、追剧，目前追剧相关功能暂未实现.所以这里设为固定值1。该功能要求用户在B站APP - 我的 - 点击头像 - 点击 右上角菜单 - 空间设置 - 打开“公开显示订阅”开关
let uid = 8165988 // 用户的UID，配合追番功能使用
let params = [userDefineTarget, followLimited, uid]

if (config.runsInWidget) {
    presentSize = null
    params = args.widgetParameter ? args.widgetParameter.split(",") : []
}

let awp = params[0]
const awpMap = {
    "国产": "cn",
    "国创": "cn",
    "番剧": "global",
    "进口": "global",
    "全部": "all",
}

awp = awpMap[awp] ? awpMap[awp] : awp
if (awp === "global" || awp === "cn" || awp === "all") {
    userDefineTarget = awp
}

let flp = params[1] ? params[1] : false

const flpMap = {
    "追番": true,
    "全部": false,
    "true": true,
    "false": false
}
flp = flpMap[flp] ? flpMap[flp] : flp

if (flp === true || flp === false) {
    followLimited = flp
}

uid = params[2]

if ((uid === undefined || uid === null) && params.length != 1 && followLimited == true) {
    throw new Error("请在参数中填写uid\n\t参数填写范例：全部,追番,8165988\n\t其中逗号全部为英文逗号\n\n uid获取方式：B站APP - 我的 - 点击头像 - 详情")
}
/**
 * 加载番剧timeline
 * @param {string} range: 可选值 global、cn 分别代表 进口、国产
 */
async function loadItems(range) {
    let follows = []
    if (followLimited) {
        // 仅显示追番
        // 获取追番列表
        follows = await loadFollow(followType)
    }
    return new Request(`https://bangumi.bilibili.com/web_api/timeline_${range}`).loadJSON().then(res => {
        let allSeason = []
        res.result.forEach((val, i) => {
            allSeason = allSeason.concat(val.seasons)
        })
        return allSeason;
    }).then(seasons => {
        // 过滤港澳台 和 本周停更
        let result = seasons.filter(sea => sea.title.indexOf("港澳台") == -1 && sea.title.indexOf("僅限台灣地區") == -1  && Number(sea.delay) === 0)
        if (followLimited) {
            result = result.filter(sea => follows.indexOf(sea.title) !== -1)
        }
        return result
    })
}

/**
 * 追番/追剧列表
 * @param {number} followType : 可选值 1 、2 分别代表 追番、追剧
 */
function loadFollow(followType) {
    // 出于性能以及实际情况考虑，仅处理前30条追番
    return new Request(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${followType}&ps=30&vmid=${uid}`).loadJSON().then(res => {
        return res.data.list.map(fd => fd.title)
    })
}



/**
 * 加载season中的square_cover图片并保存至season.img
 * @param {Season} sea : 番剧信息
 */
async function loadImg(sea) {
    //加载图片  
    let req1 = new Request(sea.square_cover);
    let img = await req1.loadImage()
    sea.img = img
    return sea
}

const dayMap = {
    0: "周日",
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六"
}

/**
 * 获取番剧的更新日期（周一、周二、周三....）
 * @param {Season} sea : 番剧信息
 */
function getDay(sea) {
    return dayMap[new Date(sea.pub_ts * 1000).getDay()]
}



const globalSeasons = await loadItems("global")
const cnSeasons = await loadItems("cn")
let seasons = []

if (userDefineTarget === "all") {
    seasons = globalSeasons.concat(cnSeasons)
    seasons.sort((s1, s2) => Number(s1.pub_ts) - Number(s2.pub_ts))
} else if (userDefineTarget === "global") {
    seasons = globalSeasons
} else if (userDefineTarget === "cn") {
    seasons = cnSeasons
}

/**
 * 渲染日期分割线左右侧的线条
 * @param {*} dividerStack : 分割线容器
 * @param {*} dividerLineWidth : 分割线宽度
 * @param {*} dividerLineHeight : 分割线高度
 */
function addDividerLine(dividerStack, dividerLineWidth, dividerLineHeight) {
    const sideDividerStack = dividerStack.addStack()
    sideDividerStack.size = new Size(dividerLineWidth, dividerLineHeight)
    sideDividerStack.layoutVertically()
    sideDividerStack.addStack().size = new Size(dividerLineWidth, Math.floor(dividerLineHeight / 2) - 1)
    const sideDivider = sideDividerStack.addStack()
    sideDivider.size = new Size(dividerLineWidth, 1)
    sideDivider.backgroundColor = Color.white()
}

/**
 * 渲染日期分割线
 * @param {string} day : 日期文本
 * @param {number} dividerWidth : 分割线宽度
 * @param {number} dividerHeight : 分割线高度
 * @param {number} dividerLineWidth : 分割线左右侧线条的宽度
 * @param {number} dividerTxtWidth : 分割线中的日期文本的宽度
 */
function addDivider(day, dividerWidth, dividerHeight, dividerLineWidth, dividerTxtWidth) {
    const dividerStack = LW.addStack()
    // 渲染左侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight)
    // 日期文本容器
    const dividerTxtStack = dividerStack.addStack()
    // 渲染右侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight)
    // 渲染日期文本
    dividerStack.size = new Size(dividerWidth, dividerHeight)
    dividerTxtStack.size = new Size(dividerTxtWidth, dividerHeight)
    const dividerTxt = dividerTxtStack.addText(day)
    dividerTxt.font = Font.thinMonospacedSystemFont(dividerHeight)
    dividerTxt.textColor = Color.white()
}

/**
 * 渲染番剧列表
 */
async function renderList() {
    const stackHeight = 35 // 每条番剧信息的高度
    const timeTxtWidth = 50 // 时间字符串的宽度
    const imgWidth = stackHeight // 图片的宽度
    const itemSpacer = 5
    const contentTxtWidth = 250 // 番剧名称的宽度
    const dividerWidth = timeTxtWidth + imgWidth + contentTxtWidth + itemSpacer * 2 // 分割线的宽度
    const dividerTxtWidth = 40 // 分割线中的文本的宽度
    const dividerLineWidth = (dividerWidth - dividerTxtWidth) / 2 //左右两侧分割线的宽度
    const dividerHeight = 12 // 分割线的高度
    // 加载预览图
    for (i = 0; i < seasons.length; i++) {
        await loadImg(seasons[i])
    }
    let lastDay = getDay(seasons[0]) // 上一个番剧的更新日期
    addDivider(lastDay, dividerWidth, dividerHeight, dividerLineWidth, dividerTxtWidth)
    // 遍历番剧信息并渲染到列表
    seasons.forEach(sea => {
        const nowDay = getDay(sea) // 当前番剧的更新日期
        // 日期发生变化，添加日期分割线
        if (nowDay !== lastDay) {
            addDivider(nowDay, dividerWidth, dividerHeight, dividerLineWidth, dividerTxtWidth)
            lastDay = nowDay
        }
        const stack = LW.addStack()
        stack.spacing = itemSpacer
        // 该url会调起bilibili app到相应的番剧页面
        stack.url = `bilibili://bangumi/season/${sea.season_id}`
        stack.layoutHorizontally()
        const timeTxtStack = stack.addStack() // 时间文本容器
        timeTxtStack.centerAlignContent()
        const timeTxt = timeTxtStack.addText(sea.pub_time) // 时间文本
        timeTxtStack.size = new Size(timeTxtWidth, stackHeight)

        const imgStack = stack.addStack() // 图片容器

        imgStack.size = new Size(imgWidth, stackHeight)
        const stackImg = imgStack.addImage(sea.img) // 图片

        stackImg.cornerRadius = 5
        stackImg.imageSize = new Size(stackHeight, stackHeight)

        const contentTxtStack = stack.addStack() // 番剧标题容器
        contentTxtStack.layoutVertically()
        contentTxtStack.centerAlignContent()
        contentTxtStack.size = new Size(contentTxtWidth, stackHeight)
        const contentTxt = contentTxtStack.addText(sea.title) // 番剧标题
        const indexTxt = contentTxtStack.addText(sea.pub_index) // 第几话
        contentTxt.font = Font.boldRoundedSystemFont(15)
        contentTxt.textColor = Color.white()
        indexTxt.font = Font.thinMonospacedSystemFont(10)
        indexTxt.textColor = Color.white()
        timeTxt.font = Font.thinMonospacedSystemFont(18)
        timeTxt.textColor = Color.white()
        if (Number(sea.is_published) == 0) {
            // 番剧待更新，显示为灰色
            contentTxt.textColor = Color.gray()
            indexTxt.textColor = Color.gray()
            timeTxt.textColor = Color.gray()
        }
        LW.addSpacer(1)
    })

}

/**
 * 渲染最近的maxN条番剧信息，包含已更新和待更新番剧
 * @param {number} maxN:最大可容纳番剧数目 
 */
async function renderCutList(maxN) {
    let ti = 0
    seasons.forEach((sea, i) => {
        if (sea.is_published) {
            ti = i
        }
    })
    if (ti < seasons.length - 1) {
        ti = ti + 1
    }
    let ei = ti + Math.floor(maxN / 2) // 显示Math.floor(maxN/2)条待更新番剧信息
    let si = ei - maxN
    si = si >= 0 ? si : 0
    if (ei > seasons.length) {
        ei = seasons.length
    }
    seasons = seasons.slice(si, ei)
    await renderList()
}

if (config.widgetFamily == "large" || presentSize == "large") {
    const titleSize = 36
    // 大号插件  

    const titleTxt = LW.addText("最近更新")
    //     titleStack.addSpacer(10)
    let contentType = "番剧"
    if (userDefineTarget == "global") {
        contentType = "番剧"
    } else if (userDefineTarget == "cn") {
        contentType = "国创"
    } else if (userDefineTarget == "all") {
        contentType = "全部"
    }

    const subTxt = LW.addText(contentType)
    subTxt.textColor = Color.white()
    subTxt.font = Font.thinMonospacedSystemFont(titleSize / 3)
    titleTxt.font = Font.boldRoundedSystemFont(titleSize)
    titleTxt.textColor = Color.white()
    LW.addSpacer(10);
    await renderCutList(7)
} else if (config.widgetFamily == "medium" || presentSize == "medium") {
    // 中号的插件
    await renderCutList(3)
} else if (config.widgetFamily == "small" || presentSize == "small") {
    // 小号的插件
    let target = seasons[0]
    seasons.forEach(sea => {
        if (Number(sea.is_published) == 1) {
            target = sea
            return false
        } else {
            return true
        }
    })
    // 该url会调起bilibili app到相应的番剧页面
    LW.url = `bilibili://bangumi/season/${target.season_id}`
    await loadImg(target)
    LW.backgroundImage = target.img
    const txt = LW.addText(target.title)
    txt.textColor = mainColor
    const indexTxt = LW.addText(target.pub_index)
    indexTxt.font = Font.boldRoundedSystemFont(10)
    indexTxt.textColor = mainColor
    txt.font = Font.boldRoundedSystemFont(20)
}




LW.backgroundColor = mainColor
// LW.backgroundGradient = gradient

if (!config.runsInWidget) {
    if (presentSize == "large") {
        await LW.presentLarge()
    }
    if (presentSize == "medium") {
        await LW.presentMedium()
    }
    if (presentSize == "small") {
        await LW.presentSmall()
    }
}

Script.setWidget(LW)

Script.complete()

/**
 * 自动更新
 */
async function update(){
    const fm = FileManager.iCloud()
    const folder = fm.documentsDirectory()
    const req = new Request("https://raw.githubusercontent.com/zkytech/iOS14-widgets-for-scriptable/master/scripts/bilibili.js")
    let scriptTxt =await req.loadString()
    const filename = "/bilibili.js"
    fm.writeString(folder + filename, scriptTxt)
}


await update()