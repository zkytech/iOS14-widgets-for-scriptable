// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;


/**
 * iOS widget(锁屏) --- 长安深蓝SL03电量
 * 联系邮箱: zhangkunyuan@hotmail.com
 * 项目地址: https://github.com/zkytech/iOS14-widgets-for-scriptable
 *
 * 传入以下参数: refresh_token,模式
 *    其中"模式"为可选参数，值为：油/电 ,默认为电。
 * 
 * 
 * 参数获取方法见文档: https://gitee.com/zkytech/iOS14-widgets-for-scriptable#4-%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81
 * - 组件依赖深蓝APP登录信息（refresh_token）
 * - 本组件仅用于学习交流
 * - 本组件为开源软件，不会进行收费！！！
 *
 * 
 * - 不要在脚本里填token，所有参数必须通过组件设置界面填写
 */
// 开发时切换到dev分支
const branch = "dev"
const force_download = branch != "master"
const project_name = "深蓝小组件_by_zkytech"

const {
    getCarId,
    getToken,
    refreshCarData,
    getCarStatus,
    getCarInfo,
    getCarLocation,
  } = await getService(
    "SL03Api",
    `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/SL03Api.js`,
    force_download
  );
  const { update } = await getService(
    "UpdateScript",
    `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/UpdateScript.js`,
    force_download
  );
  const { drawArc } = await getService(
    "DrawShape",
    `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/DrawShape.js`,
    force_download
  );
  let {getDataFromSettings,saveDataToSettings}  = await getService(
    "Settings",
    `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/Settings.js`,
    force_download
  ); 
  
  function getSetting(key) {return getDataFromSettings(project_name,key)}
  function saveSetting(key,value) {return saveDataToSettings(project_name,key,value)}
  


if(branch == "master"){
  await update(`https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/SL03LockScreenWidget.js`)
}

const params = args.widgetParameter ? args.widgetParameter.split(",") : [""];
const param_refresh_token = params.length > 0 ? params[0].trim() : "";
let mode = "电";
if(params.length > 1) mode = params[1].trim() == "油"?"油":"电";
const LW = new ListWidget(); // widget对象
if(param_refresh_token && !getRefreshToken()){
  saveSetting("refresh_token",param_refresh_token)
}

let token
let refresh_token = getRefreshToken()
const token_result = await getToken(refresh_token);
if(token_result == null){
  token = null
}else{
  refresh_token = token_result.refresh_token
  token = token_result.access_token
  if(refresh_token != "" && refresh_token != undefined && refresh_token != null){
    console.log("保存新的refresh_token")
    saveSetting("refresh_token",refresh_token)
  }
}

const car_id = await getCarId(token);
const car_status = await getCarStatus(token, car_id);
if(car_status && car_id){
  // 剩余电量
  let remain_power =car_status.remainPower ==undefined || car_status.remainPower < 0 ? 0 : car_status.remainPower;
  let remained_oil_mile = car_status.RemainedOilMile
  // 增程车型存在API数据错乱的问题，为了避免受到API错误数据的影响自动取上一次获取到的合理数据
  if(remain_power && remain_power > 0){
    saveSetting("remain_power", remain_power)
  }else{
    remain_power = getSetting("remain_power")
    remain_power = remain_power ? remain_power : 0
  }
  if(remained_oil_mile && remained_oil_mile > 0){
    saveSetting("remained_oil_mile", remained_oil_mile)
  }else{
    remained_oil_mile = getSetting("remained_oil_mile")
    remained_oil_mile = remained_oil_mile ? remained_oil_mile : 0
  }

  const remain_oil = remained_oil_mile / 846 * 100


  const circle = await drawArc(LW, mode == "电" ? remain_power : remain_oil);
  const car_symbol_name = mode == "电" ? "car.rear.fill" : "fuelpump.fill"
  const sf_car = circle.addImage(SFSymbol.named(car_symbol_name).image );
  sf_car.imageSize = new Size(26, 26);
  sf_car.tintColor = Color.white();
}

if (token == "" || token == null || token == undefined){
  console.error("请先配置refresh_token");
  LW.addText("请先配置refresh_token");
}


LW.presentAccessoryCircular();

Script.setWidget(LW);
Script.complete();

async function loadText(textUrl) {
  const req = new Request(textUrl);
  return await req.load();
}

async function getService(name, url, force_download) {
  const fm = getFileManager()
  const script_dir = module.filename.replace(
    fm.fileName(module.filename, true),
    ""
  );
  let service_dir = fm.joinPath(script_dir, "lib/service/" + name);

  if (!fm.fileExists(service_dir)) {
    fm.createDirectory(service_dir, true);
  }

  let lib_file = fm.joinPath(script_dir, "lib/service/" + name + "/index.js");

  if (fm.fileExists(lib_file) && !force_download) {
    try{
      fm.downloadFileFromiCloud(lib_file);
    }catch(e){

    }
  } else {
    // download once
    let indexjs = await loadText(url);
    fm.write(lib_file, indexjs);
  }

  let service = importModule("lib/service/" + name);

  return service;
}



function getRefreshToken(){
  const fm = getFileManager()
  const script_dir = fm.documentsDirectory()
  const old_refresh_token_path = fm.joinPath(script_dir, "refresh_token");
  // 处理历史遗留问题，将老版本的refresh_token文件统一用新的settings.json替代
  if(fm.fileExists(old_refresh_token_path)){
    const old_refresh_token = fm.readString(old_refresh_token_path)
    saveSetting("refresh_token",old_refresh_token)
    fm.remove(old_refresh_token_path)
  }
  let refresh_token = getSetting("refresh_token")
  return refresh_token
}

function getFileManager(){
  let fm;
  try {
    fm = FileManager.iCloud();
  } catch {
    fm = FileManager.local();
  }
  return fm
}