// 获取carId
async function getCarId(token) {
  console.log("开始获取carId");
  const req = new Request(
    "https://app-api.deepal.com.cn/appapi/v1/message/msg/cars"
  );
  req.method = "POST";
  req.body = JSON.stringify({
    "vcs-app-id": "inCall",
    token: token,
    type: "1",
  });
  req.headers = {
    "Content-Type": "application/json",
  };
  const result = await req.loadJSON();
  if (result["success"]) {
    return result["data"][0].carId;
  } else {
    return null;
  }
}

// 获取token
async function getToken(param_refresh_token) {
  console.log("开始获取token");
  const fm = FileManager.iCloud();
  const refresh_token_file_path = fm.documentsDirectory() + "/refresh_token";
  fm.downloadFileFromiCloud(refresh_token_file_path);
  let local_refresh_token = "";
  if (fm.fileExists(refresh_token_file_path)) {
    local_refresh_token = fm.readString(refresh_token_file_path);
  }
  const req = new Request(
    "https://app-api.deepal.com.cn/appapi/v1/member/ms/refreshCacToken"
  );
  req.method = "POST";
  req.body = JSON.stringify({
    refreshToken:
      local_refresh_token ? local_refresh_token : param_refresh_token,
  });
  req.headers = {
    "Content-Type": "application/json",
  };
  const result = await req.loadJSON();
  if (result["success"] && result["data"]["refresh_token"] != null) {
    const refresh_token = result["data"]["refresh_token"];
    const access_token = result["data"]["access_token"];
    fm.writeString(refresh_token_file_path, refresh_token);
    return access_token;
  } else {
    console.error("token refresh failed");
    if (
      param_refresh_token &&
      param_refresh_token != local_refresh_token &&
      param_refresh_token != "" &&
      result["success"] == false
    ) {
      fm.writeString(refresh_token_file_path, param_refresh_token);
      return getToken();
    }

    return null;
  }
}

// 发出命令刷新车辆数据(异步)--无效
async function refreshCarData(project_id) {
  console.log("开始刷新车辆状态数据");
  const stm = new Date().getTime();
  const req = new Request(
    `https://cbd-api.changan.com.cn:9092/v3/projects/${project_id}/collect?stm=${stm}`
  );
  req.method = "POST";
  await req.loadString();
}

// 获取车辆状态数据
async function getCarStatus(token, car_id) {
  console.log("开始获取车辆状态数据");
  const req2 = new Request(
    `https://m.iov.changan.com.cn/app2/api/car/data?keys=*&carId=${car_id}&token=${token}`
  );
  req2.method = "POST";
  const car_status = await req2.loadJSON();
  if (car_status["success"]) {
    return car_status["data"];
  } else {
    return null;
  }
}

// 获取车辆基本信息
async function getCarInfo(token, car_id) {
  console.log("开始获取车辆基本信息数据");
  const req = new Request(
    `https://m.iov.changan.com.cn/app2/api/v2/car/detail?carId=${car_id}&token=${token}`
  );
  req.method = "GET";
  const car_info = await req.loadJSON();
  if (car_info["success"]) {
    return car_info["data"];
  } else {
    return null;
  }
}

// 获取车辆位置信息
async function getCarLocation(token, car_id) {
  console.log("开始获取车辆位置信息");
  const req = new Request(
    `https://m.iov.changan.com.cn/appserver/api/cardata/getCarLocation?carId=${car_id}&mapType=GCJ02&token=${token}`
  );
  req.method = "POST";
  const car_location = await req.loadJSON();
  if (car_location["success"]) {
    return car_location["data"];
  } else {
    return null;
  }
}



module.exports = {
    getCarId,
    getToken,
    refreshCarData,
    getCarStatus,
    getCarInfo,
    getCarLocation
} 
