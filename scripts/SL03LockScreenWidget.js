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
 */
// 开发时切换到dev分支
const branch = "dev"
const force_download = branch != "master"
// Boxjs自动获取token，需配合Quantumult X使用

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
if(branch == "master"){
  await update(`https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/SL03LockScreenWidget.js`)
}

const params = args.widgetParameter ? args.widgetParameter.split(",") : [""];
param_refresh_token = params[0].trim();
mode = "电";
if(params.length > 1) mode = params[1].trim() == "油"?"油":"电";
const LW = new ListWidget(); // widget对象


const token = await getToken(param_refresh_token);
const car_id = await getCarId(token);
const car_status = await getCarStatus(token, car_id);
// 剩余电量
const remain_power =car_status.remainPower ==undefined || car_status.remainPower < 0 ? 0 : car_status.remainPower;
const remained_oil_mile = car_status.RemainedOilMile
const remain_oil = (remained_oil_mile == undefined || remained_oil_mile < 0 ? 0:remained_oil_mile) / 846 * 100


const circle = await drawArc(LW, mode == "电" ? remain_power : remain_oil);
const car_symbol_name = mode == "电" ? "car.rear.fill" : "fuelpump.fill"
const sf_car = circle.addImage(SFSymbol.named(car_symbol_name).image );
sf_car.imageSize = new Size(26, 26);
sf_car.tintColor = Color.white();

LW.presentAccessoryCircular();

Script.setWidget(LW);
Script.complete();

async function loadText(textUrl) {
  const req = new Request(textUrl);
  return await req.load();
}

async function getService(name, url, force_download) {
  const fm = FileManager.iCloud();
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
    fm.downloadFileFromiCloud(lib_file);
  } else {
    // download once
    let indexjs = await loadText(url);
    fm.write(lib_file, indexjs);
  }

  let service = importModule("lib/service/" + name);

  return service;
}

