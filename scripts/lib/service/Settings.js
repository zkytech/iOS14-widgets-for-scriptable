function getFileManager() {
  let fm;
  try {
    fm = FileManager.iCloud();
    fm.documentsDirectory()
  } catch {
    fm = FileManager.local();
  }
  return fm;
}

function getSettingsDir() {
  const fm = getFileManager();
  const script_dir = fm.documentsDirectory()
  const settings_dir = fm.joinPath(script_dir, "settings");
  if (!fm.fileExists(settings_dir)) {
    fm.createDirectory(settings_dir, true);
  }
  return settings_dir;
}

function saveDataToSettings(project_name, key, value) {
  let settings = loadSettings(project_name);
  if (settings == null) {
    settings = {};
  }
  settings[key] = value;
  writeSettings(project_name, settings);
}

function getDataFromSettings(project_name, key) {
  let settings = loadSettings(project_name);
  if (settings == null) {
    return null;
  }
  return settings[key];
}

function writeSettings(project_name, settings) {
  const fm = getFileManager();
  const settings_dir = getSettingsDir();
  const settings_file = fm.joinPath(settings_dir, `${project_name}.json`);
  fm.writeString(settings_file, JSON.stringify(settings));
}

function loadSettings(project_name) {
  const fm = getFileManager();
  const settings_dir = getSettingsDir();
  const settings_file = fm.joinPath(settings_dir, `${project_name}.json`);
  if (fm.fileExists(settings_file)) {
    try {
      fm.downloadFileFromiCloud(settings_file);
    } catch (e) {}
    return JSON.parse(fm.readString(settings_file));
  } else {
    return null;
  }
}

module.exports = {
  saveDataToSettings,
  getDataFromSettings,
  loadSettings,
  writeSettings,
};
