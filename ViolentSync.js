//=============================================================================
// ViolentSync.js
//=============================================================================

/*:
 * @plugindesc サブフォルダのデータ同期＆除外を防ぐために『ピクチャの表示』を創造
 * @author linkscape
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc 強引にサブフォルダのデータを同期します
 *
 * Yuki Katsura, えーしゅん(仕様・ヘルプ文章)様の
 * Text2Frame.jsを改造して作ってあります。規約的にどうなのかはわかりません。
 * あしからず。
 * Text2FrameがMITライセンスなのでこれもそれを引き継ぎます。
 *
 * @help 
 * 注意！！必ずデータのバックアップを取ってください！！
 *
 * RPGツクールMVのファイルマネージャーは
 * どうやらサブフォルダ―に対応していないっぽいので、
 * サブフォルダ―のデータを./Pictureに同期させるという荒技を取ります。
 * これでサブフォルダーでファイルを整理しやすくなります。
 * ただし画像フォルダの容量が２倍になりますが
 * サブフォルダのデータは実質ゲームに使用されていないので
 * 「未使用データで削除」を使えば投稿時に消える筈です。
 *
 * 画像編集等をする時、ごった煮になった./Pictureフォルダに保存するよりも、
 * サブフォルダ―ごとに管理した方が楽です。
 * 
 * 使い方　
 * img/pictureの中にサブフォルダを作ってください( img/picture/tachie など)
 * $Sync.ALL()をF12で出てくるコンソールでうってください
 * picture以下にあるサブフォルダ―内の画像を全てpicture内にコピーできます。
 * 既にあるものは上書きされます。
 * 
 * $Sync.Exc()と打つと、
 * データを全て除外から守るように
 * 『ピクチャの表示』コマンドを使えます。
 * (個人的には容量は音楽や背景、タイトルがとっているので
 *    pictureを除外できなくてもあまり影響はないでしょう。)
 * (イベントコマンドをjsonから直接いじっているので、dataのバックアップを取ってください。
 *  指定したマップの指定したイベントにすべてのピクチャーデータに対応する
 * 　【ピクチャの表示】コマンドが書かれます。)
 * 
 *
 * @param Default MapID
 * @text 取り込み先マップID
 * @desc 取り込み先となるマップのIDを設定します。デフォルト値は1です。
 * @default 1
 * @type number
 *
 * @param Default EventID
 * @text 取り込み先イベントID
 * @desc 取り込み先となるイベントのIDを設定します。デフォルト値は2です。
 * @default 2
 * @type number
 */

(function() {

    const readMapData = function(mapid){
      try{
        return JSON.parse(fs.readFileSync(base + '/data/Map' + mapid + ".json", {encoding: 'utf8'}));
      }catch(e){
        throw new Error('Map not found. / マップが見つかりません。\n' + "MAP " + mapid);
      }
    };
    
    var parameters = PluginManager.parameters('ViolentSync');
    mapid = Number(parameters["Default MapID"]);
    eventid = Number(parameters["Default EventID"]);
    
    function ViolentSync() {
    }
    
    const fs   = require('fs');
    const path = require('path');
    const base = path.dirname(process.mainModule.filename);

    $Sync = new ViolentSync()
    
    ViolentSync.prototype.ALL = function(){
        this.syncAllFiles(this.PicturePath())
    }
    
    //関数定義
    ViolentSync.prototype.check = function(filePath) {
      var isExist = false;
      try {
        fs.statSync(filePath);
        isExist = true;
      } catch(err) {
        isExist = false;
      }
      return isExist;
    }

    ViolentSync.prototype.read = function(filePath) {
      var content = new String();
      if(this.check(filePath)) {;
        content = fs.readFileSync(filePath, 'base64');
      }
      return content;
    };
    
    ViolentSync.prototype.write = function(filePath, stream) {
      var result = false;
      try {
        fs.writeFileSync(filePath, stream,'base64');
        return true;
      } catch(err) {
        throw(err)
        return false;
      }
    }
    
    //Path取得
    ViolentSync.prototype.checkCurrentPath = function(){
        return process.cwd()
    }
    
    ViolentSync.prototype.PicturePath = function(){
        return this.checkCurrentPath() + "\\img\\pictures"
    }
    
    ViolentSync.prototype.syncAllFiles = function(current)  {
      const filenames = fs.readdirSync(current);
      console.log("Start")
      filenames.forEach((filename) => {
        const fullPath = current + "\\" + filename;
        const stats = fs.statSync(fullPath);
        if(stats.isDirectory()) {
            this.syncFolder(fullPath);
        }
      });
    }
    
    //Reference https://www.gesource.jp/weblog/?p=8215
    
    ViolentSync.prototype.syncFolder = function(p)  {
      const filenames = fs.readdirSync(p);
      filenames.forEach((filename) => {
        const fullPath = p + "\\" + filename;
        const stats = fs.statSync(fullPath);
        if(stats.isDirectory()) {
            this.syncFolder(fullPath);
        }else if(stats.isFile()){
            this.syncFile(fullPath, this.PicturePath(), filename)
        }
      });
    }
    
    ViolentSync.prototype.syncFile = function(fullPath, SyncFolder, filename){
        const data = this.read(fullPath)
        e = this.write(SyncFolder+ "\\" + filename, data);
        if(e){console.log(fullPath +"->"+ SyncFolder + " Success")}
        else{console.log(fullPath +"->"+ SyncFolder + " Failed")}
    }
    
    const writeData = function(filepath, jsonData){
      try{
        fs.writeFileSync(filepath, JSON.stringify(jsonData), {encoding: 'utf8'});
      }catch(e){
        throw new Error('Fail to save / 保存に失敗しました。\n' 
          + 'ファイルが開いていないか確認してください。\n' + filepath);
        console.error(e);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////
    
    var event_command_list = [];
    ViolentSync.prototype.EXC = function(){
        this.exAllFiles(this.PicturePath())
    }
    
    ViolentSync.prototype.exAllFiles = function(current)  {
      const filenames = fs.readdirSync(current);
      console.log("Start")
      filenames.forEach((filename) => {
        const fullPath = current + "\\" + filename;
        const stats = fs.statSync(fullPath);
        if(stats.isFile()) {
            console.log(filename)
            filename = filename.split(".")[0]
            event_command_list.push(getCommandShowPic(filename))
        }
      });
      this.writeData()
    }
    
    const getCommandShowPic = function(filename){
      var script_body = {"code":231,"indent":0,"parameters":[1,"linkscape",0,0,0,0,100,100,255,0]}
      script_body["parameters"][1] = filename;
      return script_body;
    }
    
    
    ViolentSync.prototype.writeData = function(){
        var filepath = base + '/data/Map' + ('000' + mapid).slice(-3) + ".json";
        //TODO:ないなら新しくイベントをコピーして作ってほしい！！
        //IDを変えないと上手くいかないな
        var map_data = readMapData(('000' + mapid).slice(-3));
        //申し訳ないけど絶対上書きする主義
        var len = event_command_list.length //map_data.events[i].pages.length
        var j = 0;
        var map_events = [];
        map_events = map_events.concat(event_command_list);
        console.log(map_events)
        map_data.events[eventid].pages[0].list = map_events;
        console.log(mapid,eventid,"success?")
        writeData(filepath, map_data)
    }
    
    function Copy(data){
        return JSON.parse(JSON.stringify(data));
    }
    
})();
