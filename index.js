	// 解析url
	var parseQuery = function(query){
	    var reg = /([^=&\s]+)[=\s]*([^=&\s]*)/g;
	    var obj = {};
	    while(reg.exec(query)){
	        obj[RegExp.$1] = RegExp.$2;
	    }
	    return obj;
	}

	// 解析url 截取courseId
	var parametersString = location.href.substr(location.href.lastIndexOf('?')+1);
	var parameters = parseQuery(parametersString);
	var courseType = 'big_data';//方向
	var courseLevel = 'hcnp';//级别
    // var normal=courseType+'_'+courseLevel;//苑永健拼接参数（方向级别）；
    // console.log(normal);
	var courseId = parameters['course_id'];
	if (courseId) {
		var _index = courseId.lastIndexOf('_');
		if (_index > 0) {
			courseType = courseId.substr(0, _index);
			courseLevel = courseId.substr(_index+1);
		}
	}
	// console.log(courseType + ', ' + courseLevel);
	
		// token 获取
		function getCookie(name) { 
	         var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	        var r = window.location.search.substr(1).match(reg);
	        if (r != null) return unescape(r[2]);
	         return null;
		}
		var tokens = getCookie('token') ? getCookie('token') : '1';


	var saasToken;
	var saasClientUuid;
	var saasShareOnlyId;
	var saasControlId;

	$(function (){
		// Set the topology file name for the given course type
		$('#contentFrame').attr('src', courseId + '.svg');
		// Set the course ware file name to the given course type
		$('#coursewareFile').attr('src', 'file/' + courseId + '.pdf');

		// 自动加载获取头像、姓名、实验方向
		function personage(){
			$.ajax({
				type: "GET",
				url: "http://proxy.xiaoqiqiao.com/userinfo/index.php/index/info",			
				data: {token: tokens,check:2},
				dataType : 'JSONP',
				jsonp : 'callback', 
				success: function(data) {
					// console.log(data);
					var result=data.result
					// var ict_type = getCookie('cname') ? getCookie('cname') : 'big_data_hcnp';
					var ict_type = data['result']['ict_type'][courseId];
					// console.log(ict_type);
					$('.test_name').html(ict_type);//实验方向	
					// console.log(data.result['ict_type'][ict_type]);
					var avatar = data.result['avatar'];
					//alert(avatar);		
					$('.portrait_img').attr("src",data.result['avatar']);//头像
					$('#name').html(data.result['real_name']);//用户名
					var nameId = 'uid'+data.result['mid'];//id传参
					// console.log(nameId);
					transfer_gplot(nameId);
				},error:function(){
					console.log("自动加载个人信息出错了");
				}
			});
		};
		personage();
		

		function transfer_gplot(nameId) {
			// console.log(nameId);
			$("#user").val(nameId);
			var tabajax = $.ajax({				                                             
				url: 'http://117.78.43.78:8080/ecsprovision/init',
				type: 'POST',
				contentType: 'application/json;charset=utf-8',
				data: JSON.stringify({"topology":courseId.toUpperCase(),"userId":nameId}),
				dataType:'JSON',
				headers:{"Content-Type":"application/json"},
		    	timeout:600000,//5分钟
				success: function(data){
					console.log(data);
					var labelHtml = '<li class="nav-item nav_sign" id="topology"><a href="javascript:;"><i class="icon_1"></i><span>实验拓扑图</span></a></li>';
					for(var ids in data) {
						for (var label in data[ids]) {
							labelHtml += '<li class="nav-item" v="' + data[ids][label] + '">' 
											+'<a href="javascript:;">'
												+'<i class="icon_s"></i>'
												+'<span>'+label+'</span>'
											+'</a>'
										+'</li>';
							// console.log(data[ids][label]);
							// Get token from the return URL and set it to the global variable
							if (data[ids][label]) {
								var searchString = '?token=';
								var indexOfToken = data[ids][label].indexOf(searchString);
								if (indexOfToken > 0) {
									saasToken = data[ids][label].substr(indexOfToken + searchString.length);
								}
							}
						}
					}
					$(".nav_ul").html(labelHtml);
					$("#load").css("display","none");
				},
				
				error: function(){
					alert("加载失败出错了...");
				},
				complete : function(XMLHttpRequest,status){ 
					//请求完成后最终执行参数
			　　　　if(status=='timeout'){
						//超时,status还有success,error等值的情况
			 　　　　　 tabajax.abort();
			　　　　　  alert("加载超时，请重试！");
			　　　　}
			　　} 			
			});
				
			// 开始实验倒计时
			timer(intDiff);
		}

		// 点击左侧节点切换
		$(".nav_ul").on("click", "li", function() {
			// console.log($(this));
			var url_jiedian = $(this).attr("v");
			$(this).addClass("nav_sign").siblings().removeClass("nav_sign");
			// console.log('trying to load url: ' + $(this).find('input').val());
			var src = courseId + '.svg';
			if ($(this).attr('id') != 'topology') {
				src = url_jiedian;
			}

			$('#show iframe').attr('src', src);
			
		});
		

		// 倒计时
		var intDiff = parseInt(3600); //倒计时总秒数量
		var time;
		timer(intDiff);
		function timer(intDiff) {
			var nameId =$("#user").val();
			time = setInterval(function () {
			    var hour = 0,
			        minute = 0,
			        second = 0; //时间默认值
			    if (intDiff > 0) {
			    	day = Math.floor(intDiff / (60 * 60 * 24));
			        hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
			        minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
			        second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
			    }
			    if (minute <= 9) minute = '0' + minute;//在单个数时前加0;
			    if (second <= 9) second = '0' + second;

			    //实验到时弹出框提示
			    if (minute == 02 && second == 00) {
			    	shade ();
			    };

			    // 如果1分钟后无操作，关闭页面,向后端发送请求
			    if (minute == 00 && second == 20) {
			    	endLab(true, time, nameId);
			    	$(".showAlert").css('display','none'); 
			    	// 右侧工具栏和悬浮小球要隐藏
					$('#load').html('<div class="log"><img src="images/logo000.png" alt=""><p>实验已结束</p></div>');
					$('#load').show();  
					// 暂停计时
					clearInterval(time);					
			    };

			    $('#hour_show').html(hour + ' :');
			    $('#minute_show').html(minute + ' :');
			    $('#mini_minute_show').html(minute);//mini时间
			    $('#second_show').html(second);
			    intDiff--;
		    }, 1000);
		}

		// 弹出遮罩层
		// 时间快到了
	    function shade(){ 
	        var obj={
	            type:'layer-rollIn',
	            title: '是否加时',
	            close: 'false',
	            content:"<div>距离实验结束还有2分钟，是否需要加时？</div>",	            
	            btn:["不 加","加 时"],
	            callBack2:function(){
	            	// 清除定时器，加时
	            	clearInterval(time);
			        timer(intDiff);
	            	var obj = {
	            		content:"加时成功！",
	            		area:["180px","40px"],
	                    time:1500,
	                    line:'40px'
			        };
			        method.msg_fade(obj);				        
	            }
	        };
	        method.msg_layer(obj);
	    };

		// 结束实验
		$(".over,#mini_over").click(function(){
			var nameId= $("#user").val();
			
	        var obj={
	            type:"layer-shake",
	            title:"温馨提示",
	            // close:"false",  //关闭按钮
	            content:"<div>退出之前 是否需要保存实验进度 ？</div>",
	            area:["320px","160px"],
	            btn:["否","是"],
	            callBack1: function(){
	            	var obj={
						content:"环境处理完成",
						area:["180px","40px"],
						time:2000,
						line:'40px'
					};
					endLab(false, time, nameId),//传参

					// 关闭弹框
					method.msg_fade(obj);//关闭提示框
					setTimeout(function custom_close(){  
						$('#load').html('<div class="log"><img src="images/logo000.png" alt=""><p>实验已结束</p></div>');
						$('#load').show();
					}, 2000);
	            },
	            
	            callBack2: function(){
	            	var obj={
						content:"环境处理完成",
						area:["180px","40px"],
						time:2000,
						line:'40px'
					};
					endLab(true, time, nameId),//传参
					// 关闭弹框
					method.msg_fade(obj);//关闭提示框
					setTimeout(function custom_close(){  
						$('#load').html('<div class="log"><img src="images/logo000.png" alt=""><p>实验已结束</p></div>');
						$('#load').show();  
					}, 2000);
	            }
	        };
	        // 关闭弹框
	        method.msg_layer(obj);
		});

		function endLab(save, time, nameId) {
			
			var url = 'http://117.78.43.78:8080/ecsprovision/' + (save ? 'save' : 'done');
			$.ajax({
				type: 'POST',
				contentType: 'application/json;charset=utf-8',
				url: url,
				data: JSON.stringify({"topology":courseId.toUpperCase(),"userId":nameId}),
				dataType: 'JSON',
				headers:{"Content-Type":"application/json"},
				success: function(data){
					
				},
				error: function(){
					console.log("结束实验，数据处理出错了")
				},
				
				// complete: function() {
	
				// }
			});
		
			// 暂停计时
			clearInterval(time);
		}
	
		// 右侧功能
		//ajax获取视频	
	   function video (argument) {
	   	 // body...  		
	   	 	$.ajax({
	        	type : 'GET',
	        	url : 'http://proxy.xiaoqiqiao.com/app/dataprovider/XqYunvideo/get_yun_video',
	            data : {group :courseType, level : courseLevel},
	            dataType : 'JSONP',
	            jsonp : 'callback',
	            success : function(data){
	                // console.log(data);
	                var videolist = '<div class="list_video">';
	                var result = data.result;
	                for (var i = 0; i < result.length; i++) {
	                	var yc_id = result[i].yc_id;
						videolist += '<div class="video_title">' + result[i].title + '<br/></div>'
						+'<video class="video" width="99%" height="280px" class="prism-player" controls loop preload="none" src="' + result[i].web_url + '"> </video>';
	                }
		    		videolist += '</div>';
	                $("#tab-video").html(videolist);

	                // 点击下一个视频，暂停上一个
	                var videos = document.getElementsByTagName('video');
				    for (var i = videos.length - 1; i >= 0; i--) {
				        (function(){
				            var p = i;
				            videos[p].addEventListener('play',function(){
				                pauseAll(p);
				            })
				        })()
				    }
				    function pauseAll(index){
				        for (var j = videos.length - 1; j >= 0; j--) {
				            if (j!=index) videos[j].pause();
				        }
				    };

				    // 切换其他项目，暂停当前视频
				    $("#course,#rq").click(function(){
						$('video').trigger('pause');
		 			});	
	            },
	            error : function(){
	                alert('哎呀！课程视频加载出错了...');
	            }
			});
	   }
	   video();
		
		// 右侧工具栏
		// 共享屏幕
		
		// Register window message event to receive message sent from guacamole client postMessage
		window.addEventListener('message', receiveMessage);

		function receiveMessage(event) {
			if (event.origin != 'http://117.78.43.78:8080') {
				console.log('message was not sent from the guacamole server, it might be an anonymous attack. Origin was from ' + event.origin);
				return;
			}

			console.log(event.data);

			for (key in event.data) {
				if (key == 'client.tunnel.uuid') {
					saasClientUuid = event.data[key];
				} else if (key == 'sharingData') {
					getShareIds(event.data[key]);
				}
			}
		}

		// Get the two URLs from the json object ids
		function getShareIds(sharingData) {
			if (sharingData == null)
				return;

			for (var index in sharingData) {
				if (sharingData[index] == 'shareOnly') {
					saasShareOnlyId = index;
				} else if (sharingData[index] == 'control') {
					saasControlId = index;
				}
			}
		}
		
		// Generate the url for the two IDs
		$(".share").click(function(){
			if (saasShareOnlyId != null && saasControlId != null && saasToken != null & saasClientUuid != null) {
				console.log('shareOnlyId: ' + saasShareOnlyId + ', controlId: ' + saasControlId + ', token: ' + saasToken);
				setShareDesktopUrlFromId(saasClientUuid, saasShareOnlyId, saasToken, 'read_url');
				setShareDesktopUrlFromId(saasClientUuid, saasControlId, saasToken, 'write_url');
				console.log('returned from calls: ' + saasShareOnlyId + ', ' + saasControlId);
				// 获取共享功能的链接
				// $('.read_url').attr('value', shareOnlyUrl);
				// $('.writre_url').val(controlUrl);

				// 弹框显示
				$(".share_page").css('display','block');
			} else {
				alert('the variables are not set propertly');
			}
		});

		

		var guacamoleRootContext = "http://117.78.43.78:8080/guacamole";
		function setShareDesktopUrlFromId(uuid, sharingId, token, inputClass) {
			const prefix = guacamoleRootContext + '/api/session/tunnels/';
			var url = prefix + uuid + '/activeConnection/sharingCredentials/' + sharingId;
			$.ajax({
				url: url,
				type: 'get',
				data: {token: token},	
				datatype: 'json',
				// jsonp : 'callback',
				success: function(data) {
					if (data.values && data.values.key) {
						var linkUrl = guacamoleRootContext + '/#/?key=' + data.values.key;
						console.log(linkUrl);
						$('.' + inputClass).val(linkUrl);
					}
				},
				error:function(){
					console.log('获取屏幕共享出错了');
					return null;
				}
			})
		};

		function getCookie(name) {
		    var arr = document.cookie.split('; ');
		    var i = 0;
		    for(i = 0; i< arr.length; i++){
		        //arr2->['username', 'abc']
		        var arr2 = arr[i].split('=');
		         
		        if(arr2[0] == name) {  
		            var getC = decodeURIComponent(arr2[1]);
		            return getC;
		        }
		    } 
		    return '';
		};

		// 实验界面获取焦点
		$("#contentFrame").on('click', function(){	
			("#contentFrame").focus();
		});

		$("#contentFrame").on('mouseover', function(){
			$("#contentFrame").focus();	
		});

		// 误关窗口提示
		window.onbeforeunload = function (e) {
		    e = e || window.event;
		    // 兼容IE8和Firefox 4之前的版本
		    if (e) {
		        e.returnValue = '关闭提示';
		    }
		  // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
		  return '关闭提示';
		};

	});

	// loading
	setTimeout(function(){
		$(".loading").css("display","none");
		$("#load").css("background-color","#e1ffff");
		$(".log").css("display","block");
		
		setTimeout(function(){
			$("#load").css("display","none");
			$(".log").css("display","none");
			$(".bodycontent").css("display","block");
			$("#main, #demo").css("display","block");
		},1500);
		
	},5700);