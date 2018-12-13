let compression = require('compression')
    express     = (require('express'))(),
    fs          = require('fs'),
    req         = require('request'),
    _API        = {
        1: {tag:'m4a', code:'m4a'},
        2: {tag:'mp3', code:'mp3_l'},
        3: {tag:'mp3', code:'mp3_h'},
        4: {tag:'flac',code:'flac'},
    };
express.use(compression());
express.get('*/ajax',(request,response) => {
    ajax(request.query,(data,error) => {
        response.status(200).send(data);
    });
});

express.get('*',(request,response) => {
    let file = decodeURI(`${__dirname}${request.url}`);
    fs.stat(file,error => {
        if(error) {
            response.status(404).send('404 not found!');
        } else {
            //如果为音乐文件 则返回文件属性
            if (/(\.mp3|\.flac|\.m4a)/.test(file)) {
                response.setHeader("Pragma", "No-cache");
                response.setHeader("Cache-Control", "No-cache");
                response.append("Content-Disposition","attachment");
            }
            response.status(200).sendFile(file);
        }
    });
});

express.listen(80,() => {
    console.log('监听 80 端口中...');
});

let url     = '/';
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
        "Accept": "*/*",
        "Referer": "https://y.qq.com/portal/player.html",
        "Accept-Language": "zh-CN,zh;q=0.8",
        "Cookie": "pgv_pvid=8455821612; ts_uid=1596880404; pgv_pvi=9708980224; yq_index=0; pgv_si=s3191448576; pgv_info=ssid=s8059271672; ts_refer=ADTAGmyqq; yq_playdata=s; ts_last=y.qq.com/portal/player.html; yqq_stat=0; yq_playschange=0; player_exist=1; qqmusic_fromtag=66; yplayer_open=1",
    };

var ajax = (data,callblack) => {
    let returns = {
        error: false,
        data: ''
    };
    switch (data.type) {
        //获取qq的api
        case 'qqapi':
            url     = `http://www.douqq.com/qqmusic/qqapi.php?mid=${data.mid}`;
            break;
        case 'dw':
            let _spoc = _API[data.size],
                _name = `${data.filename}${data.size}.${_spoc.tag}`,
                _path = `${__dirname}/${_name}`;
            fs.stat(_path,(err,stats) => {
                //获取文件信息
                let _file = {
                    name : _name,
                    size : stats ? stats.size : 0,
                    error: false
                };
                //如果文件不存在则下载文件 相反 直接返回文件
                if(err) {
                    ajax({type: 'qqapi',mid: data.mmid},datas => {
                        let text = datas.replace(/\\/g,'');
                        datas = JSON.parse(text.substring(2,text.length - 2));
                        let url = datas[_API[data.size].code],
                            _req = req({url:url});

                        _req.pipe(fs.createWriteStream(_name));
                        _req.on('end',function (res) {
                            _file.size = fs.statSync(_path).size;
                            //如果文件过小判定为无效文件，输出错误并删除
                            if (_file.size < 1048){
                                _file.error = 'error: download file is too small!';
                                fs.unlink(_path,error => { console.log(error); });
                            }

                            //30分钟后删除文件
                            setTimeout(function () {
                                fs.unlink(_path,error => {
                                    console.log(error);
                                });
                            },1000 * 60 * 30);

                            //回调函数
                            callblack(JSON.stringify(_file),returns.error);
                        });
                    });
                } else {
                    callblack(JSON.stringify(_file),returns.error);
                }
            });
            return;
            break;
        case 'search':
            json = false;
            url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?g_tk=5381&uin=0&format=jsonp&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w='+ encodeURI(data.search) +'&zhidaqu=1&catZhida=1&t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=' + data.pages + '&remoteplace=txt.mqq.all&_=1520833663464'
            break;
        case 'lyeiccs':
            url = "https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?callback=MusicJsonCallback_lrc&pcachetime=1494070301711&songmid="+data.mmid+"&g_tk=5381&jsonpCallback=MusicJsonCallback_lrc&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8¬ice=0&platform=yqq&needNewCode=0";
            break;
    }
    //错误处理
    req({
        url: url,
        headers: headers
    }, (error,response,body) => {
        if(!error && response.statusCode == 200) {
            //数据二次处理
            switch (data.type) {
                case 'lyeiccs':
                    eval(body);
                    function MusicJsonCallback_lrc(data) {
                        let lyric = String(data.lyric);
                        body = (Buffer.alloc(lyric.length,lyric, 'base64')).toString();
                    }
                    function MusicJsonCallback() {
                        body = '未搜索到歌词!<br />' + body
                    }
                    break;
                case 'qqapi':
                    body = JSON.stringify(body);
                    break;
            }
            if (body) {
                callblack(body, returns.error);
            } else {
                callblack(404, returns.error);
            }
        }
    });
}