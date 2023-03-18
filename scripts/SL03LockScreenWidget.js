/**
 * iOS widget(锁屏) --- 长安深蓝SL03电量
 * 项目地址: https://github.com/zkytech/iOS14-widgets-for-scriptable
 *
 * 传入以下参数: refresh_token
 * 参数获取方法见文档: https://gitee.com/zkytech/iOS14-widgets-for-scriptable#4-%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81
 * - 组件依赖深蓝APP登录信息（refresh_token）
 * - 本组件仅用于学习交流
 * - 本组件为开源软件，不会进行收费！！！
 *
 *
 *
 *
 */
const params = args.widgetParameter ? args.widgetParameter.split(",") : [];
param_refresh_token = params[0];
const LW = new ListWidget(); // widget对象
const {
  getCarId,
  getToken,
  refreshCarData,
  getCarStatus,
  getCarInfo,
  getCarLocation,
} = await getService(
  "SL03Api",
  "https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/master/scripts/lib/service/SL03Api.js",
  false
);
const { update } = await getService(
  "UpdateScript",
  "https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/master/scripts/lib/service/UpdateScript.js",
  false
);
const { drawArc } = await getService(
  "DrawShape",
  "https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/master/scripts/lib/service/DrawShape.js",
  false
);

const token = await getToken(param_refresh_token);
const car_id = await getCarId(token);
const car_status = await getCarStatus(token, car_id);
// 剩余电量
const remain_power = car_status.remainPower;


const circle = await drawArc(LW, remain_power);

const sf_car = circle.addImage(SFSymbol.named("car.rear.fill").image);
sf_car.imageSize = new Size(26, 26);
sf_car.tintColor = Color.white();

LW.presentAccessoryCircular();

Script.setWidget(LW);
Script.complete();
// 更新脚本代码
update("https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/master/scripts/SL03LockScreenWidget.js")

async function loadText(textUrl) {
  const req = new Request(textUrl);
  return await req.load();
}

async function getService(name, url, forceDownload) {
  const fm = FileManager.local();
  const scriptDir = module.filename.replace(
    fm.fileName(module.filename, true),
    ""
  );
  let serviceDir = fm.joinPath(scriptDir, "lib/service/" + name);

  if (!fm.fileExists(serviceDir)) {
    fm.createDirectory(serviceDir, true);
  }

  let libFile = fm.joinPath(scriptDir, "lib/service/" + name + "/index.js");

  if (fm.fileExists(libFile) && !forceDownload) {
    fm.downloadFileFromiCloud(libFile);
  } else {
    // download once
    let indexjs = await loadText(url);
    fm.write(libFile, indexjs);
  }

  let service = importModule("lib/service/" + name);

  return service;
}
