/**
 * 自动更新
 */
async function update(file_url) {
    const fm = FileManager.iCloud();
    const folder = fm.documentsDirectory();
    const req = new Request(file_url);
    let scriptTxt = await req.loadString();
    const filename = `/${Script.name()}.js`;
    if (req.response.statusCode == 200) {
        fm.writeString(folder + filename, scriptTxt);
    }
}

module.exports = {
    update
}