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
const $ = new Env("深蓝")

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
await update(`https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/SL03LockScreenWidget.js`)


const params = args.widgetParameter ? args.widgetParameter.split(",") : [""];
param_refresh_token = params[0].trim();
if (param_refresh_token == "") param_refresh_token = $.getdata("refresh_token")
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

async function getService(name, url, forceDownload) {
  const fm = FileManager.iCloud();
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

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
