/***********************************************************
 * 文件名称： javascript.js
 * 内容摘要： 音乐播放器的前端主文件,负责获取后端数据和操作DOM及各种交互
 * 其他说明： 本项目只是自主练习项目,勿喷垃圾,虽不是目前的最高水平,但也是尽力优化编写,注释有点多,为以后优化打个效率上的基础
 * 完成日期： 2018/06/21
 * 当前版本： 1.1.0.1
 * 采   用： Vue,原生JS,ES6
 * 作   者： 史莱姆
 * 企   鹅： 478889187
 * 座 右 铭: */console.error('Stay hunger, Stay foolish!')/*
 ***********************************************************
 *                      修  改  记  录
 ** 修改记录1：
 *    修改日期： 2018/07/22
 *    版 本 号: 1.1.0.1
 *    修 改 人: 史莱姆
 *    修改内容：
 *       1.优化：
 *          1.1： 对其部分变量
 *          1.2： 添加顶部排版
 *          1.3： 下载时的算法
 *       2.添加：
 *          2.1： 加载完成后固定部分元素的位置
 *          2.2： 关于窗体的显示和按钮的优化
 *          2.3： 完成历史记录和收藏函数的公共
 *          2.4： 搜索时联想
 *
 */


let doc = document;
(() => {

    ///////////////////////////////
    /////       类名设置       /////
    ///////////////////////////////
    //此设置将影响到下方的运行
    let icon = {
        play : 'i-play',
        stop : 'i-stop',
        left : 'i-page-left',
        right: 'i-page-right',
        el: {}
    }
    //得到全部对象
    //let i = 0;
    Object.keys(icon).forEach(v => {
        if (v != 'el') {
            icon.el[v] = doc.getElementsByClassName(icon[v])[0];
        }
        //icon[v] ? i ++ : icon[v] = icon[v];
    });
    /*//如果元素名未找到
    if(i < Object.keys(icon).length) {
        throw `在初始化元素时共计${i}个未找到!`
    }*/
    ///////////////////////////////
    /////       元素获取       /////
    ///////////////////////////////
        //已播放进度条
    let outTime        = doc.querySelector('.outTime'),
        //已播放时间
        outStart       = doc.querySelector('.start'),
        //总时长
        outEnd         = doc.querySelector('.end'),
        //进度条背景
        TimeLoading    = doc.querySelector('.TimeLoading'),
        //标题
        name           = doc.querySelector('.name'),
        //歌手
        gs             = doc.querySelector('.title-span'),
        //内容区域
        movebox        = doc.querySelector('.movebox'),
        //控制区域
        direction      = doc.querySelector('.direction'),
        //控制区域里面的图
        dir_img        = direction.querySelectorAll('img'),
        //转盘
        round          = doc.querySelector('.round'),
        //歌词
        gc             = doc.querySelector('.gc').querySelector('ul'),
        //内的封面
        round_img      = round.querySelector('img'),
        //中间内容区域
        content        = doc.querySelector('.content'),
        //切换圆点
        rounds_all     = doc.querySelector('.rounds-all'),
        //圆点元素
        rounds_child   = rounds_all.querySelectorAll('span'),
        //背景图
        music_backg    = doc.querySelector('.music-backg').querySelector('img'),
        //搜索栏目的输入框
        search_input   = doc.querySelector('.search'),
        //前置内容区域
        row            = doc.querySelector('.row'),
        //弹窗窗体
        MSG            = doc.querySelector('.alert'),
        //弹窗载体
        DIVMSG         = MSG.querySelectorAll('div'),
        //弹窗遮罩
        zhezhao        = doc.querySelector('.zhezhao'),
        //搜索后显示的内容区域
        search_content = doc.querySelector('.search-content'),
        //提示背景
        print_box      = doc.querySelector('.print-box'),
        //提示主题
        print_msg      = doc.querySelector('.print'),
        //设置窗体
        setting_box    = doc.querySelector('.setting'),
        //关于窗体
        info_box       = doc.querySelector('.info'),
        //底部的图标
        footer_icon    = doc.querySelector('footer').querySelectorAll('span'),
        //底部控制区
        console_box    = doc.querySelector('.console'),
    ///////////////////////////////
    /////       变量存储       /////
    ///////////////////////////////
        //计时器
        Inter          = null,
        //歌词计时器
        gcInter        = null,
        //旋转计时器
        DegInter       = null,
        //旋转角度
        roundDeg       = 0,
        //单页的宽度
        li_Width       = movebox.querySelector('li').offsetWidth,
        //页数
        pages          = '0',
        //触摸状态
        Touch          = false,
        //搜索 按下播放的上一个元素
        search_element = null,
        //滚动状态
        mousewheel     = false

    //歌词变量初始值
    var gc_content,contTop,contHei,contPos,
        //上一个歌词元素(绿色)
        lis = null,
        //上上一个歌词元素(绿色) 上一个歌词元素(透明)
        oldL = 0, opLi = 0;

    SongInfo = new Vue({
        el      : '.info-content',
        data    : {
            name    : 'Failed SONG TITLE',
            tag     : 'Failed SONG TAG',
            gs      : '暂无信息...',
            outEnd  : '0:00',
            pubtime : '0000-00-00',
            download: '信息获取失败...'
        },
        methods: {
            dw: function (e) {
                let element = e.target;
                if(element.tagName.toLowerCase() == 'div') {
                    print('正在破解音乐链接!请稍等...');
                    setTimeout(() => {
                        print('音乐越大破解所需时间越长!');
                    },3000);
                    let start = new Date();
                    api = new XMLHttpRequest();
                    //console.log(element.dataset.i,element.dataset)
                    api.open('GET',`ajax?type=dw&size=${element.dataset.i}&mmid=${Music._SONG_MMID}&filename=${Music._SONG_NAME}`);
                    api.send();
                    api.onreadystatechange = () => {
                        if (api.status == 200 && api.readyState == 4) {
                            let json = JSON.parse(api.responseText);
                            if(!json.error) {
                                a = doc.createElement('a');
                                a.href = json.name;
                                document.body.appendChild(a)
                                a.click()
                                print(`破解完成!耗时${(new Date() - start)/1000}秒,共计${Math.floor(json.size / 1024 / 1024)}MB<br/>下载有效期为 半小时!`);
                            } else {
                                showMSG(`破解失败!${json.error}`);
                            }
                        }
                    }
                }
            }
        }
    });


    var _API = null;
    //初始化接口
    console.log('-------------------------------');
    console.log('  本站仅测试,不承担任何法律责任!');
    /*api = new XMLHttpRequest();
    api.open('GET','ajax?type=qqapi');
    api.send();
    api.onreadystatechange = () => {
        if(api.status == 200 && api.readyState == 4) {
            _API = api.responseText;
            console.log('  QQ音乐 VIP接口初始化中...' + (_API ? '成功' : '失败:' + _API));
            console.log('-------------------------------');
        }
    }*/
    console.log('-------------------------------');

    //获取播放接口
    function getAPI(mid) {
        let res = {};
        for (tag in _API) {
            res[tag] = _API[tag].replace('[--mid--]',mid);
        }
        return res;
    }

    //设置存储的变量
    var setting = {
        //初始化数据函数
        init: function () {
            //获取本地存储的数据
            let set = window.localStorage.getItem('setting');
            //如果本地没有数据
            if(!set) {
                //写入初始数据
                window.localStorage.setItem('setting',JSON.stringify({
                    'backgFilter'     : '3px',                  //背景模糊程度
                    'roundSpeed'      : '8500',                 //转盘速度
                    'LoadingColor'    : '#24f790d4',            //进度条颜色
                    'lyricsReadColor' : '#24f790d4',            //正在播放的文字颜色
                    'lyricsColor'     : '#fff'                  //未读文字颜色
                }));
                zhezhao.style.display = 'flex';
                row.style.filter = 'blur(6px)';
                info_box.style.display = 'block';
                print('请仔细阅读关于!');
            } else {
                //如果有数据
                let self = this;
                //解析数据
                set = JSON.parse(set);
                //将数据存入本体
                for(let prototype in set) {
                    self[prototype] = set[prototype];
                }
            }
        },
        //音乐历史记录函数
        record: {
            data : [],
            //获取历史记录函数
            get: function () {
                let record = JSON.parse(window.localStorage.getItem('record'));
                this.data = record;
                if(!record) {
                    return '未找到任何音乐历史记录...';
                } else return record;
            },
            //写入单条数据函数
            set: function (value) {
                let record = JSON.parse(window.localStorage.getItem('record')) || {length: 0}
                    ls = 0;
                //遍历数据
                record.length ++;
                for(let i in record) {
                    //如果这条数据是损坏的则跳过
                    if(!record[i] || record[i] == 'undefined') continue;
                    //如果这个音乐已经存在记录中 并将它移到最到上面
                    if(record[i].mmid == value.mmid) {
                        record[i] = 'undefined';
                        record[record.length] = value;
                        ls = 1;
                    }
                }
                //如果这条数据不在里面 就 添加一个记录
                if(!ls) {
                    record[record.length] = value;
                }
                //写入本地存储
                window.localStorage.setItem('record',JSON.stringify(record));
                return record;
            },
            //保存全部数据函数
            save: function(data) {
                window.localStorage.setItem('record',JSON.stringify(data));
            }
        },
        //音乐历史记录函数
        SongList: {
            data : [],
            //获取历史记录函数
            get  : function () {
                let SongList = JSON.parse(window.localStorage.getItem('SongList'));
                this.data = SongList;
                if(!SongList) {
                    return '未找到任何音乐历史记录...';
                } else return SongList;
            },
            //写入单条数据函数
            set  :  function (value) {
                let SongList = JSON.parse(window.localStorage.getItem('SongList')) || {length: 0}
                    ls = 0;
                SongList.length ++;
                for(let i in SongList) {
                    //如果这条数据是损坏的则跳过
                    if(!SongList[i]) continue;
                    //如果这个音乐已经存在记录中
                    if(SongList[i].mmid == value.mmid) {
                        ls = 1;
                    }
                }
                //如果这条数据不在里面 就 添加一个记录
                if(!ls) {
                    SongList[SongList.length] = value;
                }
                //写入本地存储
                window.localStorage.setItem('SongList',JSON.stringify(SongList));
                return SongList;
            },
            //保存全部数据函数
            save : function(data) {
                window.localStorage.setItem('SongList',JSON.stringify(data));
            }
        }
    }
    //初始化存储数据
    setting.init();
    let Music = {
        //播放器控件
        _AUDIO: null,
        //歌名
        _SONG_NAME: 'Failed SONG TITLE',
        //专辑
        _SONG_TAG: 'Failed SONG TAG',
        //歌曲识别码
        _SONG_MMID: '00000000000000',
        //歌手 可能有多个 所以用数组
        _SONG_SINGER: [],
        //歌词
        _SONG_LYRICS: [],
        //封面识别码
        _JPEG_MMID: '00000000000000',
        //播放时间
        _INTERVAL: 0,
        //播放状态
        _PLAY_TYPE: 'STOP',
        //播放 状态码
        _PLAY_CODE: 1,
        //搜索后存储的数据
        _SEARCH: {},
        //搜索内容
        _SEARCH_CONTEN: '',
        //加载 并 播放 新的音乐
        PlaySong: function(data) {
            let self = this;
            // if(data.songmid == self._SONG_MMID) return '终止加载音乐!原因: 识别码相同';
            //记录音乐属性
            SongInfo.name = self._SONG_NAME = data.songname;
            SongInfo.tag = self._SONG_TAG = data.albumname;
            self._SONG_MMID = data.songmid;
            self._JPEG_MMID = data.albummid;
            self._INTERVAL = data.interval;
            self._SONG_SINGER = data.singer;
            /*console.log(self._SONG_NAME);
            console.log(SongInfo.data);*/
            //异步获取歌词
            self._SONG_LYRICS = self.ajax({
                type: 'lyeiccs',
                mmid: self._SONG_MMID
            },'unData');

            //输出歌手
            singerList = [];
            for(let singer of self._SONG_SINGER) {
                singerList.push(singer.name);
            }
            SongInfo.gs = singerList.join(' , ');
            //设置播放器
            self._AUDIO.src = `http://ws.stream.qqmusic.qq.com/C100${self._SONG_MMID}.m4a?fromtag=0&guid=126548448`;
            music_backg.src = `http://y.gtimg.cn/music/photo_new/T002R300x300M000${self._JPEG_MMID}.jpg`;
            round_img.src = `http://y.gtimg.cn/music/photo_new/T002R300x300M000${self._JPEG_MMID}.jpg`;
            SongInfo.outEnd = outEnd.innerHTML = unDateTime(self._INTERVAL);
            name.innerHTML = self._SONG_NAME;
            gs.innerHTML = self._SONG_SINGER[0].name;
            self.Play();
            //设置 添加日期
            SongInfo.pubtime = new Date(data.pubtime * 1000);
            //破解qq音乐歌曲
            let download = '';
            if(data.sizeogg > 0) download += `<div class="download" data-i="1"><span>流畅品质</span><span>[${getMB(data.sizeogg/2)} MB]</span>96kbps</div>`;
            if(data.size128 > 0) download += `<div class="download" data-i="2"><span>标准品质</span><span>[${getMB(data.size128)} MB]</span>128kbps</div>`;
            if(data.size320 > 0) download += `<div class="download" data-i="3"><span>HQ高品质</span><span>[${getMB(data.size320)} MB]</span>320kbps</div>`;
            if(data.sizeflac > 0) download += `<div class="download" data-i="4"><span>SQ无损品质</span><span>[${getMB(data.sizeflac)} MB]</span>1500+kbps</div>`;
            console.log(data)

            SongInfo.download = download;
        },
        //播放音乐
        Play: function() {
            let self = this;
            //验证音乐是否为真实
            if(self._SONG_MMID == '00000000000000')
                return showMSG(`歌曲校验码识别失败<br />Code: ${self._SONG_MMID}<br />Title: ${self._SONG_NAME}<br />只有搜索的歌曲才能播放!!!`);
            //清除全部计时器和属性
            clearInterval(Inter);
            clearInterval(gcInter);
            clearInterval(DegInter);
            //设置播放器
            if (self._AUDIO.play) {
                self._AUDIO.play();
            }
            Inter = setInterval(setInter,1000);
            gcInter = setInterval(InterGC,2);
            icon.el.play.className = icon.stop;
            self._PLAY_TYPE = 'PLAY';
            RoundDeg();
            //在历史记录里面写入记录
            setting.record.set({
                'name' : self._SONG_NAME,
                'tag'  : self._SONG_TAG,
                'mmid' : self._SONG_MMID,
                'jpg'  : self._JPEG_MMID,
                'Load' : self._AUDIO.currentTime,
                'time' : (new Date).valueOf()
            });

            let data = setting.SongList.data;
            for (let i = 0,len = data.length; i < len; i ++) {
                if(data[i] && data[i].name == self._SONG_NAME) {
                    footer_icon[0].className = 'i-love';
                }
            }
        },
        //暂停音乐
        Pasue: function() {
            let self = this;
            //清空计时器
            clearInterval(Inter);
            clearInterval(gcInter);
            clearInterval(DegInter);
            //设置音乐状态
            self._PLAY_TYPE = 'STOP';
            //暂停音乐
            self._AUDIO.pause();
            //设置按钮样式
            icon.el.play.className = icon.play;
            //在历史记录里面写入记录
            setting.record.set({
                'name' : self._SONG_NAME,
                'tag'  : self._SONG_TAG,
                'mmid' : self._SONG_MMID,
                'jpg'  : self._JPEG_MMID,
                'Load' : self._AUDIO.currentTime,
                'time' : (new Date).valueOf()
            });
        },
        //搜索歌
        getWebSong: function(e,searchs,pages = 1) {
            //如果设置的要搜索的关键词 则 搜索关键词 反之 获取输入框内容
            searchs = searchs || search_input.value;
            //保存搜索内容
            this._SEARCH_CONTEN = searchs;
            //异步获取搜索结果
            Music.ajax({
                type: 'search',
                search: searchs,           //搜索的关键词
                pages: pages               //页数
            });
            //显示搜索提示
            search_content.innerHTML = `正在搜索关键词 "${searchs}" ...`;
        },
        //AJAX 获取数据
        ajax: function(data = {type:'xx'},call = null) {
            let xhr = new XMLHttpRequest(),
                //链接内的数据
                UrlData = '';
            //如果有数据要传入
            for(let val in data) {
                UrlData += `${val}=${data[val]}&`;
            }
            xhr.open('GET',`ajax?${UrlData}`);
            xhr.send();
            xhr.onreadystatechange = () => {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    let data = xhr.responseText;
                    if(data) {
                        eval(call ? `${call}(`+'`'+data+'`'+`)` : data);
                    }
                }
            }
        }
    }

    //刷新歌词
    function unData(GC) {
        //文本内容
        GC = GC.split("\n");
        let text = '',
            //获取歌词可视高度
            before = movebox.offsetHeight,
            BY = false;
        for(let i = 0,l = GC.length;i < l; i++) {
            if (GC[i] == '[by:]') {
                if (BY) break;
                BY = true;
            }
            //分割歌词和时间
            contents = GC[i].split(']');
            //如果为 时间 格式
            if(contents[0] === '[by:' || contents[0] === '[offset:0') continue;
            if((new RegExp(/\d+\:\d+\.\d+/)).test(contents[0])){
                //判为 标准格式 去除开头的 "["
                contents[0] = contents[0].substring(1,contents[0].length);
            } else {
                //判为 无时间格式 去除开头的 "[" 并且内容为开头
                contents[1] = contents[0].substring(1,contents[0].length);
                contents[0] = `00:00.${i}0`;
            }
            //将歌词附加给 text
            text += `<li data-time="${contents[0]}" data-i="${i}">${contents[1]}</li>`;
        }
        if(text == '00:00:00'){
            text = GC.toString().split(']')[1];
        }
        //歌词添加到gc对象下
        gc.innerHTML = text;
        //获取所有歌词的li元素
        gc_content = gc.querySelectorAll('li');
        /*//获取内容区域的顶部距离
        contTop = content.offsetTop,
        //获取内容区域的高度
        contHei = content.offsetHeight,
        //获取内容区域的绝对位置
        contPos = contTop + contHei
        //保存歌词
        console.log(GC)*/
        Music._SONG_LYRICS = GC;
    }

    //初始化音乐组件
    Music._AUDIO = doc.getElementsByTagName('audio')[0];

    //转盘 计时器
    function RoundDeg() {
        DegInter = setInterval(function () {
            if(pages != 1) clearInterval(DegInter);
            roundDeg ++;
            round.style.transform = `rotateZ(${roundDeg}deg)`;
        },8500 / 360);
    }

    //播放进度检测 计时器
    function setInter() {
        let current = Music._AUDIO.currentTime;
        //播放结束
        if(current >= Music._INTERVAL) {
            return Music.Play();
            //return Music.Pasue();
        }
        //爆炸检测
        if(Music._PLAY_CODE === current) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET',Music._AUDIO.src);
            xhr.send();
            xhr.onreadystatechange = () => {
                if(xhr.status == 404 && xhr.readyState == 4) {
                    showMSG('歌曲获取失败!可能是[版权/会员权限/链接失效]等原因!!','警告');
                    Music.Pasue();
                }
                // if(xhr.status == 0 && xhr.readyState == 4) {
                //     showMSG('数据断开啦!音乐找不到数据啦!!!!');
                //     Music.Pasue();
                // }
            }
        }
        // console.log(Music._AUDIO.currentTime,Music._INTERVAL);
        //设置已播放的长度
        outTime.style.width = current / (Music._INTERVAL / 100) + '%';
        //刷新已播放时间
        outStart.innerHTML = unDateTime(current);
        Music._PLAY_CODE = current;
    }

    audio = Music._AUDIO;
    //歌词函数
    function InterGC(){
        //如果歌词数据为空 或者 在滚动时 不执行下面的代码
        if(!gc_content || mousewheel) return;
        //如果本条歌词在 底部并且被遮住一半 则透明化
        for(let li of gc_content) {
            if(li.dataset.time == unDateTime(audio.currentTime,2)) {
                //歌词往上拉
                gc.style.transform = `translateY(-${li.dataset.i * li.offsetHeight - 150}px)`;
                //如果是第一次渲染
                if(lis == null) {
                    lis = li;
                } else if(lis != li) {
                    lis.className = '';
                    lis = li;
                }
                //改为居中
                li.className = 'center';
            }
            /*//li元素的高度 这里要减去已读的高度
            let lTop = li.offsetTop - ((lis ? lis.dataset.i : 0) * li.offsetHeight);
            //如果 读取了新的一行
            if(oldL != lis) {
                //如果本li在底部
                if (lTop + contTop < contPos && contPos < lTop + contTop + li.offsetHeight) {
                    //设置为底部样式
                    li.className = 'bottom'
                    //恢复上一个元素的样式
                    if (opLi) opLi.className = '';
                    //存储老元素 替换 新元素
                    opLi = li;
                    oldL = lis;
                }
            }*/
        }
    }

    ///////////////////////////////
    /////       事件管理       /////
    ///////////////////////////////

    //设置 点击进度条时的 事件
    TimeLoading.onclick = function (e) {
        let Loadings = e.offsetX / (this.offsetWidth / 100);
        //设置已播放的长度
        outTime.style.width = Loadings + '%';
        // console.log(Loadings,e.offsetX,this.offsetWidth ,100)
        //音乐跳转至此百分比
        Music._AUDIO.currentTime = Loadings * (Music._INTERVAL / 100);
        //立马刷新滑块
        setInter();
        clearInterval(Inter);
        Inter = setInterval(setInter,1000);
    }

    //圆点点击事件
    //处理 切换页面/切换特效展示/部分BUG弥补
    rounds_all.onclick = function(e) {
        let obj = e.target;
        if(obj.tagName.toLowerCase() == 'span') {
            //消失效果
            switch (pages) {
                case '1':
                    round.style.transition = '.5s';
                    round.style.transform = `scale(.3) rotateZ(${roundDeg}deg)`;
                    round.style.opacity = '0';
                    break;
                case '2':
                    gc.style.opacity = 0;
                    break;
                case '3':

                    break;
            }
            //点数改为空心
            rounds_child[pages].className = '';
            //点数改为实心
            obj.className = 's';
            //记录 目前ID
            pages = obj.dataset.t;
            //出现效果
            switch (pages) {
                case '1':
                    round.style.transition = '2s';
                    round.style.transform = 'scale(1)';
                    round.style.opacity = '1';
                    setTimeout(() => {
                        //重置过渡时间
                        round.style.transition = '0s';
                        //如果正在播放则重置动画
                        if(icon.el.play.className.indexOf('stop') > -1) {
                            RoundDeg();
                        }
                    },1800);
                    break;
                case '2':
                    gc.style.opacity = 1;
                    break;
                case '3':
                    break;

            }
            //重置触摸
            Touch = {x:pages * li_Width,y:0};
            movebox.style.transform = `translateX(-${pages * li_Width}px)`;
        }
    }

    //开始触摸中间区域时
    movebox.ontouchstart = e => {
        //如果存储内包含上次的位置
        let x = Touch.x ? Math.abs(Touch.x) : 0;
        //记录位置
        Touch = {
            x: e.changedTouches[0].clientX + x,
            y: e.changedTouches[0].clientY
        }
        movebox.style.transition = '.1s';
    }

    //结束触摸中间区域时
    let ALL_Width = li_Width * (movebox.querySelectorAll('li').length - 2);
    movebox.ontouchend = e => {
        //第一更手指的信息
        let X = e.changedTouches[0].clientX - Touch.x;
        //设定边界回弹
        X = Math.min(0,X);
        X = Math.max(-ALL_Width,X);
        //计算页数
        _pages = Math.round(X / li_Width);
        X = _pages * li_Width;
        Touch.x = X;
        //抛出效果
        movebox.style.transition = '1s';
        movebox.style.transform = `translateX(${X}px)`;
        rounds_child[pages].className = '';
        pages = Math.abs(_pages);
        rounds_child[pages].className = 's';
    }

    //在中间区域移动时
    movebox.ontouchmove = e => {
        if(!Touch.x) return;
        let X = e.changedTouches[0].clientX - Touch.x;
        movebox.style.transform = `translateX(${X}px)`;
    }

    //防止滑动列表时产生位移
    doc.querySelector('.search-box').ontouchmove = function(e) {
        e.stopPropagation();
    }

    //点击 放大镜时 搜索歌曲
    doc.querySelector('.search-img').onclick = Music.getWebSong;

    //当点击搜索栏目内的 播放按钮 时
    search_content.onclick = e => {
        let Element = e.target;
        if(Element.tagName.toLowerCase() == 'div') {
            if(Element.className.indexOf('play') > -1) {
                let data = Element.parentElement.parentElement.dataset;
                // console.log(Music._SEARCH.data.song.list,data.i)
                Music.PlaySong(Music._SEARCH.data.song.list[data.i]);
                Element.className = 'min-img stop';
                if(search_element) search_element.className = 'min-img play';
                search_element = Element;
            } else if(Element.className.indexOf('stop') > 0) {
                Music.Pasue();
                Element.className = 'min-img play';
                //console.log(1)
            }
        }
    }

    /*
        获取 时间的格式
        如果 fixed == 0 则 @return 格式[00:00]
        如果 fixed > 0 则 @return 格式[00:00.00]
    */
    function unDateTime(Time = 0,fixed = 0) {
        let num = (Time % 60).toString(),
            num2 = fixed ? num.substring(0,num.indexOf('.') + 3) : Math.ceil(num);
        return ('00' + Math.floor(Time / 60)).slice(-2) + ':'
            +  ('00' + num2).slice((fixed > 0 ? -3 - fixed : -2));
    }

    function reDateTime(Time = '00:00.00') {
        console.log(Time)
        if(!Time.indexOf('.') || !Time.indexOf(':')) return false;
        let Num  = Time.split('.'),
            Num2 = Num[0].split(':'),
            intg = (Num2[0] * 60) + (Num2[1] - 0);
        return intg + '.' + Num[1]
    }

    //搜索完后触发的函数
    function callback(object) {
        //歌曲信息
        Music._SEARCH = object;
        // console.log(object)
        //获取列表信息
        let song = object.data.song,
            i = 0,
            len = song.curpage;
        //写入搜索头部
        text = '<ul><li><span style="color: white">歌名</span><span>歌手</span><span>时长</span><span>操作</span></li>';
        //获取爱好音乐列表
        let SonList = setting.SongList.get();
        //循环判断此歌是否在列表内
        for(let info of song.list) {
            let Live = false;
            for(let i in SonList) {
                let liv = SonList[i];
                if(liv && info.songmid == liv.mmid){
                    Live = true;
                    break;
                }
            }
            //写入内容
            text += `\n<li data-mid="${info.songmid}" data-albummid="${info.albummid}" data-i="${i}">` +
                `<span><strong>${info.songname}</strong> ${info.albumname == info.songname ? '' : `[${info.albumname}]`}</span>` +
                `<span>${info.singer[0].name}</span>` +
                `<span>${unDateTime(info.interval)}</span>` +
                `<span><div class="min-img list${Live ? '-s' : ''}"></div> <div class="min-img play"></span>` +
                `</li>`;
            i ++;
        }
        //获取页数的倍数
        let pages = Math.round(song.totalnum / 20),
            pages_text = '';
        //如果页数 小于等于 6页数
        if(pages <= 6) {
            //直接显示 123456
            while (pages) {
                pages_text = `<strong ${len == pages ? "class='ccc'" : []}>${pages}</strong>` + pages_text;
                pages --;
            }
        } else {
            //如果是在第一页
            if(len == 1) {
                //显示后面的三页
                for(let i = 3,o = 1; o <= i; o ++) {
                    pages_text += `<strong ${len == o ? "class='ccc'" : []}>${o}</strong>`;
                }
            } else {
                //显示前面的三页
                for(let i = len + 1,o = len - 1; o <= i; o ++) {
                    pages_text += `<strong ${len == o ? "class='ccc'" : []}>${o}</strong>`;
                }
            }
            //中间显示省略号
            pages_text += ' ... ';
            //显示最末尾的三页
            for(let i = pages,o = pages - 2; o <= i; o ++) {
                pages_text += `<strong ${len == o ? "class='ccc'" : []}>${o}</strong>`;
            }
        }
        //写入尾部
        text += `<li><span style="color: white">${pages_text}</span><!--span><input placeholder="可跳转至 ${pages}"></span><span><button>跳转</button></span--><span class="jg">共搜索到 ${song.totalnum} 个结果</span></li></ul>`;
        //写入内容
        search_content.innerHTML = text;
        //设置尾部的单击事件
        let search_li = search_content.querySelectorAll('li'),
            last_li = search_li[search_li.length - 1];

        search_li[search_li.length - 1].onclick = (e) => {
            Element = e.target;
            if(Element.tagName == 'STRONG') {
                if(parseInt(Element.innerHTML) > 0) {
                    Music.getWebSong(e,Music._SEARCH_CONTEN,parseInt(Element.innerHTML));
                }
            }
        }
    }

    //提示弹窗
    function showMSG(meg,title = '提示',ok = '确定') {
        //显示背景和虚化
        zhezhao.style.display = 'flex';
        row.style.filter = 'blur(3px)';
        //一秒后弹出内容
        setTimeout(() => {
            MSG.style.transform = 'rotateY(0deg)';
            MSG.style.opacity = '1';
            DIVMSG[0].innerHTML = title;
            DIVMSG[1].innerHTML = meg;
            DIVMSG[2].innerHTML = ok;
        },100);
    }

    //提示内容函数
    function print(msg) {
        //显示背景和虚化
        print_msg.innerHTML = msg;
        print_box.style.display = 'flex';
        //滑入内容
        setTimeout(function(){
            print_msg.style.transform = 'translateY(0)';
            print_msg.style.opacity = '1';
        },100);
        //滑出内容
        setTimeout(function(){
            print_msg.style.transform = 'translateY(100vh)';
            print_msg.style.opacity = '0';
        },3000);
    }

    function inputs(error) {
        let _input = doc.createElement('div');
        _input.className        = 'inputs';
        _input.innerHTML        = error.info;
        _input.style.top        = `${error.el.offsetTop - error.el.offsetHeight - 10}px`;
        _input.style.marginLeft = `10px`;
        _input.style.display    = 'block';
        error.el.parentElement.appendChild(_input);
        setTimeout(() => {
            error.el.parentElement.removeChild(_input);
        },2000);
    }

    //时间格式转换
    function getDate(date = false,Day = false) {
        let dates = new Date(date),
            o = {
                'M+': dates.getMonth(),
                'D+': dates.getDate(),
                'h+': dates.getHours(),
                "m+": dates.getMinutes(),
                "s+": dates.getSeconds(),
                "S+": dates.getMilliseconds()
            }
        Day = Day || 'MM-DD hh:mm:ss';
        for(let k in o) {
            if(new RegExp(`(${k})`).test(Day)) {
                Day = Day.replace(RegExp.$1,RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(String(o[k]).length));
            }
        }
        return Day;
    }

    //历史记录主区域
    record = doc.querySelector('.record'),
    //历史记录区域内容
    record_content = doc.querySelector('.record-content'),
    //记录存储器
    record_data = [],
    //上次点击的元素
    record_elemenet = null;

    //历史记录单击事件
    doc.querySelector('.i-time').onclick = e => {
        //显示和虚化背景
        zhezhao.style.display = 'flex';
        row.style.filter = 'blur(6px)';
        record.style.display = 'block';
        //写入头部和初始化值
        let texts = '<ul class="search-content"><li><span style="color: white">歌名</span><span>点歌时间</span><span>播放时长</span><span>操作</span></li>',
            text = '',
            el = setting.record.get(),
            all = 0;
        //避免造成数据重叠
        record_data = [];
        //循环历史记录
        for(let element in el) {
            //如果对象为 length 或 非 则 跳出循环
            if(element == 'length' || !el[element] || el[element].name == undefined) continue;
            element = el[element];
            text = `<li>
                        <span><strong>${element.name}</strong> ${element.tag ? `[${element.tag}]` : '' }</span>
                        <span>${getDate(element.time)}</span>
                        <span>${(String(element.Load)).substr(0,5)} S</span>
                        <span data-i="${all}">
                            <div class="min-img ${Music._SONG_MMID == element.mmid ? 'stop' : 'play'}"></div>
                            <div class="min-img delete"></div>
                        </span>
                    </li>` + text;
            //在公共数据尾部加入对象
            record_data.push(element);
            all ++;
        }
        //尾部显示搜索信息
        text += `<li>共查找到 ${all}条 记录...</li>`;
        //反向内容
        record_content.innerHTML = texts + text;

    }

    //设置单击事件
    doc.querySelector('.i-setting').onclick = e => {
        zhezhao.style.display = 'flex';
        row.style.filter = 'blur(6px)';
        setting_box.style.display = 'block';
    }
    set_input = setting_box.querySelectorAll('input')
    //界面内的按钮设置
    setting_box.onclick = e => {
        let elemnt = e.target;
        if(elemnt.className.indexOf('button') > -1) {
            let TAG = elemnt.innerHTML;
            if(TAG == '关闭') {
                zhezhao.style.display = 'none';
                row.style.filter = 'blur(0)';
                setting_box.style.display = 'none';
            } else if (TAG == '关 于') {
                info_box.style.display = 'block';
            } else if (TAG == '保存') {
                let qq        = set_input[0].value,
                    MainColor = set_input[1].value,
                    error     = null
                for (let i in set_input) {
                    if(!set_input[i].style) continue;
                    set_input[i].style.border = '1px solid var(--mainColor)';
                }
                if(isNaN(qq)) {
                    set_input[0].style.border = '1px dashed red';
                    error = {info:'QQ必须为纯数字!',el:set_input[0]};
                }
                if(!/^\#(\d){6,6}/.test(MainColor)) {
                    set_input[1].style.border = '1px dashed red';
                    error = {info:'必须为16进制! [#000000]',el:set_input[1]};
                }

                if(!error){

                } else {
                    inputs(error);
                }
            }
        }
    }

    //关于下方的 关闭 按钮
    info_box.querySelector('.button').onclick = e => {
        zhezhao.style.display = 'none';
        row.style.filter = 'blur(0)';
        info_box.style.display = 'none';
        //以防万一 关一下这个...
        setting_box.style.display = 'none';
    }

    //绑定历史记录下方的单击事件
    doc.querySelector('.record-button').onclick = e => {
        let Element = e.target;
        if(Element.tagName == 'SPAN') {
            if(Element.innerHTML == '关闭') {
                zhezhao.style.display = 'none';
                row.style.filter = 'blur(0)';
                record.style.display = 'none';
            }
            if(Element.innerHTML == '清除') {
                record_content.style.transform = 'translateX(200%)';
                setting.record.save({});
            }
        }
    }

    //窗口按钮点击事件
    DIVMSG[2].onclick = e => {
        row.style.filter = 'none';
        MSG.style.transform = 'rotateY(90deg)';
        MSG.style.opacity = '0';
        setTimeout(() => {zhezhao.style.display = 'none'},1000);
    }

    //历史记录主区域
    songList = doc.querySelector('.song-list'),
    //历史记录区域内容
    songList_content = doc.querySelector('.song-list-content'),
    //记录存储器
    SongList_data = [],
    //上次点击的元素
    songList_elemenet = null;

    //底部的单击事件绑定
    doc.querySelector('footer').onclick = e => {
        let Element = e.target;
        if(Element.tagName == 'SPAN') {
            let cl = Element.className;
            //如果点击的是空的爱心
            if(cl.indexOf('i-love-air') > -1) {
                Element.style.transform = 'scale(2)';
                Element.style.opacity = '0';
                setTimeout(function(){
                    Element.style.opacity = '1';
                    Element.style.transform = 'scale(1)';
                    if(Music._SONG_NAME != 'Failed SONG TITLE') {
                        Element.className = 'i-love';
                        setting.SongList.set({
                            'name' : Music._SONG_NAME,
                            'tag'  : Music._SONG_TAG,
                            'mmid' : Music._SONG_MMID,
                            'jpg'  : Music._JPEG_MMID,
                            'time' : (new Date).valueOf()
                        });
                        print(`歌曲收藏成功!<br/>${Music._SONG_NAME}`);
                    } else {
                        Element.className = 'i-love-air';
                        showMSG(`收藏失败!错误的歌曲识别码!<br/> TITLE: ${Music._SONG_NAME}`,'警告');
                    }
                },1400);
            } else if (cl.indexOf('info') > -1) {
                showSongInfo();
            } else if (cl.indexOf('voice') > -1) {
                if(cl == 'i-voice_off') {
                    Element.className = 'i-voice_3';
                    Music._AUDIO.volume = 1;
                } else if(cl == 'i-voice_1') {
                    Element.className = 'i-voice_off';
                    Music._AUDIO.volume = 0;
                } else if(cl == 'i-voice_2') {
                    Element.className = 'i-voice_1';
                    Music._AUDIO.volume = 0.35;
                } else if(cl == 'i-voice_3') {
                    Element.className = 'i-voice_2';
                    Music._AUDIO.volume = 0.65;
                }
            }
        }
    }

    //控制台的点击事件绑定
    direction.onclick = e => {
        let Element = e.target;
        if(Element.tagName == 'SPAN') {
            let css = Element.className;
            if(css.indexOf('stop') > -1){
                Music.Pasue();
            } else if(css.indexOf('play') > -1) {
                Music.Play();
            } else if(css.indexOf('list') > -1) {
                showSongList();
            }
        }
    }

    //显示出爱好音乐列表
    function showSongList() {
        zhezhao.style.display = 'flex';
        row.style.filter = 'blur(6px)';
        songList.style.display = 'block';
        let texts = '<ul class="search-content"><li><span style="color: white">歌手</span><span>时长</span><span>播放时长</span><span>操作</span></li>',
            text = '',
            el = setting.SongList.get(),
            all = 0;
        //避免造成数据重叠
        SongList_data = [];
        for(let element in el) {
            if(element == 'length' || !el[element] || el[element].name == undefined) continue;
            element = el[element];
            text = `<li>
                        <span><strong>${element.name}</strong> ${element.tag ? `[${element.tag}]` : '' }</span>
                        <span>${getDate(element.time)}</span>
                        <span>${(String(element.Load)).substr(0,5)} S</span>
                        <span data-i="${all}">
                            <div class="min-img play"></div>
                            <div class="min-img delete"></div>
                        </span>
                    </li>` + text;
            SongList_data.push(element);
            all ++;
        }
        songList_content.innerHTML = texts + text;
    }


    //历史内容的单击事件处理
    record_content.onclick   = PlayListSong
    songList_content.onclick = PlayListSong

    function PlayListSong(e){
        let _code = false;
        record_data = record_data;
        if (record_data.length == 0) {
            _code = true;
            record_data = SongList_data;
        }

        //点击内部的子元素
        let Element = e.target;
        //如果元素名字为div
        if(Element.tagName == 'DIV') {
            //获取父元素的数据
            let i = Element.parentElement.dataset.i;
            //如果类名包涵play
            if(Element.className.indexOf('play') > 0) {
                if(record_data.length < i) return showMSG('错误的内容!!!');
                //搜索音乐
                //console.log(record_data)
                Music.getWebSong(e,record_data[i].name)
                //图片改为 加载中...
                Element.className = 'min-img load';
                //划入提示增加体验
                print('请稍等 正在获取音乐数据...');
                //检测一秒后是否正常
                setTimeout(function(){
                    //如果音乐搜索库为空 则弹出 超时
                    if(!Music._SEARCH.data) return showMSG('获取歌曲信息超时!!!');
                    //console.log( Music._SEARCH.data,Music._SEARCH)
                    //遍历音乐列表 如果 识别码相同
                    for(let song of Music._SEARCH.data.song.list) {
                        if(record_data[i].mmid == song.songmid) {
                            //写入音乐
                            Music.PlaySong(song);
                            //设置播放时间
                            Music._AUDIO.currentTime = record_data[i].Load;
                            //播放音乐
                            Music.Play();
                            //设置图片为停止样式
                            Element.className = 'min-img stop';
                            //设置上一次的元素为播放样式
                            if(record_elemenet) record_elemenet.className = 'min-img play';
                            //保存上一个元素
                            record_elemenet = Element;
                        }
                    }
                    //检测是否搜索超时
                    setTimeout(function() {
                        if(Element.className == 'min-img load') showMSG('获取历史歌曲信息超时!!!请手动搜索!','警告');
                    },1000);
                },1000);
            }
            //如果为停止样式
            if(Element.className.indexOf('stop') > 0) {
                //如果超出了实际长度
                if(record_data.length < i) return showMSG('错误的内容!!!');
                //停止音乐
                Music.Pasue();
                //改为播放样式
                Element.className = 'min-img play';
                //清空上一个元素
                record_elemenet = null;
            }
            //如果为删除样式
            if(Element.className.indexOf('delete') > 0) {
                //删除库内的元素
                record_data.splice(i,1);
                //保存现在的库
                _code ? setting.SongList.save(record_data) : setting.record.save(record_data);
                //获取li 元素
                let box = Element.parentElement.parentElement;
                //删除效果
                box.style.transform = 'translateX(200%)';
                setTimeout(function(){
                    box.style.display = 'none';
                },500);
            }
        }
    }

    //输入框按下键盘
    search_input.onkeyup = e => {
        //如果按下回车 为搜索 相反 为输入
        if(e.keyCode == 13) {
            search_click()
        } else {
            let script = doc.createElement('script');
            script.src = `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?is_xml=0&format=jsonp&key=${e.target.value}&g_tk=123370417&jsonpCallback=search_list&loginUin=478889187&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`
            doc.body.appendChild(script);
        }
    }

    //点击输入框时
    search_input.onclick = e => {
        search_content.style.opacity = 0;
        setTimeout(() => {
            search_content.innerHTML = '';
            search_content.style.opacity = 1;
        },900);
    }

    //爱好列表单击事件
    doc.querySelector('.song-list-button').onclick = e => {
        let Element = e.target;
        if(Element.tagName == 'SPAN') {
            if(Element.innerHTML == '关闭') {
                zhezhao.style.display = 'none';
                row.style.filter = 'blur(0)';
                songList.style.display = 'none';
            }
        }
    }

    //
    let SongInfoBox = doc.querySelector('.song-info');
    function showSongInfo() {
        zhezhao.style.display = 'flex';
        row.style.filter = 'blur(6px)';
        SongInfoBox.style.display = 'block';
    }

    //
    SongInfoBox.querySelector('.button').onclick = e => {
        zhezhao.style.display = 'none';
        row.style.filter = 'blur(0)';
        SongInfoBox.style.display = 'none'
    }

    //一秒后固定位置 防止手机键盘弹起时改变窗口
    setTimeout(() => {
        content.style.height = content.offsetHeight + 'px';
        row.style.height = row.offsetHeight + 'px';
        search_content.style.maxHeight = `${content.offsetHeight - 50}px`;
    },1000);

    //当窗口位置发生变化后 进行兼容定位
    window.onresize = e => {
        li_Width = movebox.querySelector('li').offsetWidth;
        movebox.style.transform = `translateX(-${pages * li_Width}px)`;
    }

    //获取MB
    getMB = byte => (byte / 1024 / 1024).toFixed(2);

    //滚动的计时器
    mousewheelEvent = null,
    //已滚动的数量
    wheelHeight     = 0,
    //目前的li
    wheelLi         = null,
    //上次的li
    wOldLi          = null,
    //标题元素
    wheelTitle      = gc.previousSibling.previousSibling,
    //内部的数字
    wheelTime       = wheelTitle.querySelector('span'),
    //触摸移动的距离
    wheelMove       = 0

    gc_wheel = e => {
        if (!lis) return;
        if(e.stopPropagation) e.stopPropagation();
        let Move = 0;
        if (e.changedTouches) {
            if (wheelMove == 0) return;
            Move = wheelMove - e.changedTouches[0].pageY;
        } else {
            Move = e.deltaY;
        }
        wheelMove = 0
        if (Move > 0) {
            wheelHeight ++;
            wheelLi = gc_content[lis.dataset.i ++] ? gc_content[lis.dataset.i] : wheelLi;
        } else {
            wheelHeight --;
            wheelLi = gc_content[lis.dataset.i --] ? gc_content[lis.dataset.i] : wheelLi;
        }
        if(!wheelLi) return;
        mousewheel = true;
        gc.style.transform = `translateY(-${wheelLi.dataset.i * wheelLi.offsetHeight - 150}px)`;
        //如果是第一次渲染
        if(wOldLi == null) {
            wOldLi = wheelLi;
            lis.className = '';
            wheelTitle.style.display = 'block';
            setTimeout(() => {
                wheelTitle.style.opacity = 1;
            },900);
        } else if(wheelLi != wOldLi) {
            wOldLi.className = '';
            wOldLi = wheelLi;
            wheelTime.innerHTML = wOldLi.dataset.time;
        }
        wheelLi.className = 'center';
        wheelTitle.style.top = (wheelLi.offsetTop - (wheelLi.dataset.i * wheelLi.offsetHeight) + 140) + 'px';
        //改为居中
        clearTimeout(mousewheelEvent);
        mousewheelEvent = setTimeout(() => {
            mousewheel  = false;
            wheelHeight = 0;
            wOldLi.className = '';
            wOldLi = null
            wheelTitle.style.opacity = 0;
            setTimeout(() => {
                wheelTitle.style.display = 'none';
            },900);
        },2000);
    }
    gc.ontouchstart = e => wheelMove = e.changedTouches[0].pageY;
    gc.ontouchup = e => wheelMove = 0;
    gc.ontouchmove = gc_wheel;
    gc.onmousewheel = gc_wheel;

    gc.onclick = () => {
        //改为居中
        if (!wOldLi) return;
        clearTimeout(mousewheelEvent);
        mousewheelEvent = setTimeout(() => {
            mousewheel  = false;
            wheelHeight = 0;
            wOldLi.className = '';
            wOldLi = null
            wheelTitle.style.opacity = 0;
            setTimeout(() => {
                wheelTitle.style.display = 'none';
            },900);
        },2000);
    }
    //点击上一句的时候
    wheelTitle.querySelector('.on').onclick = () => {
        console.log(1)
        gc_wheel({deltaY : -100});
    }
    //点击下一句的时候
    wheelTitle.querySelector('.down').onclick = () => {
        gc_wheel({deltaY : 100});
    }
    //点击下一句的时候
    wheelTitle.querySelector('.play').onclick = () => {
        console.log(reDateTime(wheelTime.innerHTML))
        Music._AUDIO.currentTime = reDateTime(wheelTime.innerHTML);
    }


})();


/*
 * 外部需调用的函数
 */
let searchList   = doc.getElementsByClassName('search-list')[0],
    search_input = doc.querySelector('.search'),
    none_task    = null
//搜索后显示的列表
function search_list(jsonp){
    let list = 0;
    clearTimeout(none_task);
    if(jsonp.data) {
        searchList.style.opacity = 1;
        searchList.style.display = 'block';
        searchList.innerHTML = '';
        let txt = '';
        if(jsonp.data.song) {
            let song = jsonp.data.song;
            if(song.count > 0) {
                list += song.count;
                txt += `<li class="title-list">歌曲 (${song.count})</li>`;
                for (id in song.itemlist) {
                    txt += `<li>${song.itemlist[id].name}[${song.itemlist[id].singer}]</li>`;
                }
            }
        }
        if (jsonp.data.singer) {
            let singer = jsonp.data.singer;
            if(singer.count > 0) {
                list += singer.count;
                txt += `<li class="title-list">歌手 (${singer.count})</li>`;
                for (id in singer.itemlist) {
                    txt += `<li>${singer.itemlist[id].name}[${singer.itemlist[id].singer}]</li>`;
                }
            }
        }
        searchList.innerHTML += txt;
        none_task = setTimeout(() => {
            searchList.style.opacity = 0;
            setTimeout(() => {
                searchList.style.display = 'none';
            },500)
        },6000);
    }
    //如果啥也没搜到 隐藏列表
    if(jsonp.code < 0 || list == 0) {
        searchList.style.opacity = 0;
        setTimeout(() => {
            searchList.style.display = 'none';
        },500);
    }
}
searchList.onclick = e => {
    let element = e.target;
    if(element.tagName == 'LI') {
        if(!element.className) {
            search_input.value = element.innerHTML
            element.style.transform = 'translateY(-40vh)';
            searchList.style.opacity = 0
            setTimeout(() => {
                searchList.style.display = 'none';
                doc.querySelector('.search-img').click();
            },500);
        }
    }
}
function search_click() {
    doc.querySelector('.search-img').click();
    searchList.style.display = 'none';
}