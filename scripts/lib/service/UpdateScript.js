/**
 * 自动更新
 */
async function update(file_url) {
    let fm 
    try{
      fm = FileManager.iCloud();
    }catch(e){
      fm = FileManager.local();
    }
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