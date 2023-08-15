// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

// LOL近期赛事列表小组件
// 支持中号、大号组件.
// 如果组件崩溃或出现任何问题，请尝试重新下载 Release：https://github.com/zkytech/iOS14-widgets-for-scriptable/releases
// 如果仍无法解决，请反馈至：https://github.com/zkytech/iOS14-widgets-for-scriptable/issues
try {
  const mainW = new ListWidget();
  presentSize = "large";
  mainW.backgroundColor = new Color("#282E4D");
  const LW = mainW.addStack();
  LW.layoutVertically();
  LW.centerAlignContent();
  let lineHeight = 30; // 图片的高度
  let teamNameFontSize = lineHeight * 0.5; // 队名文本大小
  let teamTxtWidth = 60; // 队名的容器宽度
  let timeStrWidth = 60; // 比赛开始时间的容器宽度，比如："16:00"
  let lineWidth = teamTxtWidth * 2 + lineHeight * 3 + timeStrWidth;
  let dateStrWidth = 60; // 分割线中的日期的宽度
  let dlineWidth = (lineWidth - dateStrWidth) / 2; // 分割线的左右两侧宽度比如 : ------2020-10-05------
  if (config.runsInWidget) {
    presentSize = null;
  }
  /**
   * 加载未进行的赛事的数据
   */
  async function loadLolUpcomingMatches() {
    const req = new Request(
      "https://widget.zkytech.top/widget/lol/getUpcomingMatches"
    );
    return req.loadJSON().then((res) => res.data);
  }

  /**
   * 加载正在进行的赛事的数据
   */
  async function loadLolRunningMatches() {
    const req = new Request(
      "https://widget.zkytech.top/widget/lol/getRunningMatches"
    );
    return req.loadJSON().then((res) => res.data);
  }

  /**
   * 加载未进行的赛事的数据
   */
  async function loadLolPastMatches() {
    const req = new Request(
      "https://widget.zkytech.top/widget/lol/getPastMatches"
    );
    return req.loadJSON().then((res) => res.data);
  }

  let pastMatches = await loadLolPastMatches();
  let runningMatches = await loadLolRunningMatches();
  let upcomingMatches = await loadLolUpcomingMatches();
  /**
   * 渲染大号组件
   */
  async function renderLarge() {
    let matches = pastMatches.concat(runningMatches).concat(upcomingMatches);
    if (matches.length > 6) {
      matches = matches.slice(matches.length - 7, matches.length - 2);
    }
    if (matches.length === 6) {
      matches = matches.slice(0, 5);
    }

    const matchImg = await loadImage(
      matches[matches.length - 1].league.image_url
    ); // 赛事logo
    const matchImageStack = LW.addStack();
    matchImageStack.size = new Size(267, 50);
    const matchImage = matchImageStack.addImage(matchImg);

    matchImage.imageSize = new Size(50, 50);
    await renderMatchList(matches);
  }

  /**
   * 渲染中号组件
   */
  async function renderMedium() {
    let matches = runningMatches.concat(upcomingMatches).slice(0, 2);
    const lt = 2 - matches.length;
    matches = pastMatches
      .slice(pastMatches.length - lt, pastMatches.length)
      .concat(matches);
    await renderMatchList(matches);
  }

  /**
   * 渲染小号组件
   */
  async function renderSmall() {
    const container = LW;
    container.layoutVertically();
    let matches = runningMatches.concat(upcomingMatches).slice(0, 6);
    const lt = 6 - matches.length;
    matches = pastMatches
      .slice(pastMatches.length - lt, pastMatches.length)
      .concat(matches);

    let lastDate = new Date(pastMatches[0].scheduled_at).getDate();

    for (let i = 0; i < matches.length; i++) {
      const val = matches[i];
      const team1 = val.opponents[0].opponent; // 队伍1
      const team2 = val.opponents[1].opponent; // 队伍2
      const matchScheduledAt = new Date(val.scheduled_at); // 比赛开始时间
      const timeStr = dateFormat("HH:MM", matchScheduledAt);

      if (i === 0 || matchScheduledAt.getDate() !== lastDate) {
        addDivider(
          matchScheduledAt,
          (lineWidth / 2) * 1.2,
          12,
          dlineWidth / 2,
          dateStrWidth
        ); // 日期分割线
      }
      lastDate = matchScheduledAt.getDate();

      const line = container.addStack();
      container.addSpacer(3);

      line.layoutHorizontally();
      const timeStack = line.addStack();
      const leftTeamStack = line.addStack();
      const scoreStack = line.addStack();
      const rightTeamStack = line.addStack();

      timeStack.size = new Size(16 * 3, 16);
      leftTeamStack.size = new Size(16 * 2.5, 16);
      scoreStack.size = new Size(16 * 2, 16);
      rightTeamStack.size = new Size(16 * 2.5, 16);

      scoreStack.layoutHorizontally();
      const timeTxt = timeStack.addText(timeStr);
      const leftTeamTxt = leftTeamStack.addText(team1.acronym);
      const rightTeamTxt = rightTeamStack.addText(team2.acronym);

      let [leftScoreTxt, dividerTxt, rightScoreTxt, vsTxt] = [
        null,
        null,
        null,
        null,
        null,
      ];
      if (val.status === "finished" || val.status === "running") {
        if (team1.id === val.results[0].team_id) {
          team1.score = val.results[0].score;
          team2.score = val.results[1].score;
        } else {
          team1.score = val.results[1].score;
          team2.score = val.results[0].score;
        }

        const leftScore = scoreStack.addStack();
        const dividerStack = scoreStack.addStack();
        const rightScore = scoreStack.addStack();
        leftScoreTxt = leftScore.addText(team1.score.toString());
        dividerTxt = dividerStack.addText(":");
        rightScoreTxt = rightScore.addText(team2.score.toString());
      } else {
        vsTxt = scoreStack.addText("VS");
      }
      const txts = [
        timeTxt,
        leftTeamTxt,
        rightTeamTxt,
        leftScoreTxt,
        dividerTxt,
        rightScoreTxt,
        vsTxt,
      ];
      txts.forEach((t) => {
        if (t) {
          t.font = Font.thinMonospacedSystemFont(15);
          t.textColor = Color.white();
        }
      });
    }
  }

  async function renderMatchList(matches) {
    let lastDate = new Date(pastMatches[0].scheduled_at).getDate();
    for (let i = 0; i < matches.length; i++) {
      const val = matches[i];

      const team1 = val.opponents[0].opponent; // 队伍1
      const team2 = val.opponents[1].opponent; // 队伍2
      const matchScheduledAt = new Date(val.scheduled_at); // 比赛开始时间
      const timeStr = dateFormat("HH:MM", matchScheduledAt);
      if (i === 0 || matchScheduledAt.getDate() !== lastDate) {
        addDivider(matchScheduledAt, lineWidth, 12, dlineWidth, dateStrWidth); // 日期分割线
      }
      lastDate = matchScheduledAt.getDate();
      // 队伍logo
      const team1Logo = await loadImage(team1.image_url);
      const team2Logo = await loadImage(team2.image_url);
      team1Logo.size = new Size(lineHeight, lineHeight);
      team2Logo.size = new Size(lineHeight, lineHeight);
      if (team1.id === val.results[0].team_id) {
        team1.score = val.results[0].score;
        team2.score = val.results[1].score;
      } else {
        team1.score = val.results[1].score;
        team2.score = val.results[0].score;
      }
      const LWl = LW.addStack();
      LWl.size = new Size(lineWidth, lineHeight + teamNameFontSize);
      const container = LWl.addStack(); // 多套一层是为了居中
      container.url = val.live_url;
      LW.addSpacer(6);
      const timeStrStack = container.addStack();
      const timeStrTxt = timeStrStack.addText(timeStr);
      timeStrStack.size = new Size(60, lineHeight + teamNameFontSize);
      timeStrStack.layoutVertically();
      timeStrStack.centerAlignContent();
      timeStrTxt.font = Font.thinMonospacedSystemFont(lineHeight * 0.7);
      timeStrTxt.textColor = Color.white();
      const team1Stack = container.addStack(); // 队伍1的logo、队名
      const scoreStack = container.addStack(); // 比分、比赛状态信息
      const team2Stack = container.addStack(); // 队伍2的logo、队名

      team1Stack.layoutVertically();
      team2Stack.layoutVertically();
      scoreStack.layoutVertically();
      const scoreStack1 = scoreStack.addStack(); // 比分
      const scoreStack2 = scoreStack.addStack(); // 比赛状态 (已结束/进行中/未开始)

      scoreStack1.size = new Size(lineHeight * 3, lineHeight);
      if (val.status === "not_started") {
        const vsTxt = scoreStack1.addText("VS");
        vsTxt.font = Font.boldMonospacedSystemFont(lineHeight);
        vsTxt.textColor = Color.white();
      } else {
        const team1ScoreStack = scoreStack1.addStack(); // 队伍1的分数
        const scoreDividerStack = scoreStack1.addStack(); // 冒号
        const team2ScoreStack = scoreStack1.addStack(); // 队伍2的分数

        const scoreDividerTxt = scoreDividerStack.addText(":");
        team1ScoreStack.layoutHorizontally();
        team2ScoreStack.layoutHorizontally();
        scoreDividerStack.layoutHorizontally();
        team1ScoreStack.centerAlignContent();
        team2ScoreStack.centerAlignContent();
        scoreDividerStack.centerAlignContent();
        const team1ScoreTxt = team1ScoreStack.addText(team1.score.toString());
        const team2ScoreTxt = team2ScoreStack.addText(team2.score.toString());
        team1ScoreStack.size = new Size(lineHeight * 0.65, lineHeight);
        team2ScoreStack.size = new Size(lineHeight * 0.65, lineHeight);
        scoreDividerStack.size = new Size(lineHeight * 0.65, lineHeight);

        const widgetTxts = [scoreDividerTxt, team1ScoreTxt, team2ScoreTxt];
        widgetTxts.forEach((txt) => {
          txt.centerAlignText();
          txt.font = Font.boldMonospacedSystemFont(lineHeight);
          txt.textColor = Color.white();
        });

        if (team1.score > team2.score) {
          team2ScoreTxt.textColor = Color.darkGray();
        } else if (team1.score < team2.score) {
          team1ScoreTxt.textColor = Color.darkGray();
        }
        scoreDividerTxt.textColor = Color.darkGray();
      }
      scoreStack1.layoutHorizontally();
      scoreStack1.centerAlignContent();
      let status = val.status;
      // 当前状态
      if (status === "finished") {
        status = "已结束";
      } else if (status === "running") {
        status = "进行中";
      } else if (status === "not_started") {
        status = "未开始";
      }
      let statusTxt = scoreStack2.addText(status);
      scoreStack2.size = new Size(lineHeight * 3, lineHeight);

      scoreStack1.layoutHorizontally();
      scoreStack1.centerAlignContent();

      const team1ImgStack = team1Stack.addStack();
      const team1TxtStack = team1Stack.addStack();

      const team2ImgStack = team2Stack.addStack();
      const team2TxtStack = team2Stack.addStack();
      const team1Img_ = team1ImgStack.addImage(team1Logo);
      const team2Img_ = team2ImgStack.addImage(team2Logo);

      const team1Txt = team1TxtStack.addText(val.opponents[0].opponent.acronym);
      const team2Txt = team2TxtStack.addText(val.opponents[1].opponent.acronym);
      team1ImgStack.size = new Size(teamTxtWidth, lineHeight);
      team2ImgStack.size = new Size(teamTxtWidth, lineHeight);
      team1Img_.imageSize = new Size(lineHeight, lineHeight);
      team2Img_.imageSize = new Size(lineHeight, lineHeight);
      team1TxtStack.size = new Size(teamTxtWidth, teamNameFontSize);
      team2TxtStack.size = new Size(teamTxtWidth, teamNameFontSize);

      const widgetTxts = [team1Txt, team2Txt, statusTxt];
      widgetTxts.forEach((txt) => {
        txt.centerAlignText();
        txt.font = Font.thinMonospacedSystemFont(lineHeight);
        txt.textColor = Color.white();
      });
      team1Txt.font = Font.thinMonospacedSystemFont(teamNameFontSize);
      team2Txt.font = Font.thinMonospacedSystemFont(teamNameFontSize);
      statusTxt.font = Font.thinMonospacedSystemFont(teamNameFontSize - 1);
      if (val.status === "running") {
        statusTxt.textColor = Color.green();
      }
      if (val.status === "finished") {
        statusTxt.textColor = Color.darkGray();
      }
    }
  }

  /**
   * 图片缓存到本地
   * @param {string} imageUrl : 图片URL
   */
  async function loadImage(imageUrl) {
    const fm = FileManager.local();
    const path = fm.documentsDirectory() + imageUrl.split("//")[1];

    const temp = imageUrl.split("/");
    const filename = temp[temp.length - 1];
    fm.createDirectory(path.split(filename)[0], true);
    if (!fm.fileExists(path)) {
      const img = await new Request(imageUrl).loadImage();
      fm.writeImage(path, img);
      return img;
    } else {
      return fm.readImage(path);
    }
  }

  /**
   * 获取日期（周一、周二、周三....）
   * @param {Date} date :
   */
  function getDay(date) {
    const dayMap = {
      0: "周日",
      1: "周一",
      2: "周二",
      3: "周三",
      4: "周四",
      5: "周五",
      6: "周六",
    };
    return dayMap[date.getDay()];
  }

  /**
   * 时间格式化
   * @param {string} fmt :模板字符串 : "YYYY-mm-dd HH:MM"
   * @param {Date} date :Date对象
   */
  function dateFormat(fmt, date) {
    let ret;
    const opt = {
      "Y+": date.getFullYear().toString(), // 年
      "m+": (date.getMonth() + 1).toString(), // 月
      "d+": date.getDate().toString(), // 日
      "H+": date.getHours().toString(), // 时
      "M+": date.getMinutes().toString(), // 分
      "S+": date.getSeconds().toString(), // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(
          ret[1],
          ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
        );
      }
    }
    return fmt;
  }

  /**
   * 渲染日期分割线左右侧的线条
   * @param {*} dividerStack : 分割线容器
   * @param {*} dividerLineWidth : 分割线宽度
   * @param {*} dividerLineHeight : 分割线高度
   */
  function addDividerLine(dividerStack, dividerLineWidth, dividerLineHeight) {
    const sideDividerStack = dividerStack.addStack();
    sideDividerStack.size = new Size(dividerLineWidth, dividerLineHeight);
    sideDividerStack.layoutVertically();
    sideDividerStack.addStack().size = new Size(
      dividerLineWidth,
      Math.floor(dividerLineHeight / 2) - 1
    );
    const sideDivider = sideDividerStack.addStack();
    sideDivider.size = new Size(dividerLineWidth, 1);
    sideDivider.backgroundColor = Color.white();
  }

  /**
   * 渲染日期分割线
   * @param {Date} date : 日期对象
   * @param {number} dividerWidth : 分割线宽度
   * @param {number} dividerHeight : 分割线高度
   * @param {number} dividerLineWidth : 分割线左右侧线条的宽度
   * @param {number} dividerTxtWidth : 分割线中的日期文本的宽度
   */
  function addDivider(
    date,
    dividerWidth,
    dividerHeight,
    dividerLineWidth,
    dividerTxtWidth
  ) {
    const day = getDay(date);
    const dividerStack = LW.addStack();
    // 渲染左侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight);
    // 日期文本容器
    const dividerTxtStack = dividerStack.addStack();
    // 渲染右侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight);
    // 渲染日期文本
    dividerStack.size = new Size(dividerWidth, dividerHeight);
    dividerTxtStack.size = new Size(dividerTxtWidth, dividerHeight);
    const dividerTxt = dividerTxtStack.addText(day);
    dividerTxt.font = Font.thinMonospacedSystemFont(dividerHeight - 1);
    dividerTxt.textColor = Color.white();
  }

  if (config.widgetFamily === "large" || presentSize === "large") {
    await renderLarge();
  }

  if (config.widgetFamily === "medium" || presentSize === "medium") {
    await renderMedium();
  }

  if (config.widgetFamily === "small" || presentSize === "small") {
    await renderSmall();
  }

  if (!config.runsInWidget) {
    if (presentSize == "large") {
      await mainW.presentLarge();
    }

    if (presentSize == "medium") {
      await mainW.presentMedium();
    }

    if (presentSize == "small") {
      await mainW.presentSmall();
    }
  }

  Script.setWidget(mainW);

  Script.complete();

  /**
   * 自动更新
   */
  async function update() {
    const fm = FileManager.iCloud();
    const folder = fm.documentsDirectory();
    const req = new Request(
      `https://widget.deepal.fun/iOS14-widgets-for-scriptable/master/lol.js
    );
    let scriptTxt = await req.loadString();

    if (!scriptTxt.includes("setWidget")) {
      return;
    }

    const filename = `/${Script.name()}.js`;
    if(req.response.statusCode == 200){
      fm.writeString(folder + filename, scriptTxt);
    }
  }

  // await update()
} catch {
  console.log(e);
}
