// elementNode 为 分享组件内容插入的位置。为了方便在SPA中，分享组件的生命周期跟随页面组件生命周期

function nativeShare(elementNode, config) {
    if (!document.getElementById(elementNode)) {
        console.error(new Error('没有找到id为：' + elementNode + ' 的元素'))
        return false;
    }

    var qApiSrc = {
        lower: "//3gimg.qq.com/html5/js/qb.js",
        higher: "//jsapi.qq.com/get?api=app.share"
    };
    var bLevel = {
        qq: {forbid: 0, lower: 1, higher: 2},
        uc: {forbid: 0, allow: 1}
    };
    var UA = navigator.appVersion;
    var isqqBrowser = (UA.split("MQQBrowser/").length > 1) ? bLevel.qq.higher : bLevel.qq.forbid;
    var isucBrowser = (UA.split("UCBrowser/").length > 1) ? bLevel.uc.allow : bLevel.uc.forbid;
    var version = {
        uc: "",
        qq: ""
    };
    var isWeixin = false;
    var isInnerQQ = false;
    var wrapperId = 'nativeShareBox'

    config = config || {};
    this.elementNode = elementNode;
    this.url = config.url || document.location.href || '';
    this.title = config.title || document.title || '';
    this.desc = config.desc || document.title || '';
    this.img = config.img || document.getElementsByTagName('img').length > 0 && document.getElementsByTagName('img')[0].src || '';
    this.img_title = config.img_title || document.title || '';
    this.from = config.from || window.location.host || '';
    this.ucAppList = {
        sinaWeibo: ['kSinaWeibo', 'SinaWeibo', 11, '新浪微博'],
        weixin: ['kWeixin', 'WechatFriends', 1, '微信好友'],
        weixinFriend: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
        QQ: ['kQQ', 'QQ', '4', 'QQ好友'],
        QZone: ['kQZone', 'QZone', '3', 'QQ空间']
    };

    this.share = function (to_app) {
        var title = this.title, url = this.url, desc = this.desc, img = this.img, img_title = this.img_title, from = this.from;
        if (isucBrowser) {
            to_app = to_app == '' ? '' : (platform_os == 'iPhone' ? this.ucAppList[to_app][0] : this.ucAppList[to_app][1]);
            if (to_app == 'QZone') {
                B = "mqqapi://share/to_qzone?src_type=web&version=1&file_type=news&req_type=1&image_url="+img+"&title="+title+"&description="+desc+"&url="+url+"&app_name="+from;
                k = document.createElement("div"), k.style.visibility = "hidden", k.innerHTML = '<iframe src="' + B + '" scrolling="no" width="1" height="1"></iframe>', document.body.appendChild(k), setTimeout(function () {
                    k && k.parentNode && k.parentNode.removeChild(k)
                }, 5E3);
            }
            if (typeof(ucweb) != "undefined") {
                ucweb.startRequest("shell.page_share", [title, title, url, to_app, "", "@" + from, ""])
            } else {
                if (typeof(ucbrowser) != "undefined") {
                    ucbrowser.web_share(title, title, url, to_app, "", "@" + from, '')
                } else {
                }
            }
        } else {
            if (isqqBrowser && !isWeixin) {
                to_app = to_app == '' ? '' : this.ucAppList[to_app][2];
                var ah = {
                    url: url,
                    title: title,
                    description: desc,
                    img_url: img,
                    img_title: img_title,
                    to_app: to_app,//微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
                    cus_txt: "请输入此时此刻想要分享的内容"
                };
                ah = to_app == '' ? '' : ah;
                if (typeof(browser) != "undefined") {
                    if (typeof(browser.app) != "undefined" && isqqBrowser == bLevel.qq.higher) {
                        browser.app.share(ah)
                    }
                } else {
                    if (typeof(window.qb) != "undefined" && isqqBrowser == bLevel.qq.lower) {
                        window.qb.share(ah)
                    } else {
                    }
                }
            } else {
            }
        }
    };

    this.html = function(type) {
        /* type: 1:调用原生分享功能, type: 2:调用qrcode填充, type: 3:对微信浏览器填充背景*/
        var position = document.getElementById(elementNode) || document.getElementsByTagName('body')[0];
        if (type === 1) {
            var html = '<div id="nativeShare"><div class="label"><span class="title">分享至：</span><span class="close"></span></div>'+
                '<div class="list clearfix">'+
                '<span data-app="sinaWeibo" class="nativeShare weibo"><i></i>新浪微博</span>'+
                '<span data-app="weixin" class="nativeShare weixin"><i></i>微信好友</span>'+
                '<span data-app="weixinFriend" class="nativeShare weixin_timeline"><i></i>微信朋友圈</span>'+
                '<span data-app="QQ" class="nativeShare qq"><i></i>QQ好友</span>'+
                '<span data-app="QZone" class="nativeShare qzone"><i></i>QQ空间</span>'+
                '<span data-app="" class="nativeShare more"><i></i>更多</span>'+
                '</div></div>';
        } else if (type === 2) {
            var html = '<div class="closewx"><div id="nativeShare"><div class="label"><span class="title">分享至：</span><span class="close"></span></div>'+
                '<div class="list clearfix">'+
                '<div class="intro">长按复制下方链接，去粘贴给好友吧：</div>' +
                '<a href="'+ this.url +'" target="_blank">' +
                '<div class="url"><span>' +
                this.url +
                '</span></div>'+
                '</a>' +
                '</div></div></div>';
        } else {
            var html = '<div class="closewx">'+
                '<div class="wxshare"></div>'+
                '</div>';
        }
        var $oldWrapper = document.getElementById(wrapperId)
        if ($oldWrapper) {
            $oldWrapper.remove()
        }
        var wrapper = document.createElement('div');
        wrapper.id = wrapperId;
        wrapper.innerHTML = html;
        position.appendChild(wrapper);
        this.bindEvents();
    };

    this.bindEvents = function() {
        var close = document.querySelectorAll('#nativeShare .close, #' + wrapperId + ' .closewx');
        var _this = this
        close.forEach(function(ele) {
            ele.addEventListener('click', function(e) {
                if (e.target !== e.currentTarget) return
                _this.hide()
                e.stopPropagation()
            });
        })
    }

    this.show = function() {
        document.getElementById(wrapperId).style.display = 'block';
    }

    this.hide = function() {
        document.getElementById(wrapperId).style.display = 'none';
    }

    this.isloadqqApi = function () {
        if (isqqBrowser) {
            var b = (version.qq < 5.4) ? qApiSrc.lower : qApiSrc.higher;
            var d = document.createElement("script");
            var a = document.getElementsByTagName("body")[0];
            d.setAttribute("src", b);
            a.appendChild(d)
        }
    };

    this.getPlantform = function () {
        ua = navigator.userAgent;
        if ((ua.indexOf("iPhone") > -1 || ua.indexOf("iPod") > -1)) {
            return "iPhone"
        }
        return "Android"
    };

    this.is_weixin = function () {
        var a = UA.toLowerCase();
        if (a.match(/MicroMessenger/i) == "micromessenger") {
            return true
        } else {
            return false
        }
    };

    this.getVersion = function (c) {
        var a = c.split("."), b = parseFloat(a[0] + "." + a[1]);
        return b
    };
    this.is_innerQQ = function () {
        if (UA.match(/QQ\//i) == "QQ/") {
                return true;
        } else {
                return false;
        }
    }
    this.init = function () {
        platform_os = this.getPlantform();
        version.qq = isqqBrowser ? this.getVersion(UA.split("MQQBrowser/")[1]) : 0;
        version.uc = isucBrowser ? this.getVersion(UA.split("UCBrowser/")[1]) : 0;
        isWeixin = this.is_weixin();
        isInnerQQ = this.is_innerQQ();
        if ((isqqBrowser && version.qq < 5.4 && platform_os == "iPhone") || (isqqBrowser && version.qq < 5.3 && platform_os == "Android")) {
            isqqBrowser = bLevel.qq.forbid
        } else {
            if (isqqBrowser && version.qq < 5.4 && platform_os == "Android") {
                isqqBrowser = bLevel.qq.lower
            } else {
                if (isucBrowser && ((version.uc < 10.2 && platform_os == "iPhone") || (version.uc < 9.7 && platform_os == "Android"))) {
                    isucBrowser = bLevel.uc.forbid
                }
            }
        }
        this.isloadqqApi();
        if ((isqqBrowser || isucBrowser) && !isWeixin) {
            this.html(1);
        } else if (isWeixin) {
            this.html(3);
        } else if (isInnerQQ){
            this.html(2);
        } else {
            this.html(2);
        }
    };

    this.init();

    var share = this;
    var items = document.getElementsByClassName('nativeShare');
    for (var i=0;i<items.length;i++) {
        items[i].onclick = function(){
            share.share(this.getAttribute('data-app'));
        }
    }

    return this;
};
