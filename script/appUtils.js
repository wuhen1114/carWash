/**
* 文件名称：shopUtils
* js 工具类
*/
// 接口访问地址 start
var BASEPATH = "http://116.196.90.243:9191/";
// "http://116.196.90.243:9090/"
// "http://192.168.1.4:9090/"
// 接口访问地址 end

/** 数据 开始 **/
var APP_USER_LAST_LOGIN_TIME = "APP_USER_LAST_LOGIN_TIME"; // 登录时间
var APP_USER_INFO = "APP_USER_INFO"; // 用户数据
var APP_USER_LOGIN = "APP_USER_LOGIN"; // 用户名密码
var PRIMARY_KEY = "userId"; // 主键键名
/** 数据 结束 **/

//=============================================公共js方法========================================================

fixedHead(); // 固定头部

/**
 * 长传图片
 *
 * paramData
 *        - 批量上传本次最多上传几张
 *        - maxCount 批量上传本次最多上传几张
 *        - type 1-拍照 2-相册选择 其他-选择拍照或者照片
 *        - retType 1-返回本地地址  其他-上传（默认）
 * callback
 */
function selectUploadImgType (paramData, callback) {
    paramData = uploadImgDefData(paramData);
    var fn = function (index) {
        if (1 == index) { // 拍照
            camera(paramData, callback);
        } else if (2 == index) { // 相册
            selImg(paramData, callback);
        }
    };
    if (paramData.type) {
        fn(paramData.type);
        return;
    }
    api.actionSheet({
        buttons: ['拍照', '照片']
    }, function(ret, err) {
        fn(ret.buttonIndex);
    });
}

/**
 * 拍照上传
 */
function camera (paramData, callback) {
    api.getPicture({
        sourceType: 'camera', mediaValue: 'pic', destinationType: 'url',
        encodingType: 'jpg', quality: paramData.quality,
    }, function(ret, err) {
        if (ret && ret.data) { // 已返回数据
            uploadImg({"url": ret.data, "retType": paramData.retType}, callback);
        }
    });
}

/**
 * 选择照片上传
 */
function selImg (paramData, callback) {
    api.getPicture({
        sourceType: 'album', mediaValue: 'pic', destinationType: 'url',
        encodingType: 'jpg', quality: paramData.quality,
    }, function(ret, err) {
        if (ret && ret.data) { // 已返回数据
            uploadImg({"url": ret.data, "retType": paramData.retType}, callback);
        }
    });
}

/**
 * 上传照片
 */
function uploadImg (param, callback) {
    var fn = function (file) {
        if (1 == param.retType) {
            if (callback) {
                callback(file);
            }
        } else {
            request({
                url: "app/tool/stu_par_upload",
                data: {files :{"file": file}},
                dataType: "json",
                method: "post",
                headers: {}
            }, callback);
        }
    };
    fn(param.url);
}

/**
 * 上传图片需要的参数
 *
 * url 本地地址
 * callback 图片地址
 */
function uploadImgDefData (paramData) {
    return objectClone({
        "quality": 20
    }, paramData, true);
}

/**
 * 对象浅克隆
 * 将o2对象的属性复制到o1中
 * cover 是否覆盖 true-覆盖（默认），false-不覆盖
 */
function objectClone(o1, o2, cover) {
    cover = EMPTY(cover) ? true : cover;
    if (!o1) {
        return null;
    }
    if (!o2) {
        return o1;
    }
    for (var key in o2) {
        o1[key] = (!!cover || EMPTY(o1[key])) ? o2[key] : o1[key];
    }
    return o1;
}

/**
 * 封装vue使用的默认方法
 *
 * param json对象参数，添加自己的方法
 */
function vueDefMethods (param) {
    var ret = { // 默认方法
        closeWin: function () { // 关闭本页
            api.closeWin();
        },
        formatDate: function (date, type) { // 格式化时间
            if (!date && 0 !== date) {
                return "";
            }
            return new Date(date).Format(type || 'yyyy-MM-dd hh:mm:ss');
        },
        fixedFn: function (num, count) { // 将数字转为固定的几位小数 num-数字 count-几位小数，默认两位
            if (!num && 0 !== num) {
                num = 0;
            }
            count = (!count && 0 !== count) ? 2: count;
            return parseFloat(num).toFixed(count);
        },
        call: function (tel) { // 拨打电话
            if (tel) {
                api.confirm({
                    title: '提示',
                    msg: '是否确认拨打 ' + tel,
                    buttons: ['确定', '取消']
                }, function(ret, err) {
                      if (1 == ret.buttonIndex) {
                          // api.call({type: 'tel_prompt', number: tel});
                          api.call({type: 'tel', number: tel});
                      }
                });

            }
        },
        sms: function (tel) { // 发送短信
            if (tel) {
                api.confirm({
                    title: '提示',
                    msg: '是否确认发送短信到 ' + tel,
                    buttons: ['确定', '取消']
                }, function(ret, err) {
                      if (1 == ret.buttonIndex) {
                          api.sms({numbers: [tel]});
                      }
                });
            }
        },
        numFill: function (num, count) { // 数字填充
            num = num + "";
            var len = num.length;
            if (len >= count) {
                return num;
            }
            for (var i = 0; i < count - len; i ++) {
                num = "0" + num;
            }
            return num;
        },
        imgShow: function (imgArr, index, key) { // 查看大图， imgArr-图片数组，index-开始的下标，key-可为空，如果图片数组存放的对象，表示对象图片的key
            if (key) {
                for (var i = 0; i < imgArr.length; i++) {
                    imgArr[i] = imgArr[i][key];
                }
            }
            if (imgArr[index].indexOf("http") != 0) {
                return;
            }
            var images = [];
            for (var i = 0; i < imgArr.length; i++) {
                if (imgArr[i].indexOf("http") == 0) {
                    images.push(imgArr[i]);
                } else {
                    if (i <= index) {
                        index--;
                    }
                }
            }
            var photoBrowser = api.require('photoBrowser');
            photoBrowser.open({
                images: images,
                activeIndex: index,
                bgColor: 'rgba(0, 0, 0, 0.5)'
            }, function(ret, err) {
                if (ret.eventType == 'click') {
                     photoBrowser.close();
                }
            });
        },
        paging: function (param) { // 分页，param-json数据；
            var dataList = param.dataList || "dataList"; // 数据的字段
            var showLoadMore = param.showLoadMore || "showLoadMore"; // 是否有下一页的字段
            var currentPage = param.currentPage || "currentPage"; // 当前页的字段
            var showCount = param.showCount || "showCount"; // 一页查几条的字段
            var retData = "retData"; // 返回的数据
            var nowCurrentPage = param.nowCurrentPage || param.vue[currentPage]; // 当前页
            if (1 == nowCurrentPage) {
                param.vue[dataList] = [];
            }
            param.vue[dataList] = param.vue[dataList].concat(param[retData]);
            if (param.vue[showCount] <= param[retData].length) { // 有下一页
                param.vue[currentPage] = parseInt(nowCurrentPage + "") + 1;
                param.vue[showLoadMore] = true;
            } else {
                param.vue[showLoadMore] = false;
            }
        },
    };
    return objectClone(ret, param, true);
}

/**
 * 下拉刷新
 * 完成后一秒关闭
 *
 * callback 回调方法
 */
function dropdownRefresh (callback) {
    api.setRefreshHeaderInfo({
        loadingImg: 'widget://image/refresh.png',
        bgColor: '#fff',
        textColor: '#000000',
        textDown: '下拉刷新...',
        textUp: '松开刷新...'
    }, function(ret, err) {
        if (callback) {
            callback();
        }
        //在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
        setTimeout(function() {
            api.refreshHeaderLoadDone(); //关闭下拉刷新loading
        }, 1000);
    });
}

/**
 * 设置状态栏样式
 * style: dark-状态栏字体为黑色 light-状态栏字体为白色
 */
function setStatusBarStyleFn (style) {
    api.setStatusBarStyle({
        style: style
    });
}

/**
 * toast 提示
 */
function toastFn (msg, location) {
    api.toast({msg: msg, duration: 2000, location: (location || 'middle')});
}

/**
 * 封装请求
 *
 * param 参数
 * callback 请求成功的回调方法
 */
function request (param, callback) {
    param = requestData(param);
    if (!param) {return;}
    if (param.loading) {
        APP_FRAME_HYALINE_LOADING(true); // 开启方法loading
    }
    api.ajax(param, function (result, error) {
        if (param.loading) {
            APP_FRAME_HYALINE_LOADING(false); // 关闭方法loading
        }
        // APP_FRAME_LOADING(); // 关闭页面loading
        console.log("result--->" + JSON.stringify(result));
        console.log("error--->" + JSON.stringify(error));
        console.log(JSON.stringify(param));
        if (result) {
            var code, retData, message;
            if (param.returnAll) {
                code = result.body.code;
                retData = result;
                message = result.body.message;
            } else {
                code = result.code;
                retData = result.data;
                message = result.message;
            }
            if (code == 200) {
                if (callback) { // 执行回调
                    callback(retData);
                }
            } else if (1002 == code) { // 登录失效
                APP_GO_LOGIN(); // 去登录
            } else {
                toastFn(message);
            }
        } else {
            toastFn("请检查网络");
        }
    });
}

/**
 * 整理请求的参数
 */
function requestData (param) {
    var userInfo = GET_USER_INFO(false); // 本地用户数据
    if (!param) {
        return null;
    }
    var ret = objectClone({
        "method": "get",
        "loading": true
    }, param, true);
    if (!ret.headers) {
        if ('post' == ret.method) {
            ret.headers = {'Content-Type': 'application/json'};
        } else {
            ret.headers = {};
        }
    }
    if (userInfo) {
        ret.headers['Auth-Id'] = userInfo.authId;
        ret.headers['Auth-Token'] = userInfo.authToken;
    }
    ret.url = (BASEPATH + ret.url);
    return ret;
}

/**
 * 固定元素
 * idName： id的值，需要固定的元素
 * where： 固定元素时插入元素高度的位置
 *          - beforeBegin 插入到标签开始前
 *          - afterBegin 插入到标签开始标记之后
 *          - beforeEnd 插入到标签结束标记前
 *          - afterEnd 插入到标签结束标记后
 */
function fixedElement(idName, where) {
    if (!idName || !where) {
        return;
    }
    try{
        setTimeout(function(){
            var element = document.getElementById(idName); // 获取id元素
            if(element){ // 已获取到元素
                element.className += (' HFixed H-z-index-10000 hRight_0 hLeft_0' +
                ('beforeBegin' == where || 'beforeEnd' == where ? ' hBottom_0' : '')); // 拼接class
                var height = element.offsetHeight; // element高度
                element.insertAdjacentHTML(where, '<div class="hWidth_100" style="height:' + height + 'px;"></div>'); // 在一个元素下拼接html
            }
        }, 500);
    }catch (e) {console.log("出现异常："+e)} // 异常
}

/**
 * 固定头部
 * idName： id的值，需要固定的元素 默认 header
 */
function fixedHead(idName) {
    fixedElement((idName || "header"), "afterEnd");
}

/**
 * 固定底部
 * idName： id的值，需要固定的元素 默认 bottom
 */
function fixedBottom(idName) {
    fixedElement((idName || "bottom"), "beforeBegin");
}

/**
 * 绑定极光推送通知
 * id: 绑定的id
 */
function APP_BIND_JPUSH(id){
   var ajpush = api.require('ajpush');
   ajpush.bindAliasAndTags({alias: id});
}

/**
 * 用$api.getStorage获取本地用户信息
 * must:是否必须，必须有时拿不到数据会去登录页，非必须时只会返回空，默认必须
 */
function GET_USER_INFO(must){
   if (EMPTY(must)) {must = true;} // 默认必须
   var userInfo = $api.getStorage(APP_USER_INFO);
   if (EMPTY(userInfo)) { if(must){APP_GO_LOGIN();} return null;} // 本地数据为空

   return JSON.parse(userInfo); // 返回本地数据
}

/**
 * 根据用户属性获取本地的用户信息``
 * must:是否必须，必须有时拿不到数据会去登录页，非必须时只会返回空，默认必须
 */
function GET_USER_INFO_MSG(property, must){
    if (EMPTY(property)) {return null;} // 传过来的字段名为空
    if (EMPTY(must)) {must = true;} // 默认必须

    var userInfo = GET_USER_INFO(must); // 获取本地数据
    if (EMPTY(userInfo)) { if (must) {APP_GO_LOGIN();} return null;} // 用户数据为空
    var param = userInfo[property]; // 用户数据中的属性名称
    if (EMPTY(param)) { if (must) {APP_GO_LOGIN();} return null;} // 数据为空
    return param; // 返回数据
}

/**
 * 获取本地的用户id
 */
function GET_USER_ID(){
    return GET_USER_INFO_MSG(PRIMARY_KEY);
}

// 验证一个参数为空
function EMPTY (param) {
    return (null === param || "" === param || "undefined" === typeof(param));
}

/**
 * 打开登录页面
 * isShow: 是否显示登录提示，true：显示，false:不显示，默认显示，
 */
var APP_GO_LOGIN_COUNT = 0; // 统计触发下面方法的数量。默认0，当多次触发不生效下面方法
function APP_GO_LOGIN (isShow) {
    if(APP_GO_LOGIN_COUNT > 0){return;} // 当多次触发不生效
    APP_GO_LOGIN_COUNT++; // 已触发，
    // 添加默认数据
    if(EMPTY(isShow)){isShow = true;} // 默认显示
    // 判断是否显示提示信息
    if (isShow) {
        toastFn("请您重新登录");
    }
    // 去登录页
    setTimeout(function () {
        api.openWin({
            name: 'appLogin',
            url: 'widget://html/p_appLogin.html',
            reload: true,
            slidBackEnabled: false, // 取消滑动返回
        });
    }, 500);
    // 赋空本地数据
    $api.setStorage(APP_USER_LAST_LOGIN_TIME, ""); // 登录时间
    $api.setStorage(APP_USER_INFO, ""); // 用户数据
    $api.setStorage(APP_USER_LOGIN, ""); // 用户名密码
}

/**
 * js由毫秒数得到年月日
 * 使用： (new Date(data[i].creationTime)).Format("yyyy-MM-dd hh:mm:ss.S")
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

/**
 * 验证电话号码是否正确
 * tel:电话号码：为空不正确
 * 返回：true:正确，false:错误
 */
function VERIFYTEL(tel){
  return (!EMPTY(tel) && /^1[3,4,5,6,7,8,9]\d{9}$/.test(tel));
}

// 页面loading
function APP_FRAME_LOADING (bool) {

}

// 方法loading
function APP_FRAME_HYALINE_LOADING (bool) {
    APP_FRAME_LOADING_CORE(bool, 'appHyalineLoading', 'widget://html/loading/p_appHyalineLoading.html');
}

/**
 * 打开loading的方法
 */
function APP_FRAME_LOADING_CORE (bool, nameStr, urlStr) {
    if (bool) {
        var header = $api.dom('header'); // 获取 header 标签元素
        var headerH = $api.fixStatusBar(header);
        api.openFrame({
            name: nameStr,
            url: urlStr,
            rect: {
                x: 0,
                y: headerH,
                w: api.winWidth,
                h: api.frameHeight - headerH
            },
            bounces:false,
            bgColor: 'rgba(0,0,0,0)',
            vScrollBarEnabled: false,
            hScrollBarEnabled: false
        });
    } else {
        setTimeout(function () {
            api.closeFrame({name: nameStr});
        }, 500);
    }
}

/**
 *  对明文进行base64加密
 *  value 明文，count 加密次数
 *  返回加密后的 code
*/
function encodeBase64(value, count){
    var num = !count ? 1 : parseInt(count);

    if (!value) {
        return false;
    }else{
        $.base64.utf8encode = true;
        for(var i=0;i<num;i++){
            value=$.base64.btoa(value);
        }
    }
    return value;
}

/**
 *  对code进行base64解密
 *  value 加密值，count 解密次数
 *  返回解密后的 value
 */
function decodeBase64(value, count){
    var num = !count ? 1 : parseInt(count);

    if (!value) {
        return false;
    } else {
        $.base64.utf8encode = true;
        for (var i = 0; i < num; i++) {
            value = $.base64.atob(value);
        }
    }
    return value;
}
