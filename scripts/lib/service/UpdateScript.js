/**
 * 自动更新
 */
async function update(file_url) {
    if(!file_url.endsWith(".js")) {console.log(`更新地址错误,不是js文件:${file_url}`);return;}
    let fm 
    try{
      fm = FileManager.iCloud();
    }catch(e){
      fm = FileManager.local();
    }
    const folder = fm.documentsDirectory();
    try{
      const req = new Request(file_url);
      let scriptTxt = await req.loadString();
      const filename = `/${Script.name()}.js`;
      if (req.response.statusCode == 200) {
          fm.writeString(folder + filename, scriptTxt);
      }
    }catch(e){
      console.log(`文件更新出错:${file_url}`);
      console.log(e);
    }

}

module.exports = {
    update
}