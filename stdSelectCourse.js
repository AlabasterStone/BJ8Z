Vue.config.devtools = true;
$(function () {
  var timer;
  var app = new Vue({
    el: '#stdSelectCourse',
    components: VueLoader({
        'course-simple': 'application/xk/studentParticipateElective/studentSelectCourse/components/course-simple.html',
        'course-detail': 'application/xk/studentParticipateElective/studentSelectCourse/components/course-detail.html'
    }),
    data: function () {
      return {
    	contentWidth: 0,
        hideSct: true,
        sctFixed: false,
    	beforeEnd: '',
        beforeBegin: '',
        isQuickEntry: false,   // 是否是快捷入口进入的
        detailObj: null,
        activityId: '', // 选中的活动id
        fullScreenLock: true,
        success:false,
        isRequest:false,
        activityInfo:{},
        oldActivityId:"",
        otherCourse: [],
        toShowDetail: false,
        otherSelect: false, // 单双周联合选课
        otherCourseId: '', // 选择另外一个课程id
        selectedCourseId:'',
        customization:'',
        errorMessage:"",
        hasQuickHeader: false,
        isBegin:false,
        baseUrl:contextPath
      }
    },
    mounted: function() {  // 初始化方法
    	// 页面初始化的时候直接请求选课活动
    	this.$nextTick(function () {
    		this.hasQuickHeader = !!document.getElementById('g_header') || false
    		this.contentWidth = this.$refs.stdSelectContent.offsetWidth;
            document.addEventListener('scroll', this.onScroll)
    	})
    },
    created: function() {  // 初始化方法
        // 页面初始化的时候直接请求选课活动
        this.getActivityInfo("");
     },
//    watch: {
//      'activityId': function () {
//        // 监听活动下拉框变化 请求获取选课活动及活动对应的选课信息
//      }
//    },
    methods: {
    	onScroll: function () {
	        if (!this.hideSct) return;
	        var top = this.hasQuickHeader ? 100 : 50;
	        // 兼容IE的写法window.pageYOffset
	        this.sctFixed = window.pageYOffset > top ? true : false
	    },
    	updateSelectCourse :function() {
      	  var self = this;
      	  var allCourseIds = {};
      	  for(var i = 0; i<self.activityInfo.courseSelections.length;i++){
      		  var courseSelections = self.activityInfo.courseSelections[i];
      		  for(var j = 0;j < courseSelections.courseList.length;j++){
      			  var course = courseSelections.courseList[j];
      			  allCourseIds[course.courseId]=course.courseNumflag;
      		  }
      	  }
  		  var params = {
  			  termId:self.activityId,
  			  sortRule:self.activityInfo.sortRule,
  			  courseIds:allCourseIds
  		  };
  		  var url = contextPath+"/studentElective/updateSelectCourseDate.do";
  		  $.ajax({
  			  url:url,
  			  type:"post",
  			  data:JSON.stringify(params),
  			  dateType:"json",
  			  contentType:"application/json",
  			  success:function(response){
			  if(response.success){
				  var AllCourseSurplueNum = response.data.AllCourseSurplueNum;
				  var selectedCourse = response.data.selectedCourse;
				  var selectedCourseContext = response.data.selectedCourseContext;
				  var courseIdPeriod = self.activityInfo.courseIdPeriod;
				  var studentSelectTypeCount = {};
				  var total = 0;
				  if(selectedCourseContext.length > 0){
					  for(var i = 0;i<selectedCourseContext.length;i++){
						  var typeId = selectedCourseContext[i].split('-:-:-')[3]
						  var singleCourseId = selectedCourseContext[i].split('-:-:-')[0]
						  var periods = courseIdPeriod[singleCourseId];
						  total += periods;
						  if(studentSelectTypeCount[typeId]){
							  studentSelectTypeCount[typeId] = studentSelectTypeCount[typeId] +periods;
						  }else{
							  studentSelectTypeCount[typeId] = periods;
						  }
					  }
				  }
				  self.activityInfo.selectedCourseIds = selectedCourse;
				  for(var i = 0; i<self.activityInfo.courseSelections.length;i++){
		      		  var courseSelections = self.activityInfo.courseSelections[i];
		      		  for(var j = 0;j < courseSelections.courseList.length;j++){
		      			  var courseId = courseSelections.courseList[j].courseId;
		      			  courseSelections.courseList[j].surplusNum = AllCourseSurplueNum[courseId]+"";
		      			  if(selectedCourse.indexOf(courseId) > -1){
		      				  courseSelections.courseList[j].selected = '1';
		      			  }else{
		      				  courseSelections.courseList[j].selected = '0';
		      			  }
		      		  }
		      		  if(self.activityInfo.sortRule === 'type'){
	      				  var typeId = courseSelections.courseTypeLimit.typeId;
	      				  if(studentSelectTypeCount[typeId]){
	      					  courseSelections.courseTypeLimit.studentSelectCount = studentSelectTypeCount[typeId];
	      				  }else{
	      					courseSelections.courseTypeLimit.studentSelectCount = 0;
	      				  }
	      			  }
		      	  }
				  var requestMsg = self.activityInfo.requireMsg;
				  self.activityInfo.selectStatus.hasSelectNum = total
				  if(requestMsg.totalMin > 0){
					  if(total < requestMsg.totalMin){
						  self.activityInfo.selectStatus.status = false;
						  return
					  }
				  }
				  var typeLimit = self.activityInfo.requireMsg.itemRequire;
				  if(typeLimit.length > 0){
					  for(var i = 0;i<typeLimit.length;i++){
						  var typeCount = studentSelectTypeCount[typeLimit[i].typeId]?studentSelectTypeCount[typeLimit[i].typeId]:0
						  if(typeLimit[i].less > 0){
							  if(typeCount < typeLimit[i].less){
								  self.activityInfo.selectStatus.status = false;
								  return
							  }
						  }
					  }
				  }
				  self.activityInfo.selectStatus.status = true;
				  
			  }else{
	  			  self.$message.error(response.message);
	  		  }
			}
		});  		  
        },
        dealData: function(data) {
        	var dealedData = {};
        	var sortRule = data.sortRule;
        	dealedData.mutexedCourse = data.mutexedCourse;
        	dealedData.activityNowDate = parseInt(data.activityNowDate/1000);
        	dealedData.versionNum = data.versionNum;
        	dealedData.skinType = data.skinType;
        	dealedData.termId = data.termId;
        	dealedData.switchNumber = data.switchNumber;
        	dealedData.switchCancel = data.switchCancel;
        	dealedData.sortRule = sortRule;
        	dealedData.oddFlag = data.oddFlag;
        	dealedData.courseMode = data.courseMode;
        	dealedData.customization = data.customization;
        	dealedData.switchDynamic = data.switchDynamic;
        	dealedData.switchDynamicShowStyle = data.switchDynamicShowStyle;
        	dealedData.studentContent = data.studentContent;
        	dealedData.activityList = data.activityList;
        	dealedData.selectedCourse = data.selectedCourse;
        	dealedData.isInBlackId = data.isInBlackId;
        	var activityDate = data.activityDate;
        	var activityLimit = data.activityLimit;
        	var allCourseType = data.allCourseType;
        	var allCourseLimit = data.allCourseLimit;
        	var selectedCourse = data.selectedCourse;
        	var courseClassTime = data.courseClassTime;
        	var allCourseInfo = data.allCourseInfo;
        	var surplusNumMap = data.surplusNumMap;
        	var courseIdPeriod = {};
        	var sortCourseResult = {};
        	var sortInfo = []
            var sortCourseList = [];
        	var termId = data.termId;
        	var gradeId = data.gradeId;
        	var xq = data.xq;
        	var classId = data.classId;
        	for (var courseId in allCourseInfo) {
                var courseInfo = allCourseInfo[courseId];
                if (courseInfo && courseInfo.courseTeachingPlanDTOList) {
					courseInfo.courseTeachingPlanDTOList = JSON.parse(courseInfo.courseTeachingPlanDTOList);
				}
                var courseId = courseInfo.courseId;
                /**设置课程剩余人数*/
                var courseNumFlag = parseInt(courseInfo.courseNumflag);
                var surplusNumKey = "";
                if(courseNumFlag == 0){
                    surplusNumKey = "courseNum_{LUAKEY_"+termId+"}_"+courseId;
                }else if(courseNumFlag == 1){
                    surplusNumKey = "courseNum_{LUAKEY_"+termId+"}_"+courseId+"_"+gradeId+"_"+xq;
                }else{
                    surplusNumKey = "courseNum_{LUAKEY_"+termId+"}_"+courseId+"_"+classId;
                }
                courseInfo.surplusNum=surplusNumMap[surplusNumKey];
                /**设置课程是否已选以及是否锁定*/
                if(selectedCourse.indexOf(courseId+"-:-:-"+courseInfo.courseName+"-:-:-"+courseInfo.courseProperty+"-:-:-"+courseInfo.courseTypeId+"-:-:-true-:-:-"+courseInfo.coursePeriod+"-:-:-"+courseInfo.classTimeId+"-:-:-"+courseInfo.stageId) >-1){
                    courseInfo.selected="1";
                    courseInfo.blockFlag="1";
                }else if(selectedCourse.indexOf(courseId+"-:-:-"+courseInfo.courseName+"-:-:-"+courseInfo.courseProperty+"-:-:-"+courseInfo.courseTypeId+"-:-:-false-:-:-"+courseInfo.coursePeriod+"-:-:-"+courseInfo.classTimeId+"-:-:-"+courseInfo.stageId) >-1){
                	courseInfo.selected="1";
                    courseInfo.blockFlag="0";
                }else{
                	courseInfo.selected="0";
                    courseInfo.blockFlag="0";
                }
        	}
        	// console.log(sortInfo, 23123)
        	//对课程进行归类和排序
            var courseInfoSort = []
            Object.values(allCourseInfo).forEach(function(item) {
                courseInfoSort.push(item)
            })
            var sertInfofavorite = courseInfoSort.filter(function (item){
                return item.favorite === '1'
            }).sort(function (a, b) {
                return Number(a.favoriteTime) - Number(b.favoriteTime);
            })
            var sertInfofavoriteNo = courseInfoSort.filter(function (item){
                return item.favorite === '0'
            }).sort(function (a, b) {
                const collator = new Intl.Collator('zh');
                return collator.compare(a.courseName, b.courseName);
            })
            sortCourseList = sertInfofavorite.concat(sertInfofavoriteNo);

        	if("time" === sortRule){
        		var courseClassTimes = [];
        		for(var courseKey in allCourseInfo){
        			var courseInfo = allCourseInfo[courseKey];
        			courseIdPeriod[courseInfo.courseId]=parseFloat(courseInfo.coursePeriod);
        			var classTimeId = courseInfo.classTimeId;
                    if(sortCourseResult[classTimeId]){
                        sortCourseResult[classTimeId].push(courseInfo);
                    }else{
                        var courseList = [];
                        courseList.push(courseInfo);
                        sortCourseResult[classTimeId] = courseList;
                    }
                    // console.log(courseInfo, 111)
                    if(courseClassTimes.indexOf(classTimeId) == -1){
                        courseClassTimes.push(classTimeId);
                        var classTimeMap = {};
                        classTimeMap.id=classTimeId;
                        classTimeMap.name=courseInfo.courseClassTimeName;
                        sortInfo.push(classTimeMap);
                    }
        		}

                sortInfo.sort(function(o1,o2){
                    var classTimeId1s = o1.id.split("_");
                    var classTimeId2s = o2.id.split("_");
                    var classTimeId1 = "";
                    var classTimeId2 = "";
                    for(var i=0 ;i<classTimeId1s.length;i++){
                        classTimeId1 += courseClassTime[classTimeId1s[i]].split("-:-:-")[1];
                    }
                    for(var i=0 ;i<classTimeId2s.length;i++){
                        classTimeId2 += courseClassTime[classTimeId2s[i]].split("-:-:-")[1];
                    }
                    var i1 = parseInt(classTimeId1);
                    var i2 = parseInt(classTimeId2);
                    return i1-i2;
                })

        	}else{
        		var courseTypeIds = [];
        		for(var courseKey in allCourseInfo){
        			var courseInfo = allCourseInfo[courseKey];
        			courseIdPeriod[courseInfo.courseId]=parseFloat(courseInfo.coursePeriod);
        			var typeId = courseInfo.courseTypeId;
                    if(sortCourseResult[typeId]){
                        sortCourseResult[typeId].push(courseInfo);
                    }else{
                        var courseList = [];
                        courseList.push(courseInfo);
                        sortCourseResult[typeId] = courseList;
                    }
                    if(courseTypeIds.indexOf(typeId) == -1){
                    	courseTypeIds.push(typeId);
                        var typeMap = {};
                        typeMap.id=typeId;
                        typeMap.name=courseInfo.courseType;
                        sortInfo.push(typeMap);
                    }
        		}

                sortInfo.sort(function(o1,o2){
                    var i1 = parseInt(allCourseType[o1.id].split("-:-:-")[1]);
                    var i2 = parseInt(allCourseType[o2.id].split("-:-:-")[1]);
                    return i1-i2;
                })
        	}
        	
        	var studentSelectTypeCount = {};
        	
        	var studentSelectStatusMap = {};
            var allSelectKont = 0;
            var selectedCourseIds = [];
            for(var i=0; i<selectedCourse.length;i++){
            	var course = selectedCourse[i];
                var courseSplit = course.split("-:-:-");
                selectedCourseIds.push(courseSplit[0]);
                var type = courseSplit[3];
                var coursePeriod = courseSplit[5];
                var singleCourseKont = parseFloat(coursePeriod);
                if(studentSelectTypeCount[type]){
                    studentSelectTypeCount[type]= studentSelectTypeCount[type]+singleCourseKont;
                }else{
                	studentSelectTypeCount[type]= singleCourseKont;
                }
                allSelectKont += singleCourseKont;
            }
            
            var typeIdLimit = {}
            
            //组装选课要求
        	var requireMsg = {};
        	var itemRequire = [];
        	var allCourseLimitMap = {};
        	var activityLimitSplit = activityLimit.split("_");
        	if(parseInt(activityLimitSplit[0]) == 1){
        		requireMsg.totalFlag = true;
        		requireMsg.totalMin = parseInt(activityLimitSplit[1]);
        		requireMsg.totalMax = parseInt(activityLimitSplit[2]);
        	}else{
        		requireMsg.totalFlag = false;
        		requireMsg.totalMin = parseInt(activityLimitSplit[1]);
        	}
        	for(var typeId in allCourseLimit){
        		var name = allCourseType[typeId].split("-:-:-")[0];
                var courseLimitMap = {};
                var limitInfo = allCourseLimit[typeId];
                var limitInfoSplit = limitInfo.split("_");
            	courseLimitMap.typeName = name;
                courseLimitMap.typeId=typeId;
                courseLimitMap.less=parseInt(limitInfoSplit[1]);
                courseLimitMap.most=parseInt(limitInfoSplit[2]);
                courseLimitMap.limit=limitInfoSplit[0]
                itemRequire.push(courseLimitMap);
                typeIdLimit[typeId] = courseLimitMap;
                var singleCourseLimitMap = {};
                singleCourseLimitMap.id = typeId;
                singleCourseLimitMap.name = name;
                singleCourseLimitMap.limit = parseInt(limitInfoSplit[0]);
                singleCourseLimitMap.min = parseInt(limitInfoSplit[1]);
                singleCourseLimitMap.max = parseInt(limitInfoSplit[2]);
                allCourseLimitMap[typeId] = singleCourseLimitMap; 
        	}
        	requireMsg.itemRequire = itemRequire
            studentSelectStatusMap.hasSelectNum=allSelectKont;
            var success = this.isSelectSuccess(requireMsg,allSelectKont,typeIdLimit,studentSelectTypeCount);
            studentSelectStatusMap.status=success;
            
          var courseResults = [];
          // console.log(sortInfo,3333)
          for(var i=0;i< sortInfo.length;i++){
              var courseResult = {};
              var id = sortInfo[i].id;
              var name = sortInfo[i].name;
              courseResult.section=name;
              courseResult.courseList = sortCourseList.filter(function(item){
                return ("type"==sortRule ? item.courseTypeId : item.classTimeId) === id
              });
			  // courseResult.courseList=sortCourseResult[id];
              if("type"==sortRule){
                  var courseTypeLimit = {};
                  courseTypeLimit.typeId=allCourseLimitMap[id].id;
                  courseTypeLimit.typeName=allCourseLimitMap[id].name;
                  courseTypeLimit.limitFlag=allCourseLimitMap[id].limit;
                  courseTypeLimit.min=allCourseLimitMap[id].min;
                  courseTypeLimit.max=allCourseLimitMap[id].max;
                  courseTypeLimit.studentSelectCount=studentSelectTypeCount[id]?studentSelectTypeCount[id]:0;
                  courseResult.courseTypeLimit=courseTypeLimit;
              }
              courseResults.push(courseResult);
          }
          // console.log(courseResults,1231)
            //转化开始时间与结束时间
        	dealedData.activityStartDate = parseInt(new Date(activityDate.split(",")[0].replace(/-/g,"/")).getTime()/1000);
        	dealedData.activityEndDate = parseInt(new Date(activityDate.split(",")[1].replace(/-/g,"/")).getTime()/1000);
            dealedData.requireMsg = requireMsg;
            dealedData.selectStatus = studentSelectStatusMap;
            dealedData.courseSelections = courseResults;
            dealedData.courseIdPeriod=courseIdPeriod;
            dealedData.typeIdLimit = typeIdLimit;
            dealedData.selectedCourseIds = selectedCourseIds
            return dealedData;
        },
        isSelectSuccess:function(requireMsg,allSelectKont,typeIdLimit,studentSelectTypeCount){
            var activityMin = requireMsg.totalMin;
            if(allSelectKont < activityMin){
                return false;
            }
            for(var type in typeIdLimit){
                var typeLimit = typeIdLimit[type];
                var typeCount = typeLimit.less;
                if(!studentSelectTypeCount[type]){
                    if(typeCount > 0){
                    	return false;
                    }
                }else{
                    var selectTypeCount = studentSelectTypeCount[type];
                    if(selectTypeCount < typeCount){
                    	return false;
                    }
                }
            }
            return true;
        },
      // 请求获取选课活动及活动对应的选课信息
      getActivityInfo :function(termId) {
    	  var params = {
			  termId:termId
	      };
	      var self = this;
	      self.otherCourseId = '';
	      var url = contextPath+"/studentElective/redisEnterStudentSelect.do";
	      $.post(url,params,function(response){
	    	  if(response.success){
	    		  self.activityInfo=self.dealData(response.data);
	    		  self.activityId = response.data.termId;
	    		  self.oldActivityId = response.data.termId;
	    		  self.fullScreenLock = false;
	    		  self.success = true;
	    		  self.isBegin = self.activityInfo.activityNowDate >= self.activityInfo.activityStartDate?true:false;
	    		  self.timeUtil();
	    	  }else{
	    		  self.activityId = self.oldActivityId;
	    		  if(termId !== ""){
	    			  self.$message.error(response.message)
	    		  }else{
	    			  self.fullScreenLock = false;
	    			  self.success = false;
	    			  self.errorMessage = response.message;
	    		  }
	    	  }
	    	  self.isRequest = true;
	      });
      },
      // 展示课程详情
      showDetailPop :function(obj) {
        this.detailObj = obj;
        this.toShowDetail = true
      },
      // 关闭课程详情
      closeDetailDialog :function(flag) {
        this.toShowDetail = flag
      },
      // 欲关闭单双周选课弹框（暂时不用）
      handleClose :function(done) {},
      // 选择课程
      selectCourse:function (courseId,courseProperty) {
        // 如果该活动有限制单双周必须联合选则打开对应的可选课程弹框
    	var self = this;
        if (self.activityInfo.oddFlag && courseProperty !=='正常课程') {
          var params = {
    		  termId:self.activityId,
    		  courseId:courseId,
          };
          var url = contextPath+"/studentElective/getBindCourse.do";
          $.post(url,params,function(response){
        	  if(response.success){
        		  self.otherCourse = response.bindCourse;
        		  self.otherSelect = true;
        		  if(response.bindCourse.length > 0){
        			  self.otherCourseId = response.bindCourse[0].courseId;
        		  }
        		  self.selectedCourseId = courseId;
        	  }else{
        		  self.$message.error('选课失败:'+response.message)
        	  }
          });
        }else{
        	var params = {
	  			termId:self.activityId,
	  			courseId:courseId,
	  			versionNum:self.activityInfo.versionNum
	  	    };
	  	    var url = contextPath+"/studentElective/redisStudentSelectCourse.do";
	  	    $.post(url,params,function(response){
	  	    	if(response.success){
	  	    		self.$message({message: response.message,type: 'success'});
	  	    		self.updateSelectCourse();
	  	    	}else{
	  	    		if(self.customization !== "ZGCSX" && response.message === "其他学期已选修该课"){
	        			  self.$confirm('您其他学期选过该课程，是否确定选择？')
	        		      .then(function() {
	        		        	var params = {
	        			  			termId:self.activityId,
	        			  			courseId:courseId,
	        			  			versionNum:self.activityInfo.versionNum,
	        			  			force:"force"
	        			  	    };
	        		        	var url = contextPath+"/studentElective/redisStudentSelectCourse.do";
	        			  	    $.post(url,params,function(response){
	        			  	    	if(response.success){
	        			  	    		self.$message({message: response.message,type: 'success'});
        			  	    			self.updateSelectCourse();
	        			  	    	}else{
	        			  	    		self.$message.error('选课失败:'+response.message)
	        		  	    			if(response.message !== "选课活动已停用，无法操作"){
	        		  	    				if("选课活动已更新，请重新操作"===response.message){
		        			  	    			self.getActivityInfo(self.activityId);
		        			  	    		}else{
		        			  	    			self.updateSelectCourse();
		        			  	    		}
	        		  	    			}
	        			  	    	}
	        			  	    });
	        		      })
	        		      .catch(function() {});
	        		  }else{
	        			self.$message.error('选课失败:'+response.message)
	  	    			if(response.message !== "选课活动已停用，无法操作"){
	  	    				if("选课活动已更新，请重新操作"===response.message){
			  	    			self.getActivityInfo(self.activityId);
			  	    		}else{
			  	    			self.updateSelectCourse();
			  	    		}
	  	    			}
	        		  }
	  	    	}
	  	    });
        }
      },
      cancelCourse:function (courseId,courseProperty) {
    	var self = this;
        // 取消提醒
    	if (self.activityInfo.oddFlag && courseProperty !=='正常课程') {
    		this.$confirm('此课程为单双周绑定课程，取消此门课程会同时取消同一时间点的另一门对应的单双周课程，是否确定取消？')
		      .then(function() {
		        	var params = {
			  			termId:self.activityId,
			  			courseId:courseId,
			  			versionNum:self.activityInfo.versionNum
			  	    };
			  	    var url = contextPath+"/studentElective/redisStudentCancelBindCourse.do";
			  	    $.post(url,params,function(response){
			  	    	if(response.success){
			  	    		self.$message({message: response.message,type: 'success'});
			  	    		self.updateSelectCourse();
			  	    	}else{
		  	    			self.$message.error('取消失败：'+response.message)
		  	    			if(response.message !== "选课活动已停用，无法操作"){
		  	    				if("选课活动已更新，请重新操作"===response.message){
    			  	    			self.getActivityInfo(self.activityId);
    			  	    		}else{
    			  	    			self.updateSelectCourse();
    			  	    		}
		  	    			}
			  	    	}
			  	    });
		      })
		      .catch(function() {});
        }else{
		    this.$confirm('确认取消选择该课程？')
		      .then(function() {
		        	var params = {
			  			termId:self.activityId,
			  			courseId:courseId,
			  			versionNum:self.activityInfo.versionNum
			  	    };
			  	    var url = contextPath+"/studentElective/redisStudentCancelCourse.do";
			  	    $.post(url,params,function(response){
			  	    	if(response.success){
			  	    		self.$message({message: response.message,type: 'success'});
			  	    		self.updateSelectCourse();
			  	    	}else{
			  	    		self.$message.error('取消失败:'+response.message)
		  	    			if(response.message !== "选课活动已停用，无法操作"){
		  	    				if("选课活动已更新，请重新操作"===response.message){
    			  	    			self.getActivityInfo(self.activityId);
    			  	    		}else{
    			  	    			self.updateSelectCourse();
    			  	    		}
		  	    			}
			  	    	}
			  	    });
		      })
		      .catch(function() {});
        }
      },
		favoriteCourse: function(courseId, favorite) {
			const self = this;
			const url = favorite === "1"? contextPath + "/studentElective/redisStudentCancelFavoriteCourse.do" :
				contextPath + "/studentElective/redisStudentFavoriteCourse.do";
			const params = {
				termId: self.activityId,
				courseId: courseId,
			};

			$.ajax({
				url: url,
				type: "post",
				data: JSON.stringify(params),
				dataType: "json",
				contentType: "application/json",
				success: function (response) {
					if (response.success) {
						self.$message({message: response.message, type: 'success'});
						self.getActivityInfo(self.activityId);
					} else {
						self.$message.error(response.message)
					}
				}
			});
		},

      // 渲染倒计时
      timeUtil :function() {
        // 先判断下当前时间是否在开始时间之前
    	clearInterval(timer)
        var self = this
        var now = self.activityInfo.activityNowDate * 1000
        var start = self.activityInfo.activityStartDate * 1000
        var end = self.activityInfo.activityEndDate * 1000
        if (now < start) {
          // 还未开始, 进行开始倒计时
          var diff = start - now
          self.beforeBegin = self.backtimeLabel(diff)
          timer = setInterval(function () {
            if (now < start) {
              now = now + 1000
              var diff1 = start - now;
              self.beforeBegin = self.backtimeLabel(diff1)
            }
            else {
            	self.isBegin = true;
            	if (now < end) {
                	now = now + 1000
                  var diff2 = end - now
                  self.beforeEnd = self.backtimeLabel(diff2);
                }else {
                  clearInterval(timer)
                  self.getActivityInfo('');
                }
            }
    			}, 1000)
        }
        else {
          // 已经开始, 进行结束倒计时
          var diff = end - now
          self.beforeEnd = self.backtimeLabel(diff)
          timer = setInterval(function () {
            if (now < end) {
            	now = now + 1000
              var diff2 = end - now
              self.beforeEnd = self.backtimeLabel(diff2);
            }
            else {
              clearInterval(timer)
              self.getActivityInfo('');
            }
    			}, 1000)
        }
      },
      backtimeLabel: function (timer) {
          var self = this
          var SECOND = 1000
          var MINUTE = 60 * 1000
          var HOUR = 60 * 60 * 1000
          var DAY = 24 * 60 * 60 * 1000
    			var dayNum = Math.floor(timer / DAY);
    			var hourNum = Math.floor((timer - dayNum * DAY) / HOUR);
    			var minuteNum = Math.floor((timer - dayNum * DAY - hourNum * HOUR) / MINUTE);
    			var secondNum = Math.floor((timer - dayNum * DAY - hourNum * HOUR - minuteNum * MINUTE) / SECOND)

    			return (dayNum ? self.format(dayNum) + ' 天  ' : '') +
    			(hourNum ? self.format(hourNum) + ' 小时  ' : '') +
    			(minuteNum ? self.format(minuteNum) + ' 分钟  ' : '') +
    			self.format(secondNum) + ' 秒  '
        },
        format:function (val) {
    			return val < 10 ? '0' + val : val;
		},
      // 取消选择其他课程
      cancelSelect :function() {
    	  this.otherSelect = false;
    	  this.otherCourseId = '';
      },
      // 最终确定选中课程
      sureSelectCourse:function () {
		var self = this;
		var params = {
			termId:self.activityId,
			courseId:self.selectedCourseId,
			courseId2:self.otherCourseId,
			versionNum:self.activityInfo.versionNum
		};
		if(self.otherCourseId==''){
			self.$message("请选一门单双周对应的课程");
			return;
		}
		var url = contextPath+"/studentElective/redisStudentSelectBindCourse.do";
		$.post(url,params,function(response){
			if(response.success){
				self.$message({message: response.message,type: 'success'});
				self.otherSelect = false;
				self.updateSelectCourse();
				self.otherCourseId = '';
			}else{
				if(self.customization !== "ZGCSX" && response.message === "其他学期已选修该课"){
		  			  self.$confirm('您其他学期选过该课程，是否确定选择？')
		  		      .then(function() {
		  		        	var params = {
		  			  			termId:self.activityId,
		  			  			courseId:self.selectedCourseId,
		  			  			courseId2:self.otherCourseId,
		  			  			versionNum:self.activityInfo.versionNum,
		  			  			force:"force"
		  			  	    };
		  		        	var url = contextPath+"/studentElective/redisStudentSelectBindCourse.do";
		  			  	    $.post(url,params,function(response){
		  			  	    	if(response.success){
		  			  	    		self.$message({message: response.message,type: 'success'});
		  			  	    		self.updateSelectCourse();
		  			  	    	}else{
		  			  	    		self.$message.error('选课失败:'+response.message)
			  		  	    		if(response.message !== "选课活动已停用，无法操作"){
				  		  	    		if("选课活动已更新，请重新操作"===response.message){
	        			  	    			self.getActivityInfo(self.activityId);
	        			  	    		}else{
	        			  	    			self.updateSelectCourse();
	        			  	    		}
	    		  	    			}
		  			  	    	}
		  			  	    });
		  			  	    self.otherCourseId = '';
		  		      })
		  		      .catch(function() {});
	      		  }else{
	      			  	self.$message.error('选课失败:'+response.message)
		    			if(response.message !== "选课活动已停用，无法操作"){
		    				if("选课活动已更新，请重新操作"===response.message){
			  	    			self.getActivityInfo(self.activityId);
			  	    		}else{
			  	    			self.updateSelectCourse();
			  	    		}
	  	    			}
		    			self.otherCourseId = '';
	      		  }
				self.otherSelect = false;
			}
		});
      }
    }
  });
});
