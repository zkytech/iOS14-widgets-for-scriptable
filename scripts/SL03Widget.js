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
// 开发环境切换到dev分支，生产环境用master分支
const branch = "master";
const project_name = "深蓝小组件_by_zkytech";
// const force_download = branch != "master";
force_download = true;
const url_scheme = "qiyuancar://";
const screenSize = Device.screenResolution();
const scale = Device.screenScale();
const DEVICE_SIZE = {
  "428x926": {
    small: { width: 176, height: 176 },
    medium: { width: 374, height: 176 },
    large: { width: 374, height: 391 },
  },
  "390x844": {
    small: { width: 161, height: 161 },
    medium: { width: 342, height: 161 },
    large: { width: 342, height: 359 },
  },
  "414x896": {
    small: { width: 169, height: 169 },
    medium: { width: 360, height: 169 },
    large: { width: 360, height: 376 },
  },
  "375x812": {
    small: { width: 155, height: 155 },
    medium: { width: 329, height: 155 },
    large: { width: 329, height: 345 },
  },
  "414x736": {
    small: { width: 159, height: 159 },
    medium: { width: 348, height: 159 },
    large: { width: 348, height: 357 },
  },
  "375x667": {
    small: { width: 148, height: 148 },
    medium: { width: 322, height: 148 },
    large: { width: 322, height: 324 },
  },
  "320x568": {
    small: { width: 141, height: 141 },
    medium: { width: 291, height: 141 },
    large: { width: 291, height: 299 },
  },
};
const device_size =
  DEVICE_SIZE[`${screenSize.width / scale}x${screenSize.height / scale}`] ||
  DEVICE_SIZE["375x812"];
class WidgetTheme {
  constructor(
    name,
    backgroundGradient,
    primaryTextColor,
    secondaryTextColor,
    focousBackgroundColor
  ) {
    this.name = name;
    this.backgroundGradient = backgroundGradient;
    this.primaryTextColor = primaryTextColor;
    this.secondaryTextColor = secondaryTextColor;
    this.focousBackgroundColor = focousBackgroundColor;
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
    "白色",
    getGradient(
      [
        Color.dynamic(new Color("#c7c7c7"), new Color("#232323")),
        Color.dynamic(new Color("#fff"), new Color("#5b5d61")),
      ],
      [0, 1]
    ),
    Color.dynamic(new Color("#1d1d1d"), new Color("#fff")),
    Color.dynamic(new Color("#1d1d1d", 0.8), new Color("#fff", 0.8)),
    Color.dynamic(new Color("#f5f5f8", 0.45), new Color("#fff", 0.2))
  ),
  new WidgetTheme(
    "黑色",
    getGradient(
      [
        Color.dynamic(new Color("#5e627d"), new Color("#2d2f40")),
        Color.dynamic(new Color("#fff"), new Color("#666878")),
      ],
      [0, 1]
    ),
    Color.dynamic(new Color("#1d1d1d"), new Color("#fff")),
    Color.dynamic(new Color("#1d1d1d", 0.8), new Color("#fff", 0.8)),
    Color.dynamic(new Color("#f5f5f8", 0.45), new Color("#fff", 0.2))
  ),
  new WidgetTheme(
    "蓝色",
    getGradient(
      [
        Color.dynamic(new Color("#6887d1"), new Color("#23345e")),
        Color.dynamic(new Color("#fff"), new Color("#526387")),
      ],
      [0, 1]
    ),
    Color.dynamic(new Color("#1d1d1d"), new Color("#fff")),
    Color.dynamic(new Color("#1d1d1d", 0.8), new Color("#fff", 0.8)),
    Color.dynamic(new Color("#f5f5f8", 0.45), new Color("#fff", 0.2))
  ),
  new WidgetTheme(
    "红色",
    getGradient(
      [
        Color.dynamic(new Color("#b16968"), new Color("#a84242")),
        Color.dynamic(new Color("#fff"), new Color("#540101")),
      ],
      [0, 1]
    ),
    Color.dynamic(new Color("#1d1d1d"), new Color("#fff")),
    Color.dynamic(new Color("#1d1d1d", 0.8), new Color("#fff", 0.8)),
    Color.dynamic(new Color("#f5f5f8", 0.45), new Color("#fff", 0.2))
  ),
  new WidgetTheme(
    "橙色",
    getGradient(
      [
        Color.dynamic(new Color("#ffc699"), new Color("#bd5608")),
        Color.dynamic(new Color("#fff"), new Color("#732600")),
      ],
      [0, 1]
    ),
    Color.dynamic(new Color("#1d1d1d"), new Color("#fff")),
    Color.dynamic(new Color("#1d1d1d", 0.8), new Color("#fff", 0.8)),
    Color.dynamic(new Color("#f5f5f8", 0.45), new Color("#fff", 0.2))
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
try {
  if (config.runsInWidget) {
    await renderWidget(config.widgetFamily);
  } else {
    // 在Scriptable中运行，弹出设置窗口
    await askSettings();
  }
} catch (e) {
  console.error(e.message);
}
async function renderLargeWidget(LW, data) {
  const {
    update_time,
    total_odometer,
    vehicle_temperature,
    remain_power_mile,
    remain_power,
    car_name,
    conf_name,
    plate_number,
    series_name,
    location_str,
    door_locked,
    is_mix,
    is_charging,
    lng,
    lat,
    remained_oil_mile,
    remain_oil,
    total_mixed_mile,
    remained_packet_size,
    remained_packet_size_unit,
    window_closed,
  } = data;
  await renderMediumWidget(LW, data);
  const height = device_size.large.height * 0.5;
  const width = device_size.large.width;
  const theme = getTheme();
  let w = LW;
  w.setPadding(0, 0, 0, 0);
  w.addSpacer();
  let fontColor = theme.primaryTextColor;

  let mapWidth = width;
  let mapHeight = height;
  let paddingLeft = Math.round(5);
  let largeExtraContainer = w.addStack();
  // largeExtraContainer.setPadding(0,paddingLeft,paddingLeft,0)
  largeExtraContainer.layoutHorizontally();
  largeExtraContainer.centerAlignContent();
  largeExtraContainer.setPadding(0, 0, 0, 0);
  largeExtraContainer.size = new Size(mapWidth, mapHeight);
  const map_api_key = getSetting("map_api_key");
  if (map_api_key && map_api_key.length > 0) {
    let latLng = null;
    try {
      latLng = lng + "," + lat;
    } catch (e) {}

    let mapImage = await loadMapView(latLng, mapWidth - 10, mapHeight - 10);
    let widget = largeExtraContainer.addImage(mapImage);
    widget.centerAlignImage();
    widget.cornerRadius = 20;
    widget.imageSize = new Size(mapWidth - 10, mapHeight - 10);
    // widget.imageSize = new Size(mapWidth-20, mapHeight-20);
    largeExtraContainer.url = `iosamap://path?sourceApplication=SL03Widget&dlat=${lat}&dlon=${lng}`;
  }
}

/**
 * 小号锁屏组件
 * 接受参数 - 显示模式，油/电
 */
async function renderAccessoryCircularWidget(LW, data) {
  const { drawArc } = await getService(
    "DrawShape",
    `https://public.zkytech.top/iOS14-widgets-for-scriptable/${branch}/lib/service/DrawShape.js`,
    force_download
  );
  const params = args.widgetParameter ? args.widgetParameter.split(",") : [""];
  let mode = "电";
  if (params.length >= 1) mode = params[0].trim() == "油" ? "油" : "电";
  const {
    update_time,
    total_odometer,
    vehicle_temperature,
    remain_power_mile,
    remain_power,
    car_name,
    conf_name,
    plate_number,
    series_name,
    location_str,
    door_locked,
    is_mix,
    is_charging,
    lng,
    lat,
    remained_oil_mile,
    remain_oil,
    total_mixed_mile,
    remained_packet_size,
    remained_packet_size_unit,
    window_closed,
  } = data;
  const circle = await drawArc(LW, mode == "电" ? remain_power : remain_oil);
  const sf_car = circle.addImage(await loadImage("锁屏车"));
  sf_car.imageSize = new Size(29, 29);
  sf_car.tintColor = Color.white();
}

async function renderSmallWidget(LW, data) {
  const height = device_size.small.height;
  const width = device_size.small.width;
  const theme = getTheme();

  const {
    update_time,
    total_odometer,
    vehicle_temperature,
    remain_power_mile,
    remain_power,
    car_name,
    conf_name,
    plate_number,
    series_name,
    location_str,
    door_locked,
    is_mix,
    is_charging,
    lng,
    lat,
    remained_oil_mile,
    remain_oil,
    total_mixed_mile,
    remained_packet_size,
    remained_packet_size_unit,
    window_closed,
    trunk_closed,
  } = data;

  LW.setPadding(0, 0, 0, 0);

  const top_box = LW.addStack();
  top_box.layoutHorizontally();
  top_box.setPadding(0, 0, 0, 0);
  const padding_left = Math.round(width * 0.07);

  // ---顶部左边部件---
  const top_left_container = top_box.addStack();

  const car_name_container = top_left_container.addStack();
  car_name_container.setPadding(padding_left, padding_left, 0, 0);
  const car_name_text = car_name_container.addText(car_name);
  car_name_text_size = Math.round(width * 0.12);
  car_name_text.textColor = theme.primaryTextColor;
  if (car_name.length >= 10) {
    car_name_text_size = car_name_text_size - Math.round(car_name.length / 4);
  }
  car_name_text.font = Font.boldSystemFont(car_name_text_size);
  top_box.addSpacer();
  const top_right_box = top_box.addStack();
  top_right_box.setPadding(padding_left, 0, 0, padding_left);
  const logo_image = await loadImage("LOGO");
  const logo_image_container = top_right_box.addImage(logo_image);
  logo_container_width = Math.round(width * 0.1);
  const logo_image_size = getImageSize(
    logo_image.size.width,
    logo_image.size.height,
    Math.round(logo_container_width * 2.5),
    logo_container_width,
    0.99
  );
  logo_image_container.imageSize = new Size(
    logo_image_size.width,
    logo_image_size.height
  );
  // ---中间部件---
  const car_info_container = LW.addStack();
  car_info_container.layoutVertically();
  car_info_container.setPadding(8, padding_left, 0, 0);
  let fontColor = theme.primaryTextColor;

  if (!is_mix) {
    const kmContainer = car_info_container.addStack();
    kmContainer.bottomAlignContent();
    const kmText = kmContainer.addText(`${remain_power_mile + " " + "km"}`);
    kmText.font = Font.systemFont(20);
    kmText.textColor = fontColor;

    const levelContainer = kmContainer.addStack();
    const separator = levelContainer.addText(" / ");
    separator.font = Font.systemFont(16);
    separator.textColor = fontColor;
    separator.textOpacity = 0.6;

    const levelText = levelContainer.addText(`${remain_power}${"%"}`);
    levelText.font = Font.systemFont(18);
    levelText.textColor = fontColor;
    levelText.textOpacity = 0.6;
  } else {
    const kmContainer = car_info_container.addStack();
    kmContainer.centerAlignContent();
    kmContainer.spacing = 12;
    const oil_container = kmContainer.addStack();
    oil_container.spacing = 5;
    oil_container.setPadding(0, 0, 0, 0);
    oil_container.centerAlignContent();
    const battery_container = kmContainer.addStack();
    battery_container.spacing = 5;
    battery_container.setPadding(0, 0, 0, 0);
    battery_container.centerAlignContent();
    const oil_icon_container = oil_container.addImage(
      SFSymbol.named("fuelpump").image
    );
    const oil_text = oil_container.addText(remained_oil_mile + " " + "km");
    const battery_icon_container = battery_container.addImage(
      SFSymbol.named("bolt.batteryblock").image
    );
    const battery_text = battery_container.addText(
      remain_power_mile + " " + "km"
    );
    oil_text.font = Font.systemFont(14);
    oil_text.textColor = fontColor;
    battery_text.font = Font.systemFont(14);
    battery_text.textColor = fontColor;
    oil_icon_container.imageSize = new Size(13, 13);
    battery_icon_container.imageSize = new Size(13, 13);
  }

  const car_status_container = car_info_container.addStack();
  car_status_container.setPadding(2, 0, 0, 0);

  const car_status_box = car_status_container.addStack();
  car_status_box.setPadding(3, 3, 3, 3);
  car_status_box.layoutHorizontally();
  car_status_box.centerAlignContent();
  car_status_box.cornerRadius = 4;
  car_status_box.backgroundColor = Color.dynamic(
    new Color("#f5f5f8", 0.45),
    new Color("#fff", 0.2)
  );

  let statusTxt = "已上锁";
  if (!window_closed) {
    statusTxt = "车窗开启";
  }
  if (!trunk_closed) {
    statusTxt = "后备箱开启";
  }
  if (!door_locked) {
    statusTxt = "已解锁";
  }
  const car_status_txt = car_status_box.addText(statusTxt);
  let display_font = Font.systemFont(10);
  let display_font_color = theme.primaryTextColor;
  if (!door_locked) {
    display_font_color = Color.red();
    display_font = Font.semiboldSystemFont(10);
  }

  car_status_txt.font = display_font;
  car_status_txt.textColor = display_font_color;
  car_status_txt.textOpacity = 0.7;
  car_status_box.addSpacer(5);

  const update_txt = car_status_box.addText(formatStatusLabel(update_time));
  update_txt.font = Font.systemFont(10);
  update_txt.textColor = theme.secondaryTextColor;
  update_txt.textOpacity = 0.5;
  // ---中间部件完---

  LW.addSpacer();

  // ---底部部件---

  const car_image_container = LW.addStack();
  let canvas_width = Math.round(width * 0.85);
  let canvas_height = Math.round(width * 0.4);

  car_image_container.setPadding(0, padding_left, 6, 0);
  // if (!this.userConfigData.show_control_checks) {
  car_image_container.layoutHorizontally();
  car_image_container.addSpacer();
  car_image_container.setPadding(6, padding_left, 6, padding_left);
  // }
  let image = await loadImage("车");
  // let image = await this.getCarCanvasImage(data, canvasWidth, canvasHeight, 0.95);

  let car_image = car_image_container.addImage(image);
  const car_image_size = getImageSize(
    image.size.width,
    image.size.height,
    canvas_width,
    canvas_height,
    0.95
  );
  car_image.size = new Size(car_image_size.width, car_image_size.height);
  car_image.resizable = true;
  // ---底部部件完---
}

function formatStatusLabel(last_update_time_str) {
  let lastUpdated = new Date(last_update_time_str);
  const today = new Date();

  let formatter = "MM-dd HH:mm";
  if (lastUpdated.getDate() == today.getDate()) {
    formatter = "HH:mm";
  }

  let dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = formatter;

  let dateStr = dateFormatter.string(lastUpdated);
  // get today
  return `${dateStr}更新`;
}

async function mediumStyleSimple(LW, data) {
  const height = device_size.medium.height;
  const width = device_size.medium.width;
  const theme = getTheme();
  let {
    update_time,
    total_odometer,
    vehicle_temperature,
    remain_power_mile,
    remain_power,
    car_name,
    conf_name,
    plate_number,
    series_name,
    location_str,
    door_locked,
    is_mix,
    is_charging,
    lng,
    lat,
    remained_oil_mile,
    remain_oil,
    total_mixed_mile,
    remained_packet_size,
    remained_packet_size_unit,
    window_closed,
    trunk_closed,
  } = data;
  let w = LW;
  let fontColor = theme.primaryTextColor;
  w.setPadding(0, 0, 0, 0);

  let paddingTop = Math.round(height * 0.09);
  let paddingLeft = Math.round(width * 0.055);

  let renderMediumContent = true;

  const topContainer = w.addStack();
  topContainer.layoutHorizontally();

  const vehicleNameContainer = topContainer.addStack();
  vehicleNameContainer.layoutHorizontally();
  vehicleNameContainer.setPadding(paddingTop, paddingLeft, 0, 0);

  let vehicleNameStr = car_name;
  const vehicleNameText = vehicleNameContainer.addText(vehicleNameStr);

  let vehicleNameSize = 24;

  if (vehicleNameStr.length >= 10) {
    vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
  }

  vehicleNameText.font = Font.boldSystemFont(vehicleNameSize);
  vehicleNameText.textColor = fontColor;
  vehicleNameContainer.addSpacer();

  const logoImageContainer = topContainer.addStack();
  logoImageContainer.layoutHorizontally();
  logoImageContainer.setPadding(paddingTop, 0, 0, paddingTop);

  try {
    let logoImage = logoImageContainer.addImage(await loadImage("LOGO"));
    logoImage.rightAlignImage();
  } catch (e) {}

  const bodyContainer = w.addStack();
  bodyContainer.layoutHorizontally();
  const leftContainer = bodyContainer.addStack();

  leftContainer.layoutVertically();
  leftContainer.size = new Size(
    Math.round(width * 0.85),
    Math.round(height * 0.75)
  );
  if (renderMediumContent) {
    leftContainer.size = new Size(
      Math.round(width * 0.5),
      Math.round(height * 0.75)
    );
  }
  leftContainer.addSpacer();

  if (!is_mix) {
    const kmContainer = leftContainer.addStack();
    kmContainer.setPadding(0, paddingLeft, 0, 0);
    kmContainer.bottomAlignContent();
    const kmText = kmContainer.addText(`${remain_power_mile + " " + "km"}`);
    kmText.font = Font.systemFont(20);
    kmText.textColor = fontColor;

    const levelContainer = kmContainer.addStack();
    const separator = levelContainer.addText(" / ");
    separator.font = Font.systemFont(16);
    separator.textColor = fontColor;
    separator.textOpacity = 0.6;

    const levelText = levelContainer.addText(`${remain_power}${"%"}`);
    levelText.font = Font.systemFont(18);
    levelText.textColor = fontColor;
    levelText.textOpacity = 0.6;
  } else {
    const kmContainer = leftContainer.addStack();
    kmContainer.setPadding(0, paddingLeft, 0, 0);
    kmContainer.centerAlignContent();
    kmContainer.spacing = 12;
    const oil_container = kmContainer.addStack();
    oil_container.spacing = 5;
    oil_container.setPadding(0, 0, 0, 0);
    oil_container.centerAlignContent();
    const battery_container = kmContainer.addStack();
    battery_container.spacing = 5;
    battery_container.setPadding(0, 0, 0, 0);
    battery_container.centerAlignContent();
    const oil_icon_container = oil_container.addImage(
      SFSymbol.named("fuelpump").image
    );
    const oil_text = oil_container.addText(remained_oil_mile + " " + "km");
    const battery_icon_container = battery_container.addImage(
      SFSymbol.named("bolt.batteryblock").image
    );
    const battery_text = battery_container.addText(
      remain_power_mile + " " + "km"
    );
    oil_text.font = Font.systemFont(14);
    oil_text.textColor = fontColor;
    battery_text.font = Font.systemFont(14);
    battery_text.textColor = fontColor;
    oil_icon_container.imageSize = new Size(13, 13);
    battery_icon_container.imageSize = new Size(13, 13);
  }

  const mileageContainer = leftContainer.addStack();
  mileageContainer.setPadding(0, paddingLeft, 0, 0);

  let mileageText = mileageContainer.addText(`总里程: ${total_odometer} km`);
  mileageText.font = Font.systemFont(9);
  mileageText.textColor = fontColor;
  mileageText.textOpacity = 0.7;

  const carStatusContainer = leftContainer.addStack();
  carStatusContainer.setPadding(8, paddingLeft, 0, 0);

  const carStatusBox = carStatusContainer.addStack();
  carStatusBox.setPadding(3, 3, 3, 3);
  carStatusBox.layoutHorizontally();
  carStatusBox.centerAlignContent();
  carStatusBox.cornerRadius = 4;
  carStatusBox.backgroundColor = theme.focousBackgroundColor;
  let statusTxt = "已上锁";
  if (!window_closed) {
    statusTxt = "车窗开启";
  }
  if (!trunk_closed) {
    statusTxt = "后备箱开启";
  }
  if (!door_locked) {
    statusTxt = "已解锁";
  }
  const carStatusTxt = carStatusBox.addText(statusTxt);

  let displayFont = Font.systemFont(10);
  let displayFontColor = fontColor;
  if (!door_locked || !window_closed || !trunk_closed) {
    displayFontColor = Color.red();
    displayFont = Font.boldSystemFont(10);
  }

  carStatusTxt.font = displayFont;
  carStatusTxt.textColor = displayFontColor;
  carStatusTxt.textOpacity = 0.7;
  carStatusBox.addSpacer(5);

  const updateTxt = carStatusBox.addText(formatStatusLabel(update_time));
  updateTxt.font = Font.systemFont(10);
  updateTxt.textColor = fontColor;
  updateTxt.textOpacity = 0.5;

  const locationStr = location_str;

  leftContainer.addSpacer();

  const locationContainer = leftContainer.addStack();
  locationContainer.setPadding(0, paddingLeft, 0, 0);
  if (renderMediumContent) {
    locationContainer.setPadding(0, paddingLeft, 16, 0);
  }
  const locationText = locationContainer.addText(locationStr);
  locationText.font = Font.systemFont(10);
  locationText.textColor = fontColor;
  locationText.textOpacity = 0.5;
  locationText.url = `iosamap://path?sourceApplication=SL03Widget&dlat=${lat}&dlon=${lng}`;

  if (renderMediumContent) {
    const rightContainer = bodyContainer.addStack();
    rightContainer.setPadding(0, 0, 0, 0);
    rightContainer.layoutVertically();
    rightContainer.size = new Size(
      Math.round(width * 0.5),
      Math.round(height * 0.75)
    );

    const carImageContainer = rightContainer.addStack();
    carImageContainer.bottomAlignContent();
    carImageContainer.setPadding(0, 6, 0, paddingLeft);

    let canvasWidth = Math.round(width * 0.45);
    let canvasHeight = Math.round(height * 0.55);

    let image = await loadImage("车");
    const imageSize = getImageSize(
      image.size.width,
      image.size.height,
      canvasWidth,
      canvasHeight,
      0.99
    );
    let carStatusImage = carImageContainer.addImage(image);
    carStatusImage.size = new Size(imageSize.width, imageSize.height);
    carStatusImage.resizable = true;
    let windowStatusContainer = rightContainer.addStack();
    windowStatusContainer.setPadding(6, 0, 12, 0);

    windowStatusContainer.layoutHorizontally();
    windowStatusContainer.addSpacer();
    let statusTxt = "所有车门和车窗已关闭";
    let bad_status_list = [];
    if (!door_locked) {
      bad_status_list.push("已解锁");
    }
    if (!trunk_closed) {
      bad_status_list.push("后备箱开启");
    }
    if (!window_closed) {
      bad_status_list.push("车窗开启");
    }
    if (bad_status_list.length != 0) {
      statusTxt = bad_status_list.join(",");
    }

    let windowStatusText = windowStatusContainer.addText(statusTxt);

    let displayFont = Font.systemFont(10);
    let displayFontColor = fontColor;
    if (!door_locked || !window_closed) {
      displayFontColor = Color.red();
      displayFont = Font.boldSystemFont(10);
    }

    windowStatusText.font = displayFont;
    windowStatusText.textColor = displayFontColor;
    windowStatusText.textOpacity = 0.5;

    windowStatusContainer.addSpacer();
  }
}

async function mediumStyleModule(LW, data) {
  const theme = getTheme();
  const {
    update_time,
    total_odometer,
    vehicle_temperature,
    remain_power_mile,
    remain_power,
    car_name,
    conf_name,
    plate_number,
    series_name,
    location_str,
    door_locked,
    is_mix,
    is_charging,
    lng,
    lat,
    remained_oil_mile,
    remain_oil,
    total_mixed_mile,
    remained_packet_size,
    remained_packet_size_unit,
  } = data;
  const widget_data_map = {
    电池续航: {
      value: remain_power_mile,
      unit: "km",
    },
    油箱续航: {
      value: remained_oil_mile,
      unit: "km",
    },
    剩余电量: {
      value: remain_power,
      unit: "%",
    },
    剩余油量: {
      value: remain_oil,
      unit: "%",
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

  //const power_img = LW.addImage(drawPowerImage(remain_power,remain_power_mile))
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
  const height = device_size.medium.height;
  const width = device_size.medium.width;
  const container = LW.addStack();
  container.size = new Size(width, height);
  container.setPadding(15, 15, 15, 15);
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
    door_locked
      ? SFSymbol.named("lock.fill").image
      : SFSymbol.named("lock.open.fill").image
  );
  const charge_icon = car_name_container.addImage(
    SFSymbol.named("bolt.fill").image
  );
  // = SFSymbol.named("lock.open.fill")
  lock_icon.tintColor = door_locked
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
    content_stack.font = Font.systemFont(18);
    content_stack.textColor = theme.primaryTextColor;
    content_stack.minimumScaleFactor = 0.3;
    content_stack.textOpacity = 0.7;
    unit_stack.font = Font.mediumMonospacedSystemFont(14);
    unit_stack.textColor = theme.secondaryTextColor;
    unit_stack.textOpacity = 0.5;
  });
}
async function getData() {
  let token;
  let authorization = getAuthorization();
  const token_result = await getToken(authorization);
  if (token_result == null) {
    token = null;
  } else {
    token = token_result.access_token;
    saveSetting("access_token", token);
  }

  const car_id = await getCarId(token, authorization);
  if (car_id) {
    saveSetting("car_id", car_id);
    console.log("car_id:" + car_id);
  }
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
    let remain_power_mile = Math.round(car_status.remainedPowerMile);
    // 剩余电量
    let remain_power = Math.round(car_status.remainPower);
    // 车辆名称
    const car_name = getCarName(car_info.carName);
    // 车辆配置名称，比如：515km
    const conf_name = car_info.confName ? car_info.confName.split("，")[2] : "";
    // 车牌号
    const plate_number = car_info.plateNumber;
    // 型号
    const series_name = car_info.seriesName;
    // 车辆位置
    const location_str = car_location.addrDesc;
    // 车门状态
    const door_locked =
      car_status.driverDoorLock == 0 && car_status.passengerDoorLock == 0;
    // 是否为增程车型
    const is_mix = car_status.remainedOilMile != undefined;
    // 是否在充电
    const is_charging = charge_status.chrgStatus == "1";
    // 经度
    const lng = car_location.lng;
    // 纬度
    const lat = car_location.lat;
    // 车窗开度-左后
    const left_rear_window_degree = car_status.leftRearWindowDegree;
    // 车窗开度-右后
    const right_rear_window_degree = car_status.rightRearWindowDegree;
    // 车窗开度-左前
    const left_anterior_window_degree = car_status.leftAnteriorWindowDegree;
    // 车窗开度-右前
    const right_anterior_window_degree = car_status.rightAnteriorWindowDegree;
    // 车窗开闭状态
    let window_closed = false;
    if (
      left_rear_window_degree <= 0.02 &&
      right_rear_window_degree <= 0.02 &&
      left_anterior_window_degree <= 0.02 &&
      right_anterior_window_degree <= 0.02
    ) {
      window_closed = true;
    }

    // 增程油箱续航里程
    let remained_oil_mile = is_mix ? Math.round(car_status.remainedOilMile) : 0;
    // 增程车型存在API数据错乱的问题，这里为了受到API错误数据的影响自动取上一次获取到的合理数据
    if (remain_power && remain_power > 0) {
      saveSetting("remain_power", remain_power);
    } else {
      remain_power = getSetting("remain_power");
      remain_power = remain_power ? remain_power : 0;
    }
    if (remain_power_mile && remain_power_mile > 0) {
      saveSetting("remain_power_mile", remain_power_mile);
    } else {
      remain_power_mile = getSetting("remain_power_mile");
      remain_power_mile = remain_power_mile ? remain_power_mile : 0;
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
    const total_mixed_mile = remain_power_mile + remained_oil_mile;
    // 剩余流量
    let remained_packet_size = Math.round(balance_info[0].left);
    // 剩余流量单位
    let remained_packet_size_unit = balance_info[0].totalUnit;
    if (remained_packet_size) {
      saveSetting("remained_packet_size", remained_packet_size);
      saveSetting("remained_packet_size_unit", remained_packet_size_unit);
    } else {
      remained_packet_size = getSetting("remained_packet_size");
      remained_packet_size_unit = getSetting("remained_packet_size_unit");
    }
    // 后备箱开关状态
    const trunk_closed = ![1, 2, 3, 4].includes(car_status.energytrunk);
    const data = {
      update_time,
      total_odometer,
      vehicle_temperature,
      remain_power_mile,
      remain_power,
      car_name,
      conf_name,
      plate_number,
      series_name,
      location_str,
      door_locked,
      is_mix,
      is_charging,
      lng,
      lat,
      remained_oil_mile,
      remain_oil,
      total_mixed_mile,
      remained_packet_size,
      remained_packet_size_unit,
      window_closed,
      trunk_closed,
    };
    return data;
  } else {
    return null;
  }
}

async function renderWidget(widget_family) {
  const theme = getTheme();
  const LW = new ListWidget(); // widget对象
  LW.url = url_scheme;
  LW.backgroundGradient = theme.backgroundGradient;
  const background_image = await loadImage("背景图");
  background_image ? (LW.backgroundImage = background_image) : null;
  const data = await getData();
  if (data == null) {
    LW.url =
      "https://gitee.com/zkytech/iOS14-widgets-for-scriptable#%E5%B0%8F%E7%BB%84%E4%BB%B6%E6%B7%B1%E8%93%9Dsl03%E8%BD%A6%E8%BE%86%E7%8A%B6%E6%80%81";
    const t = LW.addText("请参照教程配置authorization\n点击查看配置教程");
    t.font = Font.boldSystemFont(18);
    t.textColor = Color.red();
  } else {
    if (widget_family == "small") {
      await renderSmallWidget(LW, data);
    } else if (widget_family == "medium") {
      await renderMediumWidget(LW, data);
    } else if (widget_family == "large") {
      await renderLargeWidget(LW, data);
    } else if (widget_family == "accessoryCircular") {
      LW.backgroundImage = undefined;
      LW.backgroundGradient = undefined;
      await renderAccessoryCircularWidget(LW, data);
    }
  }
  if (widget_family == "small") {
    LW.presentSmall();
  } else if (widget_family == "medium") {
    LW.presentMedium();
  } else if (widget_family == "large") {
    LW.presentLarge();
  } else if (widget_family == "accessoryCircular") {
    LW.presentAccessoryCircular();
  }
  console.log("渲染结束");
  Script.setWidget(LW);
  Script.complete();
}

/**
 * 中等桌面组件
 * 接受参数 - authorization
 */
async function renderMediumWidget(LW, data) {
  let curr_style = getSetting("style");
  if (curr_style == undefined || curr_style == null) {
    curr_style = "简约";
    saveSetting("style", curr_style);
  }

  if (curr_style == "模块化") {
    await mediumStyleModule(LW, data);
  }
  if (curr_style == "简约") {
    await mediumStyleSimple(LW, data);
  }
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
    锁屏车: "https://i.328888.xyz/2023/03/27/inBH5a.png",
  };
  const user_defined_settings_name_map = {
    车: "car_img_path",
    LOGO: "logo_img_path",
    背景图: "widget_background_path",
  };
  const fm = getFileManager();
  let user_defined_img_path = getSetting(user_defined_settings_name_map[name]);
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
    } catch (e) {console.error(e.message)};
  } else {
    // download once
    try{
      const req = new Request(url);
      let indexjs = await req.load();
      if (req.response.statusCode == 200) {
        // 只有响应正常时才写入文件，避免写入错误的内容
        fm.write(lib_file, indexjs);
      }
    }catch(e){
      console.error(e.message);
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
      action: async () => await renderWidget("accessoryCircular"),
    },
    {
      title: "📱桌面组件(大)",
      action: async () => await renderWidget("large"),
    },
    {
      title: "📱桌面组件(中)",
      action: async () => await renderWidget("medium"),
    },
    {
      title: "📱桌面组件(小)",
      action: async () => await renderWidget("small"),
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
  const theme_name_list = themes.map((theme) => theme.name);
  if (!theme_name || theme_name_list.indexOf(theme_name) == -1) {
    theme_name = "黑色";
    saveSetting("theme_name", theme_name);
  }
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
    alert.addAction(
      data_name == curr_selection ? data_name + "(当前)" : data_name
    );
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
  alert.message = "分别代表小组件右侧的四个数据块";
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
      title: "🛠️设置地图API KEY",
      action: async () => {
        let my_alert = new Alert();
        let map_api_key = getSetting("map_api_key");
        my_alert.title = "请输入map_api_key";
        my_alert.addSecureTextField(
          "请输入地图API KEY",
          map_api_key == null ? map_api_key : ""
        );
        my_alert.addCancelAction("取消");
        my_alert.addAction("保存");
        if ((await my_alert.present()) == 0) {
          map_api_key = my_alert.textFieldValue(0).trim();
          saveSetting("map_api_key", map_api_key);
          await previewWidget();
        } else console.log("取消");
      },
    },
    {
      title: "🧩组件风格",
      action: async () => {
        let my_alert = new Alert();
        let current_style = getSetting("style");
        my_alert.title = "请选择组件风格";
        const styles = ["简约", "模块化"];
        styles.map((style) => {
          my_alert.addAction(style + (current_style == style ? "(当前)" : ""));
        });
        my_alert.addCancelAction("取消");
        const selection = await my_alert.presentAlert();
        if (selection >= 0) {
          saveSetting("style", styles[selection]);
          await previewWidget();
        } else {
          console.log("取消");
        }
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
      title: "💬自定义车辆名称",
      action: async () => {
        let my_alert = new Alert();
        let car_name = getSetting("car_name");
        my_alert.title = "请输入车辆名称";
        my_alert.addTextField("请输入车辆名称", car_name ? car_name : "");
        my_alert.addCancelAction("取消");
        my_alert.addAction("保存");
        if ((await my_alert.present()) == 0) {
          car_name = my_alert.textFieldValue(0);
          saveSetting("car_name", car_name);
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
    getSetting("style") == "模块化"
      ? {
          title: "⌗自定义数据块",
          action: async () => {
            await listDataBlocks();
            await previewWidget();
          },
        }
      : null,

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
  ].filter((item) => item != null);
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
  saveSetting("style", "简约");
  saveSetting("theme_name", "跟随系统(渐变)");
  saveSetting("car_name", null);
  saveSetting("widget_data_block_info", null);
}

function getImageSize(
  image_width,
  image_height,
  canvas_width,
  canvas_height,
  resize_rate = 0.85
) {
  let a = image_width;
  let b = image_height;

  if (a > canvas_width || b > canvas_height) {
    if (resize_rate >= 1) {
      resize_rate = 0.99;
    }
    a *= resize_rate;
    b *= resize_rate;
    return getImageSize(a, b, canvas_width, canvas_height);
  }

  return { width: a, height: b };
}

function getCarName(api_car_name) {
  const user_defined_car_name = getSetting("car_name");
  if (user_defined_car_name) {
    return user_defined_car_name;
  } else {
    return api_car_name;
  }
}

async function loadMapView(latLng, width, height) {
  try {
    const map_api_key = getSetting("map_api_key");
    if (!map_api_key) {
      throw "获取地图失败，请检查API KEY";
    }

    width = parseInt(width);
    height = parseInt(height);

    let mapApiKey = map_api_key;

    let url = `https://restapi.amap.com/v3/staticmap?location=${latLng}&scale=2&zoom=15&size=${width}*${height}&markers=large,0x00CCFF,:${latLng}&key=${mapApiKey}&scale=2`;

    console.warn("load map from URL: " + url);
    let req = new Request(url);

    req.method = "GET";

    const img = await req.loadImage();
    return img;
  } catch (e) {
    console.log("load map failed");
    console.error(e.message);
    let canvas = new DrawContext();
    canvas.size = new Size(width, height);

    canvas.setFillColor(new Color("#eee"));
    canvas.fillRect(new Rect(0, 0, width, height));
    canvas.drawTextInRect(
      e.message || "获取地图失败",
      new Rect(20, 20, width, height)
    );

    return await canvas.getImage();
  }
}

function md5(str) {
  function d(n, t) {
    var r = (65535 & n) + (65535 & t);
    return (((n >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
  }
  function f(n, t, r, e, o, u) {
    return d(((c = d(d(t, n), d(e, u))) << (f = o)) | (c >>> (32 - f)), r);
    var c, f;
  }
  function l(n, t, r, e, o, u, c) {
    return f((t & r) | (~t & e), n, t, o, u, c);
  }
  function v(n, t, r, e, o, u, c) {
    return f((t & e) | (r & ~e), n, t, o, u, c);
  }
  function g(n, t, r, e, o, u, c) {
    return f(t ^ r ^ e, n, t, o, u, c);
  }
  function m(n, t, r, e, o, u, c) {
    return f(r ^ (t | ~e), n, t, o, u, c);
  }
  function i(n, t) {
    var r, e, o, u;
    (n[t >> 5] |= 128 << t % 32), (n[14 + (((t + 64) >>> 9) << 4)] = t);
    for (
      var c = 1732584193, f = -271733879, i = -1732584194, a = 271733878, h = 0;
      h < n.length;
      h += 16
    )
      (c = l((r = c), (e = f), (o = i), (u = a), n[h], 7, -680876936)),
        (a = l(a, c, f, i, n[h + 1], 12, -389564586)),
        (i = l(i, a, c, f, n[h + 2], 17, 606105819)),
        (f = l(f, i, a, c, n[h + 3], 22, -1044525330)),
        (c = l(c, f, i, a, n[h + 4], 7, -176418897)),
        (a = l(a, c, f, i, n[h + 5], 12, 1200080426)),
        (i = l(i, a, c, f, n[h + 6], 17, -1473231341)),
        (f = l(f, i, a, c, n[h + 7], 22, -45705983)),
        (c = l(c, f, i, a, n[h + 8], 7, 1770035416)),
        (a = l(a, c, f, i, n[h + 9], 12, -1958414417)),
        (i = l(i, a, c, f, n[h + 10], 17, -42063)),
        (f = l(f, i, a, c, n[h + 11], 22, -1990404162)),
        (c = l(c, f, i, a, n[h + 12], 7, 1804603682)),
        (a = l(a, c, f, i, n[h + 13], 12, -40341101)),
        (i = l(i, a, c, f, n[h + 14], 17, -1502002290)),
        (c = v(
          c,
          (f = l(f, i, a, c, n[h + 15], 22, 1236535329)),
          i,
          a,
          n[h + 1],
          5,
          -165796510
        )),
        (a = v(a, c, f, i, n[h + 6], 9, -1069501632)),
        (i = v(i, a, c, f, n[h + 11], 14, 643717713)),
        (f = v(f, i, a, c, n[h], 20, -373897302)),
        (c = v(c, f, i, a, n[h + 5], 5, -701558691)),
        (a = v(a, c, f, i, n[h + 10], 9, 38016083)),
        (i = v(i, a, c, f, n[h + 15], 14, -660478335)),
        (f = v(f, i, a, c, n[h + 4], 20, -405537848)),
        (c = v(c, f, i, a, n[h + 9], 5, 568446438)),
        (a = v(a, c, f, i, n[h + 14], 9, -1019803690)),
        (i = v(i, a, c, f, n[h + 3], 14, -187363961)),
        (f = v(f, i, a, c, n[h + 8], 20, 1163531501)),
        (c = v(c, f, i, a, n[h + 13], 5, -1444681467)),
        (a = v(a, c, f, i, n[h + 2], 9, -51403784)),
        (i = v(i, a, c, f, n[h + 7], 14, 1735328473)),
        (c = g(
          c,
          (f = v(f, i, a, c, n[h + 12], 20, -1926607734)),
          i,
          a,
          n[h + 5],
          4,
          -378558
        )),
        (a = g(a, c, f, i, n[h + 8], 11, -2022574463)),
        (i = g(i, a, c, f, n[h + 11], 16, 1839030562)),
        (f = g(f, i, a, c, n[h + 14], 23, -35309556)),
        (c = g(c, f, i, a, n[h + 1], 4, -1530992060)),
        (a = g(a, c, f, i, n[h + 4], 11, 1272893353)),
        (i = g(i, a, c, f, n[h + 7], 16, -155497632)),
        (f = g(f, i, a, c, n[h + 10], 23, -1094730640)),
        (c = g(c, f, i, a, n[h + 13], 4, 681279174)),
        (a = g(a, c, f, i, n[h], 11, -358537222)),
        (i = g(i, a, c, f, n[h + 3], 16, -722521979)),
        (f = g(f, i, a, c, n[h + 6], 23, 76029189)),
        (c = g(c, f, i, a, n[h + 9], 4, -640364487)),
        (a = g(a, c, f, i, n[h + 12], 11, -421815835)),
        (i = g(i, a, c, f, n[h + 15], 16, 530742520)),
        (c = m(
          c,
          (f = g(f, i, a, c, n[h + 2], 23, -995338651)),
          i,
          a,
          n[h],
          6,
          -198630844
        )),
        (a = m(a, c, f, i, n[h + 7], 10, 1126891415)),
        (i = m(i, a, c, f, n[h + 14], 15, -1416354905)),
        (f = m(f, i, a, c, n[h + 5], 21, -57434055)),
        (c = m(c, f, i, a, n[h + 12], 6, 1700485571)),
        (a = m(a, c, f, i, n[h + 3], 10, -1894986606)),
        (i = m(i, a, c, f, n[h + 10], 15, -1051523)),
        (f = m(f, i, a, c, n[h + 1], 21, -2054922799)),
        (c = m(c, f, i, a, n[h + 8], 6, 1873313359)),
        (a = m(a, c, f, i, n[h + 15], 10, -30611744)),
        (i = m(i, a, c, f, n[h + 6], 15, -1560198380)),
        (f = m(f, i, a, c, n[h + 13], 21, 1309151649)),
        (c = m(c, f, i, a, n[h + 4], 6, -145523070)),
        (a = m(a, c, f, i, n[h + 11], 10, -1120210379)),
        (i = m(i, a, c, f, n[h + 2], 15, 718787259)),
        (f = m(f, i, a, c, n[h + 9], 21, -343485551)),
        (c = d(c, r)),
        (f = d(f, e)),
        (i = d(i, o)),
        (a = d(a, u));
    return [c, f, i, a];
  }
  function a(n) {
    for (var t = "", r = 32 * n.length, e = 0; e < r; e += 8)
      t += String.fromCharCode((n[e >> 5] >>> e % 32) & 255);
    return t;
  }
  function h(n) {
    var t = [];
    for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1) t[e] = 0;
    for (var r = 8 * n.length, e = 0; e < r; e += 8)
      t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32;
    return t;
  }
  function e(n) {
    for (var t, r = "0123456789abcdef", e = "", o = 0; o < n.length; o += 1)
      (t = n.charCodeAt(o)), (e += r.charAt((t >>> 4) & 15) + r.charAt(15 & t));
    return e;
  }
  function r(n) {
    return unescape(encodeURIComponent(n));
  }
  function o(n) {
    return a(i(h((t = r(n))), 8 * t.length));
    var t;
  }
  function u(n, t) {
    return (function (n, t) {
      var r,
        e,
        o = h(n),
        u = [],
        c = [];
      for (
        u[15] = c[15] = void 0,
          16 < o.length && (o = i(o, 8 * n.length)),
          r = 0;
        r < 16;
        r += 1
      )
        (u[r] = 909522486 ^ o[r]), (c[r] = 1549556828 ^ o[r]);
      return (
        (e = i(u.concat(h(t)), 512 + 8 * t.length)), a(i(c.concat(e), 640))
      );
    })(r(n), r(t));
  }
  function t(n, t, r) {
    return t ? (r ? u(t, n) : e(u(t, n))) : r ? o(n) : e(o(n));
  }
  return t(str);
}

