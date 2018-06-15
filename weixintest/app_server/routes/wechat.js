'use strict' ;//严格模式：是在 ECMAScript 5 中引入的概念。严格模式是为 Javascript 定义了一种解析与执行模型。

//静态变量
const crypto = require('crypto'), //引入加密模块
    https = require('https'), //引入 htts 模块
    fs = require('fs'), //引入 fs 模块
    urltil = require('url'),//引入 url 模块
    util = require('util'), //引入 util 工具包
    parseString = require('xml2js').parseString,//引入xml2js包
    // menus  = require('./menus'), //引入微信菜单配置
    // msg = require('./msg'),//引入消息处理模块
    // CryptoGraphy = require('./cryptoGraphy'); //微信消息加解密模块
    //引入本地存储的 access_token
    accessTocken = require('../data/access_token.json');//这里的变化是由于根目录被放在routes下


/**
 * 构建WeChat对象，js中函数就是对象
 * @param config 微信配置文件
 * @param accessTokenJson token写入文件
 * @constructor
 */

var WeChat = function (config) {////构建 WeChat 对象 即 js中 函数就是对象
    // 设置 WeChat 对象属性 config
    this.config = config;
    //设置 WeChat 对象属性 token
    this.token = config.token;
    //设置 WeChat 对象属性 appID
    this.appID = config.appID;
    //设置 WeChat 对象属性 appScrect
    this.appScrect = config.appScrect;
    //设置 WeChat 对象属性 apiDomain
    this.apiDomain = config.apiDomain;
    console.log("apiDomain is:"+this.apiDomain);
    //设置 WeChat 对象属性 apiURL
    this.apiURL = config.apiURL;


    /**Promise是ES6的新特性之一，接受的参数为function，function的两个参数resolve是将Promise的状态置为fullfiled，reject是将Promise的状态置为rejected
     * 用于向指定url发送get请求
     * @param url
     * @returns {Promise}
     */
    this.requestGet = function (url) {
        var p =  new Promise(function (resolve,reject) {
            // https 是异步请求的，我在这里面使用了 ES6 的 Promise 对象 。
            https.get(url,function (res) {
                var buffer = [],result = "";
                //监听 data 事件
                res.on('data',function (data) {
                    buffer.push(data)
                });
                //监听 数据传输完成事件
                res.on('end',function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    //将最后结果返回
                    resolve(result);
                });
            }).on('error',function (err) {
                reject(err);
            });
        });
        return p;
        //执行requestGet函数我们得到了一个Promise对象,为了方便做then，catch处理
    }
    /**
     * 用于处理 https Post请求方法
     * @param {String} url  请求地址
     * @param {JSON} data 提交的数据
     */
    this.requestPost = function (url,data) {
        var p = new Promise(function (resolve,reject) {
            //paese url
            var urlData = urltil.parse(url);
            //set https.request option 传入的参数对象
            var options={
                //目标主机地址
                hostname: urlData.hostname,
                //设置https.request options
                path: urlData.path,
                //请求方法
                methos:'POST',
                //头部协议
                headers:{
                    'Content-Type':'application/x-www-form-urlencodeed',
                    'Content-Length':Buffer.byteLength(data,'utf-8')
                }
            };
            var req = https.request(options,function (res) {
                var buffer = [],result = '';
                //用于监听 data 事件 接收数据
                res.on('data',function (data) {
                    buffer.push(data);
                });
                //用于监听 end 事件 完成数据的接收
                res.on('end',function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                })
            })
            //监听错误事件
                .on('error',function (err) {
                    console.log(err);
                    reject(err);
                });
            //传入数据
            req.write(data);
            req.end();
        });
    }
}




/**
 * sha1加密验证
 * @param timestamp
 * @param nonce
 * @param signature
 * @returns {boolean}
 */
function checkSign(token,timestamp,nonce,signature) {
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

/**
 * 微信接入验证
 * @param {Request} req Request 对象
 * @param {Response} res Response 对象
 * 验证操作：url:http://unn2v9.natappfree.cc/wechat
 * token:emma2018
 */
WeChat.prototype.auth = function (req,res) {
    var that = this;
    var signature = req.query.signature,//微信加密签名
        timestamp = req.query.timestamp,//时间戳
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串
    console.log(timestamp);
    console.log(nonce);
    console.log(signature);

    var resultAuth = checkSign(that.token,timestamp,nonce,signature);
    this.getAccessToken().then(function(data){
        //格式化请求连接
        var url = util.format(that.apiURL.createMenu,that.apiDomain,data);
        //使用 Post 请求创建微信菜单
        that.requestPost(url,JSON.stringify(menus)).then(function(data){
            //将结果打印
            console.log(data);

        });
    });
    //获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr


    if(resultAuth){
        res.send(echostr);
    }else{
        res.end("It is not from weixin");
    }
}

/**
 * 获取微信 access_token
 */
WeChat.prototype.getAccessToken = function () {
    var that = this;
    return new Promise(function(resolve,reject){
        //获取当前时间
        var currentTime = new Date().getTime();
        //格式化请求地址
        var url = util.format(that.apiURL.accessTokenApi,that.apiDomain,that.appID,that.appScrect);
        //判断 本地存储的 access_token 是否有效
        if(accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime){
            that.requestGet(url).then(function(data){
                var result = JSON.parse(data);
                if(data.indexOf("errcode") < 0){
                    accessTokenJson.access_token = result.access_token;
                    accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                    //更新本地存储的
                    fs.writeFile(accessTocken,JSON.stringify(accessTokenJson));
                    //将获取后的 access_token 返回
                    resolve(accessTokenJson.access_token);
                }else{
                    //将错误返回
                    resolve(result);
                }
            });
        }else{
            //将本地存储的 access_token 返回
            resolve(accessTokenJson.access_token);
        }
    });
}


module.exports = WeChat;//暴露可供外部访问的接口


/*
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
});
*/


/**
 * 获取微信 access_token
 */

//{"access_token":"6_Eoz93X-vqYyL1sPs0tMypwLUjvUn9MbauRiizI4bpex3LTyhnroZ0dbYDkZhHPpfuFwCBNMhYh5KzOVcnDloFSJLIn4G-RJy7XanCn1glMqGUvZvxQVmCnSEdb8ILUiAEANQZ","expires_in":7200}



/*WeChat.prototype.getAccessToken = function(){
    var that = this;
    return new Promise(function(resolve,reject){
        //获取当前时间
        var currentTime = new Date().getTime();
        //格式化请求地址
        var url = util.format(that.apiURL.accessTokenApi,that.apiDomain,that.appID,that.appScrect);
        //判断 本地存储的 access_token 是否有效
        if(accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime){
            that.requestGet(url).then(function(data){
                var result = JSON.parse(data);
                if(data.indexOf("errcode") < 0){
                    accessTokenJson.access_token = result.access_token;
                    accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                    //更新本地存储的
                    fs.writeFile('./wechat/access_token.json',JSON.stringify(accessTokenJson));
                    //将获取后的 access_token 返回
                    resolve(accessTokenJson.access_token);
                }else{
                    //将错误返回
                    resolve(result);
                }
            });
        }else{
            //将本地存储的 access_token 返回
            resolve(accessTokenJson.access_token);
        }
    });
}*/

