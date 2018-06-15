var express = require('express');//EXPRESS框架
var path = require('path');
var favicon = require('serve-favicon');//网页的icon
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//页面
var index = require('./app_server/routes/index');
var users = require('./app_server/routes/users');
var upload = require('./app_server/routes/upload');
//服务
var wechat = require('./app_server/routes/wechat');
var tockenInfo = require('./app_server/routes/tockeninterface');
//配置读取
var config = require('./app_server/data/config.json');
//配置写入
//var accessTokenJson = require('./app_server/data/access_token.json');


module.exports = {
    'token': 'yourtoken',//配置中的token
    'appId': 'your appid',//配置里的appid
    'appSecret': 'your appsecret'//配置中的appsecret
};

//实例express框架
var app = express();

// view engine setup
app.set('views', path.join(__dirname, './app_server/views'));
app.set('view engine', 'ejs');//使用ejs模板

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//是基于 serve-static 开发的，负责托管 Express 应用内的静态资源。
//public 目录下面的文件就可以:http://localhost:3000/images/kitten.jpg访问了。
app.use(express.static(path.join(__dirname, 'public')));

//启动服务时调用一次
var wechatApp = new wechat(config)//实例wechat 模块

//用于处理所有进入 3000 端口 get 的连接请求
app.get('/wechat',function(req,res){
     wechatApp.auth(req,res);
});

//用于处理所有进入 3000 端口 post 的连接请求
app.post('/wechat',function(req,res){
     wechatApp.handleMsg(req,res);
});

//用于请求获取 access_token
app.get('/getAccessToken',function(req,res){
    // wechatApp.getAccessToken().then(function(data){
    //     res.send(data);
    // });
});


//路由位置
app.use('/', index);//定义主页面是做什么的
app.use('/users', users);
app.use('/tockeninterface', tockenInfo);
app.use('/upload',upload)
// app.use('/wechat', wechat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
