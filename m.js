$(function () {
    //获得最后一个跳过的步骤id的索引
    var findex="";
    //全部步骤的数组
    var step=[];
    //长连接要用到的数组
    var PullArr=[];
    //用户id
    var User_id=""
    //有结束条件的步骤id
    var exitid="";
    //结束条件
    var condition="";
    //有结束条件的所有id的数组
    var exitcount=[];
    //长连接标记
    var flag="";
    //模块划分后的数组
    var module=[];
    //第二次进入时最后一个跳过的步骤id
    var s_id="";
    //所有跳过的步骤
    var stepIndex=[];
    //实验进度
    var count="";
    //长连接需要的参数
    var pullobj={};
    //获取token的函数
    function getCookie(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //token值
    var tokens = getCookie('token') ? getCookie('token') : '35ebdd4c438fa658902d732304961172';
    // 这个是获取地址栏参数值的函数
    //获取地址栏参数，name:参数名称
    function getUrlParms(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)
            return unescape(r[2]);
        return null;
    }
    //方向等级
    var normal = getUrlParms('course_id') ? getUrlParms('course_id') : 'big_data_hcnp';
    //模块
    var moduler = getUrlParms('module') ? getUrlParms('module') : '18';
    //实验
    var test = getUrlParms('test') ? getUrlParms('test') : '8';
    //渲染数据函数
    function Getdata () {
        //第一个接口调用
        $.ajax({
                type: "get",
                url: "http://proxy.xiaoqiqiao.com/wareback/course/courseslist",
                data: {
                    normal:normal,module:moduler,test:test,token:tokens
                },
                datatype: 'JSONP',
                jsonp: 'callback',
                async:false,
                success: function (data) {
                    var data = JSON.parse(data);
                    console.log(data);
                    //实验标题
                    var title = data.result[0].title;
                    //实验介绍
                    var intro = data.result[0].intro;
                    User_id = data.result[0].user_id;
                    //有结束条件的id
                    exitid=data.result[0].exitid;
                    //结束条件
                    condition=data.result[0].condition;
                    //设置实验名字和实验介绍
                    $(".name").html(title);
                    $(".intro").html(intro);
                    //所有步骤的集合数组
                    step = data.result[0].step;
                    //所有具有结束条件的id的集合数组
                    exitcount=data.result[0].exitcount;
                    //分好模块的数据
                    module=dataCluster(exitcount,step);
                    // console.log(module);
                    var fStr ='',tStr='';
                    //渲染数据
                    $.each(module,function (i,o) {
                        $.each(o, function (index, val) {
                            var fins=o[index].t_id;
                            if(!fins){
                                tStr +=
                                    '<div class="bz"  id="bz_'+val.id+'" >' +
                                    '<h4>' + val.c_title + '</h4>' +
                                    '<p>' + val.content + '</p>' +
                                    '<img src="'+val.imageurl+'" alt="">' +
                                    '</div>'
                                ;
                            }else if(fins) {
                                tStr +=
                                    '<div class="bz"  id="bz_'+val.id+'" data-type="'+fins+'">' +
                                    '<h4>' + val.c_title + '</h4>' +
                                    '<p>' + val.content + '</p>' +
                                    '<img src="'+val.imageurl+'" alt="">' +
                                    '</div>'
                                ;
                            }

                        });
                        fStr += '<div class="module" id="mk_'+exitcount[i]+'">' +'<span><a href="javascript:;">跳过此步</a></span>'+
                            ''+tStr+'</div>';
                        $('.qbbz').html(fStr);
                        tStr="";
                    })

                    return findex;
                    return User_id;
                    return exitcount;
                    return step;
                    return condition;
                    return exitid;
                }
            }
        )
    }
    Getdata();
    var htmltwo="";
    $.each($('.module'),function(i,o){
        var _this = $(this);
        var idd=_this.attr("id").replace("mk_","");
        htmltwo= '<li id="dh_'+idd+'"></li>';
        $('.list_s').append(htmltwo);
    });
    //导航条高度设置
    var l_height=$(window).height()-((module.length-1)*2)-$(".right_nav").height();
    l_height=l_height/module.length
    $(".list_s li").css("height",l_height);
    var s_height=$(window).height()-$(".right_nav").height();
    $(".shouce").css("height",s_height);
    // console.log(PullArr);
    // console.log(findex)
    // console.log(user_id);
    //步骤分模块
    function dataCluster(arr, obj) {
        var newarr = [],
            onearr = [],
            twoarr = [];
        arr = arr.sort(function (a, b) {
            return a - b;
        });
        $.each(arr, function (m, n) {
            onearr = [], twoarr = [];
            $.each(obj, function (o, i) {
                if (m == 0) {
                    if (i.id <= n) {
                        onearr.push(i)
                    }
                } else if (m == arr.length - 1) {
                    if (arr[m - 1] < i.id && i.id <= n) {
                        onearr.push(i)
                    } else if (i.id > n) {
                        twoarr.push(i)
                    }
                } else {
                    if (arr[m - 1] < i.id && i.id <= n) {
                        onearr.push(i)
                    }
                }
            });
            newarr.push(onearr);
            if (m == arr.length - 1) {
                newarr.push(twoarr);
            }
        })
        if(newarr[0] == ''){
            newarr.splice(0,1);
        }
        if(newarr[newarr.length-1] == ''){
            newarr.splice(newarr.length-1,1);
        }
        return newarr;
    }
    ChangeColor();
    //根据状态改变背影颜色
    function ChangeColor () {
        $.each($('.qbbz div'),function(i,o){
            var _this = $(this);
            if(_this.attr('data-type') == 1){
                $(this).parent().addClass('colorSucc')
            }else if(_this.attr('data-type') == 2){
                $(this).parent().removeClass('colorSucc').addClass('colorError');
                $(".colorError span").css("display","block");
                $(".colorError span").text("已跳过");
            }

        })
        $.each($('.list_s li'),function(i,o){
            var b_id=$(this).attr("id").replace('dh','bz');
            var d_id=$('#'+b_id).attr('data-type');
            if(d_id == 1){
                $(this).addClass('dcolorSucc');
            }else if(d_id == 2){
                $(this).removeClass('dlcolorSucc').addClass('dcolorError');
            }
        })
        if(condition!="stop!"){
            $('#mk_'+exitid).addClass('colorActive');
            timeout(10);
            $('#dh_'+exitid).addClass('dcolorActive');
            $('.shouce').scrollTo('.module:eq('+ $('#mk_'+exitid).index()+')',1500);
        }else {
            $('#mk_'+exitid).addClass('colorSucc');
            $('#dh_'+exitid).addClass('dcolorSucc');
        }

        var _tBg = $('.qbbz .module').eq(0).css('background-color');
        $('.title').css('background-color',_tBg);

    }
    //发送数据给长连接服务器
    function SendMes (obj) {
        // var objj=JSON.parse(obj);
        // console.log(objj);
        var str=JSON.stringify(obj);
        // console.log (str);
        $.ajax({
            type: "POST",
            url: "http://117.78.43.78:8080/ecsprovision/envcheck",
            contentType: 'application/json;charset=utf-8',
            data:str,
            async:false,
            success:function (data) {
                // var data=JSON.parse(data);
                //  console.log(data);
                flag=data;
                return flag;
            }
        });
    }
    //判断用户是不是第一次进入实验
    if(exitid==exitcount[0]){
        var exitData = {};
        exitData[exitid] = condition;
        pullobj={user_id:User_id,step:[exitData]};
        console.log (pullobj);
        SendMes(pullobj);
        PullRuest(flag.streamId,exitcount,s_id);
    }else{
        if(exitid!=exitcount[exitcount.length-1]){
            $.each(step,function (i,o) {
                //把所有完成的步骤放到数组里
                if(o.t_id == 2){
                    var exitData = {};
                    exitData[o.id] = o.finish;
                    stepIndex.push(exitData);
                }
            })
            //获得最后一个跳过的步骤id
            console.log(stepIndex);
            findex=stepIndex.length-1;
            $.each(stepIndex[findex],function (i,o) {
                s_id=i;
            })
            console.log (s_id);  var exitData = {};
            exitData[exitid] = condition;
            //为长连接提供参数数组
            step.forEach(function (val,index) {
                if(val.finish!=""&&val.t_id==2){
                    var exitData = {};
                    exitData[val.id] = val.finish;
                    PullArr.push(exitData);
                }
                return PullArr;
            })
            PullArr.push(exitData);
            pullobj={user_id:User_id,step:PullArr};
            console.log (pullobj);
            SendMes(pullobj);
            PullRuest(flag.streamId,exitcount,s_id);
        }else {
            console.log("当前实验已经全部完成")
        }
    }
    //第二个接口长连接
    function PullRuest(flag,arr,s_id) {
        var pullobjj={};
        var strr=JSON.stringify(flag);
        var exitcountt=[];
        $.eventsource({
            // Assign a label to this event source
            label: "event-source-label",
            // Set the file to receive data from the server
            url:'http://117.78.43.78:8080/ecsprovision/sse?sseId='+strr+'',
            // Set the type of data you expect to be returned
            // text, json supported
            // data:{step:obj},
            dataType: "json",
            headers:("Content-type:event-stream"),
            async:false,
            // Set a callback to fire when the event source is opened
            // `onopen`
            open: function( data ) {
                // console.log( data );
                console.log("连接开始")
            },
            // Set a callback to fire when a message is received
            // `onmessage`
            message: function( data ) {

                // console.log(data);
                console.log("连接获得数据");

                //发送数据给后端
                if( data.stepid!==arr[arr.length-1]){
                    var str=JSON.stringify([data]);
                    $.ajax({
                        type: "get",
                        url: "http://proxy.xiaoqiqiao.com/wareback/course/index_ware",
                        data:{array:str},
                        datatype: 'json',
                        async:false,
                        jsonp: 'callback',
                        success:function (data) {
                            var data2 = JSON.parse(data);
                            console.log(data2);
                            count=data2.result[0].count;
                            var u_id=data2.result[0].user_id;
                            var exitDataa = {};
                            var exitidd=data2.result[0].exitid;
                            var conditiond=data2.result[0].condition;
                            exitcountt=data2.result[0].exitcount;
                            exitDataa[exitidd] = conditiond;
                            pullobjj={user_id:u_id,step:[exitDataa]};
                            if(exitidd!==exitcountt[exitcountt.length-1]){
                                if(exitidd>s_id){
                                    SendMes(pullobjj);
                                    console.log("发送了发送了");
                                    console.log(exitidd);
                                }
                                // console.log(pullobjj);

                            }else {
                                SendMes(pullobjj);
                                console.log ("进来了");
                                // console.log (exitidd);
                                $('#mk_'+exitidd).removeClass('colorActive').addClass('colorSucc');
                                $('#dh_'+exitidd).removeClass('dcolorActive').addClass('dcolorSucc');
                                $('#mk_'+exitidd+' span').css("display","none");
                            }
                            console.log("长连接内ajax请求成功");
                        }
                    });
                }

                //获得数据更改状态.
                if(data.status == 1){
                    var z_index=0;
                    if($('#mk_'+data.stepid).is('.colorActive')){
                        $('#mk_'+data.stepid).removeClass('colorActive').addClass('colorSucc');
                        z_index=$('#mk_'+data.stepid).index();
                        z_index=z_index+1;
                        $('.shouce').scrollTo('.module:eq('+z_index+')',3000);
                        $('#mk_'+data.stepid).next().addClass('colorActive');
                        timeout(10);
                        $('#dh_'+data.stepid).next().addClass('dcolorActive');
                    }else if($('#mk_'+data.stepid).is('.colorError')){
                        z_index=$('#mk_'+data.stepid).index();
                        z_index=z_index+1;
                        $('#mk_'+data.stepid).removeClass('colorError').addClass('colorSucc');
                        $('#mk_'+data.stepid+' span').css("display","none");
                        $('.shouce').scrollTo('.module:eq('+z_index+')',3000)
                    }else if($('#mk_'+data.stepid).is('.colorWaring')){
                        z_index=$('#mk_'+data.stepid).index();
                        z_index=z_index+1;
                        console.log (z_index);
                        $('#mk_'+data.stepid).removeClass('colorWaring').addClass('colorSucc');
                        $('#mk_'+data.stepid+' span').css("display","none");
                        $('.shouce').scrollTo('.module:eq('+z_index+')',3000)
                    }
                    if($('#dh_'+data.stepid).is('.dcolorActive')){
                        $('#dh_'+data.stepid).removeClass('dcolorActive').addClass('dcolorSucc')

                    }else if($('#dh_'+data.stepid).is('.dcolorError')){
                        $('#dh_'+data.stepid).removeClass('dcolorError').addClass('dcolorSucc')
                    }else if($('#dh_'+data.stepid).is('.dcolorWaring')){
                        $('#dh_'+data.stepid).removeClass('dcolorWaring').addClass('dcolorSucc')
                    }
                    var _tBg = $('.qbbz .module').eq(0).css('background-color');
                    $('.title').css('background-color',_tBg);
                }else if(data.status==0){
                    //显示个提示跳过
                    console.log("错了错了");
                    $('#mk_'+data.stepid).addClass("colorWaring")
                    if($('#mk_'+data.stepid).is('.colorActive')){
                        $('#mk_'+data.stepid).removeClass('colorActive').addClass('colorWaring')
                        $(".colorWaring span").css("display","block");
                    }else if($('#mk_'+data.stepid).is('.colorError')){
                        $('#mk_'+data.stepid).removeClass('colorError').addClass('colorWaring')
                        $(".colorWaring span").css("display","block");
                    }
                    if($('#dh_'+data.stepid).is('.dcolorActive')){
                        $('#dh_'+data.stepid).removeClass('dcolorActive').addClass('dcolorWaring')
                    }else if($('#dh_'+data.stepid).is('.dcolorError')){
                        $('#dh_'+data.stepid).removeClass('dcolorError').addClass('dcolorWaring')
                    }else {
                        $('#dh_'+data.stepid).addClass('dcolorWaring');
                    }
                    var _tBg = $('.qbbz .module').eq(0).css('background-color');
                    $('.title').css('background-color',_tBg);
                }
                // Close event sources by label name
                // $.eventsource("close", "event-source-label");
            },
            close:function () {
                console.log("连接关闭");
            }
        });
        console.log(count);
        return count;
    }
    //加个定时器显示跳过模块
    function timeout(time) {
        var timer=setInterval(function () {
            time--;
            if(time==0){
                $(".colorActive span").css("display","block");
                console.log("显示出来了");
                clearInterval(timer);
            }
        },1000);
    }
    //左侧导航条
    function SelectMeau(){
        $(".list_s li").on('click',function(){
            var _index = $(this).index();
            $(this).addClass('cur').siblings().removeClass('cur');
            $('.shouce').scrollTo('.module:eq('+_index+')',800)
            console.log("触发事件");
        })
    }
    SelectMeau();
    //设置标题颜色跟下面第一个模块背景颜色一样;
    function title() {
        var _tBg = $('.qbbz .module').eq(0).css('background-color');
        $('.title').css('background-color',_tBg);
    }
    //跳过步骤功能
    function Skip(User_id) {
        $(".module a").on('click',function () {
            console.log("事件触发");
            var s_id=$(this).parent().parent().attr("id");
            s_id=s_id.replace('mk_','');
            if($(this).parent().parent().is('.colorWaring')){
                $(this).parent().parent().removeClass('colorWaring').addClass('colorError');
            }else if($(this).parent().parent().is('.colorActive')){
                $(this).parent().parent().removeClass('colorActive').addClass('colorError');
            }
            if($('#dh_'+s_id).is('.dcolorWaring')){
                $('#dh_'+s_id).removeClass('dcolorWaring').addClass('dcolorError');
            }else  if($('#dh_'+s_id).is('.dcolorActive')){
                $('#dh_'+s_id).removeClass('dcolorActive').addClass('dcolorError');
            }
            $(this).parent().parent().next().addClass('colorActive');
            timeout(10);
            $('#dh_'+s_id).next().addClass('dcolorActive');
            $(".colorError span").text("已跳过");
            $(".colorError span").css("display","block");
            title();
            var s_index=$("#mk_"+s_id).index()+1;
            $('.shouce').scrollTo('.module:eq('+s_index+')',2000);
            var sk_obj={stepid:s_id,status:2,userId:User_id};
            console.log (sk_obj);
            $.ajax({
                type: "get",
                url: "http://proxy.xiaoqiqiao.com/wareback/course/index_ware",
                data:{array:JSON.stringify([sk_obj])},
                datatype: 'jsonp',
                async:false,
                jsonp: 'callback',
                success:function (data) {
                    var data2 = JSON.parse(data);
                    console.log(data2);
                    console.log("跳过内ajax请求成功");
                }
            });
        })
    }
    Skip(User_id);
    console.log(count);
})

