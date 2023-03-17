/**
 * iOS widget --- 长安深蓝SL03桌面小组件
 * 传入以下参数: refresh_token
 * 参数获取方法见文档:https://github.com/zkytech/iOS14-widgets-for-scriptable#4-%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81
 * - 组件依赖深蓝APP登录信息（refresh_token）
 * - 本组件仅用于学习交流
 * - 本组件为开源软件，不会进行收费！！！
 * 
 * 
 * 
*/

const LW = new ListWidget() // widget对象

let presentSize = "medium" // 预览组件的大小
// const mainColor = new Color("#30336b")
const mainColor = new Color("#000000")
const car_img_url = "https://qiniu.zkytech.top/SL03/img/%E4%BE%A7%E9%9D%A2%E7%99%BD%E8%89%B2.PNG"
let project_id=''
let global_refresh_token=''
if (config.runsInWidget) {  
    const params = args.widgetParameter ? args.widgetParameter.split(",") : []
    global_refresh_token = params[0]
}
presentSize = "medium"
await renderCarStatus()

// 获取carId
async function getCarId(token){
    console.log("开始获取carId")
    const req = new Request("https://app-api.deepal.com.cn/appapi/v1/message/msg/cars")
    req.method = "POST"
    req.body = JSON.stringify({
        "vcs-app-id" : "inCall",
        "token" : token,
        "type" : "1"
    })
    req.headers = {
        "Content-Type" :"application/json"
    }
    const result = await req.loadJSON()
    if(result["success"]){
        return result["data"][0].carId
    }else{
        return null
    }
}

// 获取token
async function getToken(){
    console.log("开始获取token")
    const fm = FileManager.iCloud()
    const refresh_token_file_path = fm.documentsDirectory() + "/refresh_token"
    fm.downloadFileFromiCloud(refresh_token_file_path)
    let local_refresh_token = ""
    if(fm.fileExists(refresh_token_file_path)){
        local_refresh_token = fm.readString(refresh_token_file_path)
    }
    const req = new Request("https://app-api.deepal.com.cn/appapi/v1/member/ms/refreshCacToken")
    req.method = "POST"
    req.body = JSON.stringify({
        "refreshToken":local_refresh_token != "" ?local_refresh_token:global_refresh_token
    })
    req.headers = {
       "Content-Type" :"application/json"
    }
    const result = await req.loadJSON()
    if(result["success"]){
        const refresh_token = result["data"]["refresh_token"]
        const access_token = result["data"]["access_token"]
        fm.writeString(refresh_token_file_path,refresh_token)
        return access_token
    }else{
        console.error("token refresh failed")
        if(global_refresh_token && global_refresh_token != local_refresh_token && result["success"] == false){
          fm.writeString(refresh_token_file_path,global_refresh_token)
          return getToken()
        }
        
        return null
    }

}

// 发出命令刷新车辆数据(异步)--无效
async function refreshCarData(project_id){
    console.log("开始刷新车辆状态数据")
    const stm = new Date().getTime()
    const req = new Request(`https://cbd-api.changan.com.cn:9092/v3/projects/${project_id}/collect?stm=${stm}`)
    req.method = "POST"
    await req.loadString()
}

// 获取车辆状态数据
async function getCarStatus(token,car_id){
    console.log("开始获取车辆状态数据")
    const req2 = new Request(`https://m.iov.changan.com.cn/app2/api/car/data?keys=*&carId=${car_id}&token=${token}`)
    req2.method = "POST"
    const car_status = await req2.loadJSON()
    if (car_status["success"]){
        return car_status["data"]
    }else{
        return null
    }
}

// 获取车辆基本信息
async function getCarInfo(token,car_id){
  console.log("开始获取车辆基本信息数据")
  const req = new Request(`https://m.iov.changan.com.cn/app2/api/v2/car/detail?carId=${car_id}&token=${token}`)
  req.method = "GET"
  const car_info = await req.loadJSON()
  if(car_info["success"]){
      return car_info["data"] 
  }else{
      return null
  }
      
}

// 获取车辆位置信息
async function getCarLocation(token,car_id){
  console.log("开始获取车辆位置信息")
  const req = new Request(`https://m.iov.changan.com.cn/appserver/api/cardata/getCarLocation?carId=${car_id}&mapType=GCJ02&token=${token}`)
  req.method = "POST"
  const car_location = await req.loadJSON()
  if(car_location["success"]){
      return car_location["data"]  
  }else{
      return null
  }
}

// 绘制电量条
function drawPowerImage(remain_power,remain_power_mile){
    const draw = new DrawContext()
    const width = 300
    const height = 18
    draw.size = new Size(width,height)
    draw.setFillColor(Color.white())
    draw.fillRect(new Rect(0,0,width,height))
    draw.setFillColor(Color.green())
    draw.fillRect(new Rect(0,0,width*(Number(remain_power)/100),height))
        draw.setTextAlignedCenter()
    draw.setFont(new Font("Avenir-Book",17))
    draw.drawTextInRect(`${remain_power}%\t${remain_power_mile} km`, new Rect(0,0,width,height))

    const img = draw.getImage()
     // QuickLook.present(img, false)
      return img
}



// 从URL加载图片
async function loadImage(url) {
		const req = new Request(url)
		return await req.loadImage()
}



async function renderCarStatus(){
     const token = await getToken()
    console.log("token:" + token)
     const car_id = await getCarId(token)
    console.log("car_id:" + car_id)
     // await refreshCarData()  
     const car_status = await getCarStatus(token,car_id)
     const car_info = await getCarInfo(token,car_id)
     const car_location = await getCarLocation(token,car_id)
    
        if(car_status != null && car_info != null && car_location != null){
            // 数据更新时间
            const update_time = car_status.terminalTime
            // 总里程
            const total_odometer = Math.round(car_status.totalOdometer)
            // 车内温度
            const vehicle_temperature = Math.round(car_status.vehicleTemperature)
            // 剩余里程
            const remained_power_mile = Math.round(car_status.remainedPowerMile)
            // 剩余电量
            const remain_power = Math.round(car_status.remainPower)
            // 车辆名称
            const car_name = car_info.carName
            // 车辆配置名称，比如：515km
            const conf_name = car_info.confName.split("，")[2]
            // 车牌号
            const plate_number = car_info.plateNumber
            // 型号
            const series_name = car_info.seriesName
            // 车辆位置
            const location_str = car_location.addrDesc
            // 车门状态
            const lock_status = car_status.driverDoorLock == 0 && car_status.passengerDoorLock == 0
            // 是否为增程车型
            const is_mix = car_status.remainedOilMile != undefined
            // 增城续航里程
            const remained_oil_mile = is_mix ? Math.round(car_status.remainedOilMile) : ""
            
            //const power_img = LW.addImage(drawPowerImage(remain_power,remained_power_mile))
            //power_img.cornerRadius=5
            //power_img.imageSize=new Size(300,18) 
            /**
              |    col0 |   col1_0|   col1_1 |
            * |---------|---------|----------|
            * |         | 总里程   | 续航里程  |
            * | 车辆图片 |  xxx公里 |   xx%   |
            * |         | t_space0| t_space1  |
            * | ------- |----------|---------|
            * | 车辆名称 |  温度     | 位置     |
            * | ------- | xx摄氏度. | xxx省xxx市 |
              |         | t_space2 | t_space3  |
            * | 车牌号   |---------------------｜
              ｜        ｜ 数据更新时间          |
              | col0   |        col1           |
            */
            const container = LW.addStack()
            container.layoutHorizontally()
            container.spacing = 15
            // 第1列
            const col0 = container.addStack()
            col0.layoutVertically()
            col0.spacing = 6
            col0.size = new Size(110,0)
            // 车辆图片
            const car_img =await loadImage(car_img_url)
            const car_stack = col0.addStack()
            
            const img_container = car_stack.addImage(car_img)
           
            img_container.imageSize = new Size(100,50)
            // 车辆名称、型号
            const car_name_container = col0.addStack()
            
            car_name_container.layoutHorizontally()
            car_name_container.spacing = 3
            car_name_container.bottomAlignContent()

            // 车辆名称
            const car_name_text = car_name_container.addText(car_name)
            car_name_text.font = Font.boldSystemFont(15)
            car_name_text.textColor = Color.white()

            //car_name_text.minimumScaleFactor = 1
            const lock_icon = car_name_container.addImage(lock_status ? SFSymbol.named("lock.fill").image:SFSymbol.named("lock.open.fill").image)
            // = SFSymbol.named("lock.open.fill")
            lock_icon.tintColor = lock_status ? new Color("#27ae60") : new Color("#c0392b")
            lock_icon.imageSize = new Size(15,15)
            const car_seires_container = col0.addStack()
            // 车辆logo
            const logo = car_seires_container.addImage(await loadImage("https://deepal.com.cn/202303112321/share_logo.png"))
            logo.imageSize = new Size(12, 12)
            // 车辆型号
            const car_series_text = car_seires_container.addText(series_name + " " + conf_name)
            car_series_text.font = Font.mediumSystemFont(11)
            car_series_text.textColor = new Color("#bdc3c7")
            //car_series_text.minimumScaleFactor = 0.5

            
            // 车牌号
            const plate_number_text = col0.addText(plate_number)
            plate_number_text.font = Font.thinMonospacedSystemFont(10)
            plate_number_text.textColor = new Color("#bdc3c7")
            //car_series_text.minimumScaleFactor = 0.5   
                  
            // 第2列
            const col1 = container.addStack()
            
            col1.layoutVertically()
            col1.spacing = 8
            const col1_row0 = col1.addStack()
            const col1_row1 = col1.addStack()
            col1_row1.layoutHorizontally()
            col1_row1.spacing = 5
            

            const refresh_icon = col1_row1.addImage(SFSymbol.named("arrow.clockwise").image)
            refresh_icon.tintColor = Color.gray()
            refresh_icon.imageSize = new Size(13, 13)
            const refresh_time_text = col1_row1.addText(update_time)
            refresh_time_text.textColor = Color.gray()
            refresh_time_text.font = Font.thinMonospacedSystemFont(13)
            
              
            col1_row0.layoutHorizontally()
            col1_row0.spacing = 15
            const col1_row0_row0 = col1_row0.addStack()
            const col1_row0_row1 = col1_row0.addStack()
            col1_row0_row0.layoutVertically()
            col1_row0_row1.layoutVertically()
            col1_row0_row0.spacing = 8
            col1_row0_row1.spacing = 8
            const t_space0 = col1_row0_row0.addStack()
            const t_space2 = col1_row0_row0.addStack()
            const t_space1 = col1_row0_row1.addStack()
            const t_space3 = col1_row0_row1.addStack()
            t_space0.layoutVertically()
            t_space1.layoutVertically()
            t_space2.layoutVertically()
            t_space3.layoutVertically()
            
            const header0 = t_space0.addText("总里程")
            const header1 = t_space1.addText("电池续航")
            const header2 = t_space2.addText(is_mix ? "油箱续航":"车内温度")
            const header3 = t_space3.addText("位置")
            const content_container0 = t_space0.addStack()
            const content_container1 = t_space1.addStack()
            const content_container2 = t_space2.addStack()
            const content_container3 = t_space3.addStack();
            
            [content_container0,content_container1,content_container2,content_container3].map(c => {c.spacing=5;c.bottomAlignContent()})
            const content0 = content_container0.addText(total_odometer + "")
            const unit0 = content_container0.addText("km")
            const content1 = content_container1.addText(remained_power_mile + "")
            const unit1 = content_container1.addText("km")
            const content2 = content_container2.addText(is_mix ? remained_oil_mile + "" : vehicle_temperature + "" )
            const unit2 = content_container2.addText(is_mix ? "km":"°C")
            const content3 = content_container3.addText(location_str)
            const header_list = [header0,header1,header2,header3]
            const content_list = [content0,content1,content2,content3]
            const unit_list = [unit0,unit1,unit2]
            header_list.map(h => {
                h.font = Font.thinMonospacedSystemFont(12)
                h.textColor = Color.gray()
            })
            content_list.map(c => {
                c.font = Font.boldSystemFont(18)
                c.textColor = Color.white()
                c.minimumScaleFactor = 0.3
            })
            unit_list.map(u => {
                u.font = Font.mediumMonospacedSystemFont(14)
                u.textColor = Color.gray()
            })
            
            
        
                
          }
        console.log("渲染结束")
    
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
    const req = new Request("https://cdn.jsdelivr.net/gh/zkytech/iOS14-widgets-for-scriptable@master/scripts/SL03.js")
    let scriptTxt =await req.loadString()
    const filename = `/${Script.name()}.js`
    fm.writeString(folder + filename, scriptTxt)
}


await update()