// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;
/**
 * iOS widget --- 长安深蓝SL03桌面组件 & 锁屏组件
 * 项目地址: https://github.com/zkytech/iOS14-widgets-for-scriptable
 * 联系邮箱: zhangkunyuan@hotmail.com
 *
 *
 * 参数获取和填写方法见文档: https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}#4-%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81
 * - 组件依赖深蓝APP登录信息（authorization）
 * - 本组件仅用于学习交流
 * - 本组件为开源软件，不会进行收费！！！
 *
 *
 * - 不要在脚本代码里修改任何参数，所有参数必须通过组件设置界面填写
 */
try {
  // 开发环境切换到dev分支，生产环境用master分支
  const branch = "dev";
  const project_name = "深蓝小组件_by_zkytech";
  // const force_download = branch != "master";
  force_download = true
  const url_scheme = "qiyuancar://";


  class WidgetTheme {
    constructor(
      name,
      backgroundGradient,
      primaryTextColor,
      secondaryTextColor
    ) {
      this.name = name;
      this.backgroundGradient = backgroundGradient;
      this.primaryTextColor = primaryTextColor;
      this.secondaryTextColor = secondaryTextColor;
    }
  }

  function getGradient(colors, locations) {
    const gradient = new LinearGradient();
    gradient.colors = colors;
    gradient.locations = locations;
    return gradient;
  }

  const themes = [
    new WidgetTheme(
      "跟随系统",
      getGradient([Color.dynamic(Color.white(), Color.black())], [1]),
      Color.dynamic(Color.black(), Color.white()),
      Color.dynamic(new Color("#4b4b4b"), new Color("#bfbfbf"))
    ),
    new WidgetTheme(
      "白色主题",
      getGradient([Color.white()], [1]),
      Color.black(),
      new Color("#4b4b4b")
    ),
    new WidgetTheme(
      "黑色主题",
      getGradient([Color.black()], [1]),
      Color.white(),
      new Color("#bfbfbf")
    ),
    new WidgetTheme(
      "跟随系统(渐变)",
      getGradient(
        [
          Color.dynamic(Color.white(), Color.black()),
          Color.dynamic(new Color("#ced6e0"), new Color("#2f3542")),
        ],
        [0, 1]
      ),
      Color.dynamic(Color.black(), Color.white()),
      Color.dynamic(new Color("#4b4b4b"), new Color("#bfbfbf"))
    ),
    new WidgetTheme(
      "白色主题(渐变)",
      getGradient([Color.white(), new Color("#ced6e0")], [0, 1]),
      Color.black(),
      new Color("#4b4b4b")
    ),
    new WidgetTheme(
      "黑色主题(渐变)",
      getGradient([Color.black(), new Color("#2f3542")], [0, 1]),
      Color.white(),
      new Color("#bfbfbf")
    ),
    new WidgetTheme(
      "EVA初号机主题",
      getGradient([new Color("#6c5ce7")], [1]),
      new Color("#00b894"),
      new Color("#00b894")
    ),
  ];

  const {
    getCarId,
    getToken,
    refreshCarData,
    getBalanceInfo,
    getCarStatus,
    getCarInfo,
    getCarLocation,
    getChargeStatus,
  } = await getService(
    "SL03Api",
    `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/lib/service/SL03Api.js`,
    force_download
  );
  const { update } = await getService(
    "UpdateScript",
    `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/lib/service/UpdateScript.js`,
    force_download
  );
  let { getDataFromSettings, saveDataToSettings } = await getService(
    "Settings",
    `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/lib/service/Settings.js`,
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
      `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/SL03Widget.js`
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
      `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/lib/service/DrawShape.js`,
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
    let authorization = getAuthorization();


    const token_result = await getToken(authorization);
    if (token_result == null) {
      token = null
    } else {
      token = token_result.access_token;
    }

    const car_id = await getCarId(token,authorization);
    const car_status = await getCarStatus(token, car_id,authorization);
    const charge_status = await getChargeStatus(token, car_id,authorization);
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
      // const sf_car = circle.addImage(SFSymbol.named(car_symbol_name).image);
      const sf_car = circle.addImage(await loadImage("锁屏车"));

      sf_car.imageSize = new Size(29, 29);
      sf_car.tintColor = Color.white();
    }

    if (token == "" || token == null || token == undefined) {
      console.warn("请参照文档配置authorization");
      LW.addText("请参照文档配置authorization");
    }

    LW.presentAccessoryCircular();

    Script.setWidget(LW);
    Script.complete();
  }

  /**
   * 中等桌面组件
   * 接受参数 - authorization
   */
  async function renderMediumWidget() {
    const params = args.widgetParameter
      ? args.widgetParameter.split(",")
      : [""];
    const theme = getTheme();
    param_authorization = params.length > 0 ? params[0].trim() : "";
    if (param_authorization && !getAuthorization()) {
      saveSetting("authorization", param_authorization);
    }
    const LW = new ListWidget(); // widget对象
    LW.url = url_scheme;
    LW.backgroundGradient = theme.backgroundGradient;
    let token;
    let authorization = getAuthorization();
    const token_result = await getToken(authorization);
    if (token_result == null) {
      token = null
    } else {
      token = token_result.access_token;
    }

    const car_id = await getCarId(token, authorization);
    // await refreshCarData()
    const car_status = await getCarStatus(token, car_id, authorization);
    const car_info = await getCarInfo(token, car_id, authorization);
    const car_location = await getCarLocation(token, car_id, authorization);
    const charge_status = await getChargeStatus(token, car_id, authorization);
    const balance_info = await getBalanceInfo(token, car_id, authorization);
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
      let remain_power = Math.round(car_status.remainPower);
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
      const is_charging = charge_status.chrgStatus == "1";
      // 经度
      const lng = car_location.lng;
      // 纬度
      const lat = car_location.lat;
      // 增程油箱续航里程
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
      // 剩余油量
      const remain_oil = (remained_oil_mile / 846) * 100;
      // 综合续航(增程)
      const total_mixed_mile = remained_power_mile + remained_oil_mile;
      // 剩余流量
      let remained_packet_size = Math.round(balance_info[0].left);
      // 剩余流量单位
      let remained_packet_size_unit = balance_info[0].totalUnit;
      if(remained_packet_size){
        saveSetting("remained_packet_size",remained_packet_size)
        saveSetting("remained_packet_size_unit",remained_packet_size_unit)
      }else{
        remained_packet_size = getSetting("remained_packet_size");
        remained_packet_size_unit = getSetting("remained_packet_size_unit");
      }


      const widget_data_map = {
        电池续航: {
          value: remained_power_mile,
          unit: "km",
        },
        油箱续航: {
          value: remained_oil_mile,
          unit: "km",
        },
        剩余电量: {
          value: remain_power,
          unit: "%"
        },
        剩余油量: {
          value: remain_oil,
          unit: "%"
        },
        总里程: {
          value: total_odometer,
          unit: "km",
        },
        综合续航: {
          value: total_mixed_mile,
          unit: "km",
        },
        温度: {
          value: vehicle_temperature,
          unit: "°C",
        },
        位置: {
          value: location_str,
          unit: "",
          url: `iosamap://path?sourceApplication=SL03Widget&dlat=${lat}&dlon=${lng}`,
        },
        剩余流量: {
          value: remained_packet_size,
          unit: remained_packet_size_unit,
        },
      };

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
      car_name_text.shadowColor = theme.secondaryTextColor;
      car_name_text.shadowRadius = 1;
      car_name_text.shadowOffset = new Point(1, 1);

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
      const space_list = [t_space0, t_space1, t_space2, t_space3];
      space_list.map((space, i) => {
        space.layoutVertically();
        const data_key = getWiegetDataSpaceName(i, is_mix);

        // 标题
        const header_stack = space.addText(data_key);
        // 数据容器
        const content_container = space.addStack();
        content_container.spacing = 5;
        content_container.bottomAlignContent();
        // 数据-值
        const content_stack = content_container.addText(
          widget_data_map[data_key].value + ""
        );
        // 数据-单位
        const unit_stack = content_container.addText(
          widget_data_map[data_key].unit + ""
        );
        // 跳转地址
        if (widget_data_map[data_key].url) {
          space.url = widget_data_map[data_key].url;
        }
        header_stack.font = Font.thinMonospacedSystemFont(12);
        header_stack.textColor = theme.secondaryTextColor;
        content_stack.font = Font.boldSystemFont(18);
        content_stack.textColor = theme.primaryTextColor;
        content_stack.minimumScaleFactor = 0.3;
        unit_stack.font = Font.mediumMonospacedSystemFont(14);
        unit_stack.textColor = theme.secondaryTextColor;
      });

      const background_image = await loadImage("背景图");
      background_image ? (LW.backgroundImage = background_image) : null;
    }
    if (token == "" || token == null || token == undefined) {
      console.error("请参照文档配置authorization");
      const t = LW.addText(
        "请参照文档配置authorization"
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
      锁屏车: "https://i.328888.xyz/2023/03/27/inBH5a.png"
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

  function getAuthorization() {
    let authorization = getSetting("authorization");
    return authorization;
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
      if(req.response.statusCode == 200){
        // 只有响应正常时才写入文件，避免写入错误的内容
        fm.write(lib_file, indexjs);
      }
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
    if (!theme_name) theme_name = "跟随系统(渐变)";
    return themes.find((theme) => theme.name == theme_name);
  }

  // 获取第i个组件数据块的名称
  function getWiegetDataSpaceName(i, is_mix) {
    const key = "widget_data_block_info";
    if (getSetting(key) && getSetting(key)[i]) {
      return getSetting(key)[i];
    } else {
      // 为不同车型创建不同的默认设置：增程/纯电
      let default_datas = [];
      if (is_mix) {
        default_datas = ["电池续航", "油箱续航", "总里程", "位置"];
      } else {
        default_datas = ["总里程", "电池续航", "温度", "位置"];
      }
      saveSetting(key, default_datas);
      return default_datas[i];
    }
  }

  function setWidgetDataSpaceName(i, value) {
    const key = "widget_data_block_info";
    if (getSetting(key) && getSetting(key)[i]) {
      const tmp = getSetting(key);
      tmp[i] = value;
      saveSetting(key, tmp);
    }
  }

  async function selectDataForBlock(i) {
    const data_name_list = [
      "电池续航",
      "油箱续航",
      "剩余电量",
      "剩余油量",
      "总里程",
      "综合续航",
      "温度",
      "位置",
      "剩余流量",
    ];
    const curr_selection = getWiegetDataSpaceName(i);
    const alert = new Alert();
    alert.title = "请选择第" + (i + 1) + "个数据块的数据";
    data_name_list.map((data_name) => {
      alert.addAction(data_name == curr_selection ? data_name + "(当前)" : data_name);
    });
    alert.addCancelAction("取消");
    const selection = await alert.presentAlert();
    if (selection >= 0) {
      await setWidgetDataSpaceName(i, data_name_list[selection]);
    }
  }

  async function listDataBlocks() {
    const alert = new Alert();
    alert.title = "请选择数据块";
    alert.message = "分别代表小组件右侧的四个数据块"
    const data_block_list = [1, 2, 3, 4];
    data_block_list.map((data_block) => {
      alert.addAction("第" + data_block + "个数据块");
    });
    alert.addCancelAction("取消");
    const selection = await alert.presentAlert();
    if (selection >= 0) {
      if (
        getSetting("widget_data_block_info") &&
        getSetting("widget_data_block_info")[1]
      ) {
        await selectDataForBlock(selection);
      } else {
        const err_alert = new Alert();
        err_alert.title = "请先执行一遍预览程序";
        err_alert.message = "请先执行一遍预览程序，然后再修改数据块设置";
      }
    }
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
        title: "🛠️设置authorization",
        action: async () => {
          let my_alert = new Alert();
          let authorization = getSetting("authorization");
          my_alert.title = "请输入authorization";
          my_alert.addSecureTextField(
            "请输入authorization",
            authorization == null ? authorization : ""
          );
          my_alert.addCancelAction("取消");
          my_alert.addAction("保存");
          if ((await my_alert.present()) == 0) {
            authorization = my_alert.textFieldValue(0).trim();
            saveSetting("authorization", authorization);
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
        title: "⌗自定义数据块",
        action: async () => {
          await listDataBlocks();
          await previewWidget();
        },
      },

      {
        title: "♻️重置设定(保留token)",
        action: async () => {
          resetSettings();
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

  function resetSettings() {
    saveSetting("logo_img_path", "");
    saveSetting("car_img_path", "");
    saveSetting("car_series_name", "");
    saveSetting("widget_background_path", "");
    saveSetting("theme_name", "跟随系统(渐变)");
    saveSetting("widget_data_block_info", null);
  }
} catch (e) {
  console.error(e);
  console.error(e.stack);
}
