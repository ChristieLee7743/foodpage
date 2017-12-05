var express = require('express');
var ejs = require('ejs');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');

var client = mysql.createConnection({
    user: 'root',
    password: 'christie9826!',
    database: 'foodpage'
});

app.set('view engine', 'ejs');
app.set('views', './views');

// 모듈 등록
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.cookieParser());
app.use(session({
    key: 'sid',
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 50*60*60
    }
}));
var sess;
var id;
// 서버 연결
http.createServer(app).listen(5000, function() {
    console.log("Server Running at http://127.0.0.1:5000");
});

// 
app.get('/', function(req, res) {
    res.render('main', {login: "none"});
    /*
    fs.readFile('main', 'utf-8', function(error, data) {
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.end(ejs.render(data));
        if(error)
            console.log('readFile Error');
    });
    */
});

app.get('/imgsmap', function(req, res) {
    fs.readFile('map.jpg', function(error, data) {
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.end(data);
        if(error)
            console.log('readFile Error');
    });
});

app.get('/sign', function(req, res) {
    res.render('sign');
    /*
    client.query('SELECT * FROM people', function(err, results){
            res.end(ejs.render('sign', { people: results }));
        });
    
    fs.readFile('sign', 'utf-8', function(error, data) {
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.end(ejs.render(data));
        if(error)
            console.log('readFile Error');
       
    });
    */
});

app.get('/info_modify', function(req, res) {
    res.render('info_modify', {p_id: id});
})

app.post('/sign_form', function(req, res) {
    var id = req.body.p_id;
    var pw = req.body.p_pw;
    var nick = req.body.p_nick;
    client.query('INSERT INTO people(p_id, p_pw, p_nick) VALUES(?,?,?)', [id, pw, nick], function(err, result){
            if(err)
                res.send('<script>alert("중복된 값이 존재합니다."); location.href="/sign";</script>');
            else {
                res.redirect('/');
            }
    });
});

app.post('/login', function(req, res) {
    
    id = req.body.p_id;
    var pw = req.body.p_pw;
    console.log(id, pw);
    
    client.query('SELECT * FROM people WHERE p_id=? AND p_pw=?', [
        id, pw
    ], function (error, result, fields) {
//        console.log(result[0].p_id);
        if(result[0] == null){
                res.send('<script>alert("등록 정보가 없습니다."); location.href="/";</script>');
                console.log(error);
                //res.redirect('/');
        } else if(result[0] != null){
            sess = req.session;
            sess.id = id;
            sess.pw = pw;
            client.query('SELECT st.st_name, lo.lo_name FROM people p, store st, location lo, clip cl WHERE p.p_id=? AND p.p_id=cl.cl_p_id AND st.st_no=cl.cl_st_no AND st.st_lo_no=lo.lo_no', [id], function(err, data){
                res.render('main', {login: "yes", nick: result[0].p_nick, clip: data});
                console.log(data);
            })
           //res.send('<script>alert("정상 로그인 되었습니다.");/script>');
            
            console.log(id);
            console.log(sess.id);
        }
    });
});

app.post('/logout', function(req, res) {
    console.log('enter logout post');
     sess.destroy(function(err) {
        if(err) console.error('err', err);
        console.log('session destroied'); 
         
        console.log('rendered');
        //res.clearCookie('sid');
        //res.send('<script>alert("로그아웃 되었습니다.");</script>');
        console.log('logout');
    });
    res.render('main', {login: "none"});
});

app.post('/enter_modi', function(req, res) {
    var pw = req.body.p_pw;
    
    client.query('SELECT * FROM people WHERE p_id=? AND p_pw=?', [id, pw], function(error, result) {
        if(result[0] == null){
                res.send('<script>alert("정보가 일치하지 않습니다."); </script>');
                console.log(error);
                //res.redirect('/');
            client.query('SELECT * FROM people WHERE p_id=?', [id], function(err, data){
                res.render('main', {nick: data[0].p_nick});
            });
        } else {
            res.render('info_modify');
        }
    });
});

app.post('/info_modi', function(req, res) {
    var pw = req.body.p_pw;
    var pw_ck = req.body.p_pw_ck;
    var nick = req.body.p_nick;
    var query = 'UPDATE people SET ';
    console.log(sess.id);
    console.log(id);
    
    if(pw == pw_ck){
        query += 'p_pw="' + pw + '", ';
        query += 'p_nick="' + nick + '" ';
        query += 'WHERE p_id="' + id + '"';
        
        client.query(query, function(err, data) {
            res.send('<script>alert("정보가 정상적으로 수정되었습니다."); location.href="/";</script>');
        });
        sess.destroy(function(err) {
            if(err) console.error('err', err);
        });
        res.clearCookie('sid');
        res.render('main', {login: "none"});
        console.log(sess.id);
        //res.send('<script>alert("로그아웃 되었습니다.");</script>');
        console.log('logout');
    } else {
        res.send('<script>alert("비밀번호가 일치하지 않습니다."); location.href="/info_modify";</script>');
        //res.redirect('info_modify');
    }
});