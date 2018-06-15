var express = require('express');
var url = require('url');
var crypto = require('crypto');
//crypto就是一个提供加密功能的模块。
// 在这个模块中已经打包了OpenSSL hash, HMAC（哈希信息验证码），cipher（加密）,decipher（解密）,sign（签名）以及verify（验证）的功能。
var router = express.Router();
var token=this.token;

router.get('/', function(req, res,next) {
try{
    var query = url.parse(req.url,true).query;
    var signature = query.signature;//如果没有则为undefined
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    var echostr = query.echostr;
    console.log("signature:"+signature);
    if(checkSign(timestamp,nonce,signature)){
        res.end(echostr);
    }else{
        res.end("It is not from weixin");
    }

}
catch (e){
    console.log("tockeninter error")
    res.end("It is not from weixin");
}

router.pos
    // res.send('respond with a resource');

   // res.writeHead(200, {'Content-Type': 'text/plain'});
    //使用上面部分报错： Can't set headers after they are sent.
    //由于express中的 res.header() 相当于 res.writeHead() ，res.send() 相当于 res.write()
//GET /tockeninterface?signature=8c9decf5c5ad39e5209c277a05a06aa19287e328&echostr=12588233314139111421&timestamp=1518328948&nonce=773588324 500 373.360 ms - 1209
    // 解析 url 参数
    /*var params = url.parse(req.url, true).query;
    var echostr = params.echostr;
    var nonce = params.nonce;
    var signature = params.signature;
    var timestamp = params.timestamp;
    var bb = checkSign(timestamp,nonce,signature)
    console.log("result:"+bb);
    res.send(echostr);*/
    // res.write("网站名：" + params.name);
    // res.write("\n");
    // res.write("网站 URL：" + params.url);
    //res.end();
});
function checkSign(timestamp,nonce,signature) {
    //加密/校验流程：
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    try{

    var currSign,tmp;
    tmp = [token,timestamp,nonce].sort().join("");
    console.log("code:"+tmp);
    currSign = crypto.createHash("sha1").update(tmp).digest("hex");
    console.log("currSign:"+currSign);
    //3.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信。
    return currSign === signature;
    }catch (e){
        return false;
    }
}
/*
router.post("/tockeninterface",function (req,res) {
    var url = req.query.url;
    var name = req.query.name;
    console.log(url, " name: "+name);
    req.on('data',function () {
        
    })
    res.end(util.inspect(url.parse(req.url, true)));
})
*/

module.exports = router;