// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;
/**
 * iOS widget --- 长安深蓝SL03桌面组件 & 锁屏组件
 * 项目地址: https://github.com/zkytech/iOS14-widgets-for-scriptable
 * 联系邮箱: zhangkunyuan@hotmail.com
 *
 *
 * 参数获取和填写方法见文档: https://gitee.com/zkytech/iOS14-widgets-for-scriptable#4-%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81
 * - 组件依赖深蓝APP登录信息（refresh_token）
 * - 本组件仅用于学习交流
 * - 本组件为开源软件，不会进行收费！！！
 *
 *
 * - 不要在脚本代码里修改任何参数，所有参数必须通过组件设置界面填写
 */
try {
  // 开发环境切换到dev分支，生产环境用master分支
  const branch = "master";
  const force_download = true;
  const project_name = "深蓝小组件_by_zkytech";
  // const force_download = branch != "master";
  const url_scheme = "qiyuancar://";

  class WidgetTheme {
    constructor(name, backgroundColor, primaryTextColor, secondaryTextColor) {
      this.name = name;
      this.backgroundColor = backgroundColor;
      this.primaryTextColor = primaryTextColor;
      this.secondaryTextColor = secondaryTextColor;
    }
  }
  const themes = [
    new WidgetTheme(
      "跟随系统",
      Color.dynamic(Color.white(), Color.black()),
      Color.dynamic(Color.black(), Color.white()),
      Color.dynamic(new Color("#4b4b4b"), new Color("#bfbfbf"))
    ),
    new WidgetTheme(
      "白色主题",
      Color.white(),
      Color.black(),
      new Color("#4b4b4b")
    ),
    new WidgetTheme(
      "黑色主题",
      Color.black(),
      Color.white(),
      new Color("#bfbfbf")
    ),
    new WidgetTheme(
      "EVA初号机主题",
      new Color("#6c5ce7"),
      new Color("#00b894"),
      new Color("#00b894")
    ),
  ];

  const {
    getCarId,
    getToken,
    refreshCarData,
    getCarStatus,
    getCarInfo,
    getCarLocation,
    getChargeStatus,
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
  let { getDataFromSettings, saveDataToSettings } = await getService(
    "Settings",
    `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/Settings.js`,
    force_download
  );
  function getSetting(key) {
    return getDataFromSettings(project_name, key);
  }
  function saveSetting(key, value) {
    return saveDataToSettings(project_name, key, value);
  }

  if (branch == "master") {
    // 更新组件代码
    await update(
      `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/SL03Widget.js`
    );
  }

  if (config.runsInWidget) {
    try {
      switch (config.widgetFamily) {
        case "medium":
          await renderMediumWidget();
          break;
        case "accessoryCircular":
          await renderAccessoryCircularWidget();
          break;
        default:
          await renderWrongSizeAlert();
          break;
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    // 在Scriptable中运行，弹出设置窗口
    await askSettings();
  }

  /**
   * 小号锁屏组件
   * 接受参数 - 显示模式，油/电
   */
  async function renderAccessoryCircularWidget() {
    const { drawArc } = await getService(
      "DrawShape",
      `https://gitee.com/zkytech/iOS14-widgets-for-scriptable/raw/${branch}/scripts/lib/service/DrawShape.js`,
      force_download
    );
    const params = args.widgetParameter
      ? args.widgetParameter.split(",")
      : [""];
    let mode = "电";
    if (params.length >= 1) mode = params[0].trim() == "油" ? "油" : "电";
    const LW = new ListWidget(); // widget对象
    LW.url = url_scheme;
    let token;
    let refresh_token = getRefreshToken();
    const token_result = await getToken(refresh_token);
    if (token_result == null) {
      token = null;
    } else {
      refresh_token = token_result.refresh_token;
      token = token_result.access_token;
      if (
        refresh_token != "" &&
        refresh_token != undefined &&
        refresh_token != null
      ) {
        console.log("保存新的refresh_token");
        saveSetting("refresh_token", refresh_token);
      }
    }

    const car_id = await getCarId(token);
    const car_status = await getCarStatus(token, car_id);
    const charge_status = await getChargeStatus(token, car_id);
    // 可以确定 状态码3 = “未充电”
    // 状态码1 = “充电中”
    // 状态码2 目前未知
    const is_charging = charge_status.chrgStatus == "1";
    if (car_status && car_id) {
      // 剩余电量
      let remain_power =
        car_status.remainPower == undefined || car_status.remainPower < 0
          ? 0
          : car_status.remainPower;
      let remained_oil_mile = car_status.RemainedOilMile;
      // 增程车型存在API数据错乱的问题，为了避免受到API错误数据的影响自动取上一次获取到的合理数据
      if (remain_power && remain_power > 0) {
        saveSetting("remain_power", remain_power);
      } else {
        remain_power = getSetting("remain_power");
        remain_power = remain_power ? remain_power : 0;
      }
      if (remained_oil_mile && remained_oil_mile > 0) {
        saveSetting("remained_oil_mile", remained_oil_mile);
      } else {
        remained_oil_mile = getSetting("remained_oil_mile");
        remained_oil_mile = remained_oil_mile ? remained_oil_mile : 0;
      }

      const remain_oil = (remained_oil_mile / 846) * 100;
      const circle = await drawArc(
        LW,
        mode == "电" ? remain_power : remain_oil
      );

      const car_symbol_name =
        mode == "电"
          ? is_charging
            ? "bolt.car.fill"
            : "car.rear.fill"
          : "fuelpump.fill";
      const sf_car = circle.addImage(SFSymbol.named(car_symbol_name).image);
      sf_car.imageSize = new Size(29, 29);
      sf_car.tintColor = Color.white();
    }

    if (token == "" || token == null || token == undefined) {
      console.error("请先配置refresh_token");
      LW.addText("请先配置refresh_token");
    }

    LW.presentAccessoryCircular();

    Script.setWidget(LW);
    Script.complete();
  }

  /**
   * 中等桌面组件
   * 接受参数 - refresh_token
   */
  async function renderMediumWidget() {
    const params = args.widgetParameter
      ? args.widgetParameter.split(",")
      : [""];
    const theme = getTheme();
    param_refresh_token = params.length > 0 ? params[0].trim() : "";
    if (param_refresh_token && !getRefreshToken()) {
      saveSetting("refresh_token", param_refresh_token);
    }
    const LW = new ListWidget(); // widget对象
    LW.url = url_scheme;
    LW.backgroundColor = theme.backgroundColor;
    let token;
    let refresh_token = getRefreshToken();
    const token_result = await getToken(refresh_token);
    if (token_result == null) {
      token = null;
    } else {
      refresh_token = token_result.refresh_token;
      token = token_result.access_token;
      if (
        refresh_token != "" &&
        refresh_token != undefined &&
        refresh_token != null
      ) {
        console.log("保存新的refresh_token");
        saveSetting("refresh_token", refresh_token);
      }
    }
    const car_id = await getCarId(token);
    // await refreshCarData()
    const car_status = await getCarStatus(token, car_id);
    const car_info = await getCarInfo(token, car_id);
    const car_location = await getCarLocation(token, car_id);
    const charge_status = await getChargeStatus(token, car_id);
    if (car_status != null && car_info != null && car_location != null) {
      // 数据更新时间
      const update_time = car_status.terminalTime;
      // 总里程
      const total_odometer = Math.round(car_status.totalOdometer);
      // 车内温度
      const vehicle_temperature = Math.round(car_status.vehicleTemperature);
      // 剩余里程
      let remained_power_mile = Math.round(car_status.remainedPowerMile);
      // 剩余电量
      const remain_power = Math.round(car_status.remainPower);
      // 车辆名称
      const car_name = car_info.carName;
      // 车辆配置名称，比如：515km
      const conf_name = car_info.confName
        ? car_info.confName.split("，")[2]
        : "";
      // 车牌号
      const plate_number = car_info.plateNumber;
      // 型号
      const series_name = car_info.seriesName;
      // 车辆位置
      const location_str = car_location.addrDesc;
      // 车门状态
      const lock_status =
        car_status.driverDoorLock == 0 && car_status.passengerDoorLock == 0;
      // 是否为增程车型
      const is_mix = car_status.remainedOilMile != undefined;
      // 是否在充电
      const is_charging = charge_status.chrgStatus != "3";
      // 经度
      const lng = car_location.lng;
      // 纬度
      const lat = car_location.lat;

      // 增城续航里程
      let remained_oil_mile = is_mix
        ? Math.round(car_status.remainedOilMile)
        : 0;
      // 增程车型存在API数据错乱的问题，这里为了受到API错误数据的影响自动取上一次获取到的合理数据
      if (remain_power && remain_power > 0) {
        saveSetting("remain_power", remain_power);
      } else {
        remain_power = getSetting("remain_power");
        remain_power = remain_power ? remain_power : 0;
      }
      if (remained_power_mile && remained_power_mile > 0) {
        saveSetting("remained_power_mile", remained_power_mile);
      } else {
        remained_power_mile = getSetting("remained_power_mile");
        remained_power_mile = remained_power_mile ? remained_power_mile : 0;
      }
      if (remained_oil_mile && remained_oil_mile > 0) {
        saveSetting("remained_oil_mile", remained_oil_mile);
      } else {
        remained_oil_mile = getSetting("remained_oil_mile");
        remained_oil_mile = remained_oil_mile ? remained_oil_mile : 0;
      }

      //const power_img = LW.addImage(drawPowerImage(remain_power,remained_power_mile))
      //power_img.cornerRadius=5
      //power_img.imageSize=new Size(300,18)
      /**
        |    col0 |   col1_0|   col1_1 |
        |---------|---------|----------|
        |         | 总里程   | 续航里程  |
        | 车辆图片 |  xxxkm |   xxkm   |
        |         | t_space0| t_space1  |
        | ------- |----------|---------|
        | 车辆名称 |  温度     | 位置     |
        | ------- | xx摄氏度. | xxx省xxx市 |
        |         | t_space2 | t_space3  |
        | 车牌号   |---------------------｜
        |        | 数据更新时间          |
        | col0   |        col1           |
    */
      const container = LW.addStack();
      container.layoutHorizontally();
      container.spacing = 15;
      // 第1列
      const col0 = container.addStack();
      col0.layoutVertically();
      col0.spacing = 6;
      col0.size = new Size(110, 0);
      // 车辆图片
      const car_img = await loadImage("车");
      const car_stack = col0.addStack();

      const img_container = car_stack.addImage(car_img);

      img_container.imageSize = new Size(100, 50);
      // 车辆名称、型号
      const car_name_container = col0.addStack();

      car_name_container.layoutHorizontally();
      car_name_container.spacing = 3;
      car_name_container.bottomAlignContent();

      // 车辆名称
      const car_name_text = car_name_container.addText(car_name);
      car_name_text.font = Font.boldSystemFont(15);
      car_name_text.textColor = theme.primaryTextColor;

      //car_name_text.minimumScaleFactor = 1
      const lock_icon = car_name_container.addImage(
        lock_status
          ? SFSymbol.named("lock.fill").image
          : SFSymbol.named("lock.open.fill").image
      );
      const charge_icon = car_name_container.addImage(
        SFSymbol.named("bolt.fill").image
      );
      // = SFSymbol.named("lock.open.fill")
      lock_icon.tintColor = lock_status
        ? new Color("#27ae60")
        : new Color("#c0392b");
      charge_icon.tintColor = is_charging ? new Color("#27ae60") : Color.gray();
      lock_icon.imageSize = new Size(15, 15);
      charge_icon.imageSize = new Size(15, 15);
      const car_seires_container = col0.addStack();
      // 车辆logo
      const logo = car_seires_container.addImage(await loadImage("LOGO"));
      logo.imageSize = new Size(12, 12);
      // 车辆型号
      const user_defined_series_name = getSetting("car_series_name");
      const car_series_text = car_seires_container.addText(
        user_defined_series_name
          ? user_defined_series_name
          : series_name + " " + conf_name
      );
      car_series_text.font = Font.mediumSystemFont(11);
      car_series_text.textColor = theme.secondaryTextColor;
      //car_series_text.minimumScaleFactor = 0.5

      // 车牌号
      const plate_number_text = col0.addText(plate_number);
      plate_number_text.font = Font.thinMonospacedSystemFont(10);
      plate_number_text.textColor = theme.secondaryTextColor;
      //car_series_text.minimumScaleFactor = 0.5

      // 第2列
      const col1 = container.addStack();

      col1.layoutVertically();
      col1.spacing = 8;
      const col1_row0 = col1.addStack();
      const col1_row1 = col1.addStack();
      col1_row1.layoutHorizontally();
      col1_row1.spacing = 5;

      const refresh_icon = col1_row1.addImage(
        SFSymbol.named("arrow.clockwise").image
      );
      refresh_icon.tintColor = theme.secondaryTextColor;
      refresh_icon.imageSize = new Size(13, 13);
      const refresh_time_text = col1_row1.addText(update_time);
      refresh_time_text.textColor = theme.secondaryTextColor;
      refresh_time_text.font = Font.thinMonospacedSystemFont(13);

      col1_row0.layoutHorizontally();
      col1_row0.spacing = 15;
      const col1_row0_row0 = col1_row0.addStack();
      const col1_row0_row1 = col1_row0.addStack();
      col1_row0_row0.layoutVertically();
      col1_row0_row1.layoutVertically();
      col1_row0_row0.spacing = 8;
      col1_row0_row1.spacing = 8;
      const t_space0 = col1_row0_row0.addStack();
      const t_space2 = col1_row0_row0.addStack();
      const t_space1 = col1_row0_row1.addStack();
      const t_space3 = col1_row0_row1.addStack();
      // 点击地址跳转到高德地图
      t_space3.url = `iosamap://path?sourceApplication=SL03Widget&dlat=${lat}&dlon=${lng}`;
      t_space0.layoutVertically();
      t_space1.layoutVertically();
      t_space2.layoutVertically();
      t_space3.layoutVertically();

      const header0 = t_space0.addText(is_mix ? "油箱续航" : "总里程");
      const header1 = t_space1.addText("电池续航");
      const header2 = t_space2.addText(is_mix ? "总里程" : "车内温度");
      const header3 = t_space3.addText("位置");
      const content_container0 = t_space0.addStack();
      const content_container1 = t_space1.addStack();
      const content_container2 = t_space2.addStack();
      const content_container3 = t_space3.addStack();

      [
        content_container0,
        content_container1,
        content_container2,
        content_container3,
      ].map((c) => {
        c.spacing = 5;
        c.bottomAlignContent();
      });
      const content0 = content_container0.addText(
        is_mix ? remained_oil_mile + "" : total_odometer + ""
      );
      const unit0 = content_container0.addText("km");
      const content1 = content_container1.addText(remained_power_mile + "");
      const unit1 = content_container1.addText("km");
      const content2 = content_container2.addText(
        is_mix ? total_odometer + "" : vehicle_temperature + ""
      );
      const unit2 = content_container2.addText(is_mix ? "km" : "°C");
      const content3 = content_container3.addText(location_str);
      const header_list = [header0, header1, header2, header3];
      const content_list = [content0, content1, content2, content3];
      const unit_list = [unit0, unit1, unit2];
      header_list.map((h) => {
        h.font = Font.thinMonospacedSystemFont(12);
        h.textColor = theme.secondaryTextColor;
      });
      content_list.map((c) => {
        c.font = Font.boldSystemFont(18);
        c.textColor = theme.primaryTextColor;
        c.minimumScaleFactor = 0.3;
      });
      unit_list.map((u) => {
        u.font = Font.mediumMonospacedSystemFont(14);
        u.textColor = theme.secondaryTextColor;
      });

      const background_image = await loadImage("背景图");
      background_image ? (LW.backgroundImage = background_image) : null;
    }
    if (token == "" || token == null || token == undefined) {
      console.error("请先配置refresh_token");
      const t = LW.addText(
        "请先在scriptable app中直接运行此脚本并配置refresh_token"
      );
      t.font = Font.boldSystemFont(18);
      t.textColor = Color.red();
    }
    console.log("渲染结束");
    await LW.presentMedium();
    Script.setWidget(LW);
    Script.complete();
  }
  function getFileManager() {
    let fm;
    try {
      fm = FileManager.iCloud();
      fm.documentsDirectory();
    } catch {
      fm = FileManager.local();
    }
    return fm;
  }

  async function renderWrongSizeAlert() {
    const LW = new ListWidget();
    const alert_text = LW.addText(
      "本组件只支持中等大小，请重新添加中等大小桌面组件"
    );
    alert_text.textColor = Color.red();
    LW.present();
    Script.setWidget(LW);
    Script.complete();
  }

  function getImageDir() {
    const fm = getFileManager();
    const script_dir = fm.documentsDirectory();
    let img_dir = fm.joinPath(script_dir, "imgs");
    if (!fm.fileExists(img_dir)) {
      fm.createDirectory(img_dir, true);
    }
    return img_dir;
  }

  // 加载图片
  async function loadImage(name) {
    const img_map = {
      车: "https://i.328888.xyz/2023/03/20/PMpHE.png",
      LOGO: "https://deepal.com.cn/202303112321/share_logo.png",
    };
    const user_defined_settings_name_map = {
      车: "car_img_path",
      LOGO: "logo_img_path",
      背景图: "widget_background_path",
    };
    const fm = getFileManager();
    let user_defined_img_path = getSetting(
      user_defined_settings_name_map[name]
    );
    // 优先使用用户自定义的图片
    console.log("加载图片:" + name + " " + user_defined_img_path);
    if (user_defined_img_path && fm.fileExists(user_defined_img_path)) {
      try {
        fm.downloadFileFromiCloud(user_defined_img_path);
      } catch (e) {}
      return fm.readImage(user_defined_img_path);
    }
    if (user_defined_img_path && !fm.fileExists(user_defined_img_path)) {
      console.log(`用户自定义图片不存在:${name}`);
      saveSetting(user_defined_settings_name_map[name], "");
      user_defined_img_path = null;
    }
    if (!img_map[name] && !user_defined_img_path) {
      return null;
    }
    const img_url = img_map[name];
    const file_name = img_url.split("/")[img_url.split("/").length - 1];

    let img_dir = getImageDir();

    if (!fm.fileExists(img_dir)) {
      fm.createDirectory(img_dir, true);
    }
    let img_file = fm.joinPath(img_dir, file_name + ".png");

    if (fm.fileExists(img_file)) {
      console.log(`从本地缓存中加载图片:${name}`);
      try {
        fm.downloadFileFromiCloud(img_file);
      } catch (e) {}
    } else {
      // download once
      console.log(`开始下载图片:${name}`);
      const req = new Request(img_url);
      const img = await req.loadImage();
      fm.writeImage(img_file, img);
    }
    // const user_defined_settings_key = user_defined_settings_name_map[name];
    // const user_defined_img_path = getSetting(user_defined_settings_key);
    // if (user_defined_img_path && fm.fileExists(user_defined_img_path)) {
    //   return fm.readImage(user_defined_img_path);
    // } else {
    return fm.readImage(img_file);
    // }
  }

  function getRefreshToken() {
    const fm = getFileManager();
    const script_dir = fm.documentsDirectory();
    const old_refresh_token_path = fm.joinPath(script_dir, "refresh_token");
    // 处理历史遗留问题，将老版本的refresh_token文件统一用新的settings.json替代
    if (fm.fileExists(old_refresh_token_path)) {
      const old_refresh_token = fm.readString(old_refresh_token_path);
      saveSetting("refresh_token", old_refresh_token);
      fm.remove(old_refresh_token_path);
    }
    let refresh_token = getSetting("refresh_token");
    return refresh_token;
  }

  async function getService(name, url, force_download) {
    const fm = getFileManager();
    const script_dir = fm.documentsDirectory();
    let service_dir = fm.joinPath(script_dir, "lib/service/" + name);

    if (!fm.fileExists(service_dir)) {
      fm.createDirectory(service_dir, true);
    }

    let lib_file = fm.joinPath(script_dir, "lib/service/" + name + "/index.js");

    if (fm.fileExists(lib_file) && !force_download) {
      try {
        fm.downloadFileFromiCloud(lib_file);
      } catch (e) {}
    } else {
      // download once
      const req = new Request(url);
      let indexjs = await req.load();
      fm.write(lib_file, indexjs);
    }

    let service = importModule("lib/service/" + name);

    return service;
  }

  async function selectCarColor() {
    const colors = [
      {
        name: "星云青",
        img_url: "https://i.328888.xyz/2023/03/20/PM3NF.png",
      },
      {
        name: "月岩灰",
        img_url: "https://i.328888.xyz/2023/03/20/PMrAZ.png",
      },
      {
        name: "天河蓝",
        img_url: "https://i.328888.xyz/2023/03/20/PMRhH.png",
      },
      {
        name: "星矿黑",
        img_url: "https://i.328888.xyz/2023/03/20/PMcuQ.png",
      },
      {
        name: "彗星白",
        img_url: "https://i.328888.xyz/2023/03/20/PMpHE.png",
      },
    ];
    const alert = new Alert();
    alert.title = "请选择车辆颜色";
    colors.map((color) => {
      alert.addAction(color.name);
    });
    alert.addCancelAction("取消");
    const action_index = await alert.presentAlert();
    if (action_index >= 0) {
      const req = new Request(colors[action_index].img_url);
      const image = await req.loadImage();
      if (!image) {
        console.error("图片素材加载失败");
        return;
      }
      const fm = getFileManager();
      const img_dir = getImageDir();
      const img_file_path = fm.joinPath(img_dir, "car_img.jpg");
      fm.writeImage(img_file_path, image);
      saveSetting("car_img_path", img_file_path);
    }
  }

  async function previewWidget() {
    const alert = new Alert();
    alert.title = "请选择预览内容";
    const preview_actions = [
      {
        title: "🌤️锁屏组件",
        action: async () => await renderAccessoryCircularWidget(),
      },
      {
        title: "📱桌面组件",
        action: async () => await renderMediumWidget(),
      },
    ];
    preview_actions.map((action) => {
      alert.addAction(action.title);
    });
    alert.addCancelAction("取消");
    await alert.presentAlert().then((action_index) => {
      if (action_index >= 0) {
        return preview_actions[action_index].action();
      }
    });
  }

  async function selectTheme() {
    const alert = new Alert();
    alert.title = "请选择主题";
    let curr_theme = getSetting("theme_name");
    curr_theme = curr_theme ? curr_theme : "跟随系统";
    themes.map((theme) => {
      alert.addAction(
        theme.name == curr_theme ? theme.name + "(当前)" : theme.name
      );
    });
    alert.addCancelAction("取消");
    const selection = await alert.presentAlert();
    if (selection >= 0) {
      saveSetting("theme_name", themes[selection].name);
    }
    return selection;
  }

  function getTheme() {
    let theme_name = getSetting("theme_name");
    if (!theme_name) theme_name = "跟随系统";
    return themes.find((theme) => theme.name == theme_name);
  }

  // 弹出操作选单，进行自定义设置
  async function askSettings() {
    const alert = new Alert();
    alert.title = "深蓝小组件设置";
    alert.message = "created by @zkytech";
    const setting_actions = [
      {
        title: "📖查看说明文档",
        action: async () => {
          await Safari.open(
            "https://gitee.com/zkytech/iOS14-widgets-for-scriptable"
          );
        },
      },
      {
        title: "🛠️设置refresh_token",
        action: async () => {
          let my_alert = new Alert();
          let refresh_token = getSetting("refresh_token");
          my_alert.title = "请输入refresh_token";
          my_alert.addSecureTextField(
            "请输入refresh_token",
            refresh_token ? refresh_token : ""
          );
          my_alert.addCancelAction("取消");
          my_alert.addAction("保存");
          if ((await my_alert.present()) == 0) {
            refresh_token = my_alert.textFieldValue(0);
            // 兼容一些神奇的输入形式 ------- begin
            if(refresh_token.indexOf("{") != -1 && refresh_token.indexOf("}") != -1){
              try{
                refresh_token = JSON.parse(/\{.*\}/.exec(refresh_token)[0])["refreshToken"]
              }catch(e){
                console.error(e)
              }
            }
            if(refresh_token.indexOf("=") != -1){
              refresh_token = refresh_token.split("=")[1];
            }
            if(refresh_token.indexOf(":") != -1){
              refresh_token = refresh_token.split(":")[1].replace("\"", "").replace(",","").trim();
            }

            if(refresh_token.indexOf("-") != -1){
              refresh_token = refresh_token.split("-")[0].trim()
            }
            if(refresh_token != my_alert.textFieldValue(0)){
              console.error("输入Token的格式不对，程序会尝试从中提取Token，如果仍然执行失败请仔细地阅读文档。")
            }
            // 兼容一些神奇的输入形式 -------- end
            saveSetting("refresh_token", refresh_token);
            await previewWidget();
          } else console.log("取消");
        },
      },
      {
        title: "💈选择主题",
        action: async () => {
          const selection = await selectTheme();
          if (selection >= 0) {
            await previewWidget();
          }
        },
      },
      {
        title: "🌈选择车辆颜色",
        action: async () => {
          await selectCarColor();
          await previewWidget();
        },
      },
      {
        title: "🖼️自定义背景图片",
        action: async () => {
          const image = await Photos.fromLibrary();
          if (!image) return;
          const fm = getFileManager();
          const img_dir = getImageDir();
          const img_file_path = fm.joinPath(img_dir, "widget_background.jpg");
          fm.writeImage(img_file_path, image);
          saveSetting("widget_background_path", img_file_path);
          await previewWidget();
        },
      },
      {
        title: "💬自定义车辆型号",
        action: async () => {
          let my_alert = new Alert();
          let car_series_name = getSetting("car_series_name");
          my_alert.title = "请输入车辆型号";
          my_alert.addTextField(
            "请输入车辆型号",
            car_series_name ? car_series_name : ""
          );
          my_alert.addCancelAction("取消");
          my_alert.addAction("保存");
          if ((await my_alert.present()) == 0) {
            car_series_name = my_alert.textFieldValue(0);
            saveSetting("car_series_name", car_series_name);
            await previewWidget();
          } else console.log("取消");
        },
      },
      {
        title: "🚙自定义车辆图片",
        action: async () => {
          const image = await Photos.fromLibrary();
          if (!image) return;
          const fm = getFileManager();
          const img_dir = getImageDir();
          const img_file_path = fm.joinPath(img_dir, "car_img.jpg");
          fm.writeImage(img_file_path, image);
          saveSetting("car_img_path", img_file_path);
          await previewWidget();
        },
      },
      {
        title: "🎉自定义LOGO图片",
        action: async () => {
          const image = await Photos.fromLibrary();
          if (!image) return;
          const fm = getFileManager();
          const img_dir = getImageDir();
          const img_file_path = fm.joinPath(img_dir, "logo.jpg");
          fm.writeImage(img_file_path, image);
          saveSetting("logo_img_path", img_file_path);
          await previewWidget();
        },
      },
      {
        title: "♻️重置设定(保留token)",
        action: async () => {
          saveSetting("logo_img_path", "");
          saveSetting("car_img_path", "");
          saveSetting("car_series_name", "");
          saveSetting("widget_background_path", "");
          saveSetting("theme_name", "");
          await previewWidget();
        },
      },
      {
        title: "👀预览",
        action: async () => {
          await previewWidget();
        },
      },
    ];
    setting_actions.map((action) => {
      alert.addAction(action.title);
    });
    alert.addCancelAction("取消");
    await alert.presentAlert().then((action_index) => {
      if (action_index >= 0) {
        return setting_actions[action_index].action();
      }
    });
  }
} catch (e) {
  console.error(e);
}
