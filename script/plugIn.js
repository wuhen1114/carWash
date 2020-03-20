
// 样式类
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


// 底部弹出选择框（多选）
function multipleChoice(title,arr){
    var data={};
    data.title=title;
    data.arr=arr;
    var mess='';
    api.openFrame({
        name: 'plugIn',
        url: '../../html/plugIn/plugIn.html',
        bgColor: 'rgba(0,0,0,0)',
        rect: {
            x: 20,
            y: api.winHeight-208,
            w: api.winWidth-40,
            h: 188
        },
        animation: {
            type:"push",
            subType:"from_bottom",
            duration:300
        },
        pageParam: {
            data: data
        }
    })
    // api.addEventListener({
    //     name: 'choseDate'
    // },function(ret,err){
    //
    // })
}

//选择时间
    var thisTime=new Date().getTime();
    var chooseTime=[];
    for(var i=0;i<=60;i++){
        chooseTime[i]={};
        chooseTime[i].name=new Date(thisTime).Format("yyyy-MM-dd");
        chooseTime[i].sub=[];
        for(var j=0;j<24;j++){
            chooseTime[i].sub[j]={};
            chooseTime[i].sub[j].name=(j<10?('0'+j):j)+'点';
            chooseTime[i].sub[j].sub=[];
            for(var k=0;k<60;k++){
                chooseTime[i].sub[j].sub[k]={};
                chooseTime[i].sub[j].sub[k].name=(k<10?('0'+k):k)+'分';
            }
        }
        thisTime+=1000*60*60*24;
    }
    // 时间选择样式设置
    var layout= {
        row: 5,
        col: 3,
        height: 30,
        size: 12,
        sizeActive: 14,
        rowSpacing: 5,
        colSpacing: 10,
        maskBg: 'rgba(0,0,0,0.2)',
        bg: '#fff',
        color: '#888',
        colorActive: '#f00',
        colorSelected: '#f00'
    }
    var cancel= {
        text: '取消',
        size: 12,
        w: 90,
        h: 35,
        bg: '#fff',
        bgActive: '#ccc',
        color: '#888',
        colorActive: '#fff'
    }
    var ok= {
        text: '确定',
        size: 12,
        w: 90,
        h: 35,
        bg: '#fff',
        bgActive: '#ccc',
        color: '#888',
        colorActive: '#fff'
    }
    var title= {
        text: '请选择',
        size: 12,
        h: 44,
        bg: '#eee',
        color: '#888'
    }
