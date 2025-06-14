 const grader = {
	start:function(){
		this.video = document.getElementById("vidlive");
		this.select = document.getElementById("cameraOption");
		this.loading = document.getElementById("loading");
		this.FPS = 28;
		this.BREAK_TIME = 3000;//ms
		this.streaming = true;
		// initial values
		this.param = {
			blockSize:document.getElementById("blockSize"),
			constant:document.getElementById("constant"),
			cblockSize:document.getElementById("chblockSize"),
			cconstant:document.getElementById("chconstant"),
			approx:document.getElementById("approx")
		};
		// initial values
		this.paperBlockSize=parseInt(this.param.blockSize.value);
		this.paperConstant=parseInt(this.param.constant.value);
		this.paperApprox = parseFloat(this.param.approx.value);
		this.choicesBolockSize = parseInt(this.param.cblockSize.value);
		this.choicesConstant = parseInt(this.param.cconstant.value);
		
		this.param.blockSize.onchange = function(ev){
			grader.paperBlockSize=parseInt(ev.target.value);
		}
		this.param.constant.onchange = function(ev){
			grader.paperConstant=parseInt(ev.target.value);
		}
		this.param.approx.onchange = function(ev){
			grader.paperApprox = parseFloat(ev.target.value);
		}
		this.param.cblockSize.onchange = function(ev){
			grader.choicesBolockSize = parseInt(ev.target.value);
		}
		this.param.cconstant.onchange = function(ev){
			grader.choicesConstant = parseInt(ev.target.value);
		}
		this.select.onchange = this.changeCamera;
		this.request();
		this.isLoading(true);
		document.getElementById("opencvScript").onload = this.opencvReady;
		
	 },
	request:function (){
		if(!this.stream){
			navigator.mediaDevices.getUserMedia({
						video: true,
						audio: false
					})
					.then(stream => {
						this.stream = stream;
						this.video.srcObject = stream;
						this.video.play();
						navigator.mediaDevices.enumerateDevices()
						.then(this.gotDevices)
						.catch(this.handleError)
					})
					.catch(this.handleError);
		}
	},	
	gotDevices:function(devices){
		grader.select.innerHTML = "";
		devices.forEach(
			function(dev){
				if(dev.kind=="videoinput"){
					const option = document.createElement('option');
					option.value = dev.deviceId;
					option.text = dev.label;
					grader.select.appendChild(option);
				}
			}
		);
	},
	 
	changeCamera:function (){
		if(this.stream){
			this.stream.getTracks().forEach(track =>{
				track.stop();
			 });
			 const cameraId = this.select.value;
			 navigator.mediaDevices.getUserMedia({
						video: {deviceId: cameraId?{exact:cameraId}:undefined},
						audio: false
					}).then(function (stream){
						this.stream = stream;
						video.srcObject = stream;
						video.play();
					}).catch(this.handleError);
		 }
	 },
	 
	opencvReady:function(){
		//loading complete
		grader.isLoading(false);
		
		let src = new cv.Mat(grader.video.height, grader.video.width, cv.CV_8UC4);
		let dst = new cv.Mat(grader.video.height, grader.video.width, cv.CV_8UC4);
		let gray = new cv.Mat();
		let grayblured = new cv.Mat();
		let cap = new cv.VideoCapture(grader.video);
		let cnts = new cv.MatVector();
		let hierarchy = new cv.Mat();
		let approx = new cv.Mat();
		let c = new cv.Mat();
		let color = new cv.Scalar(0,0,255,255);
		let ksize = cv.Size(3,3);
		function updated( attrib){
			return attrib;
		}
		function processVideo() {
			try {
				if (!grader.streaming) {
					// clean and stop.
					src.delete();
					dst.delete();
					gray.delete();
					hierarchy.delete();
					approx.delete();
					c.delete();
					grader.log("scanning stopped");
					return;
				}
				let begin = Date.now();
				//grader.log("scanning with paperblocksize:"+grader.paperBlockSize+" paperConstant:"+grader.paperConstant+" paperApprox:"+grader.paperApprox);
				// start processing.
				cap.read(src);
				src.copyTo(dst);
				cv.resize(dst, dst, new cv.Size(0,0), 0.9, 0.9, cv.INTER_AREA);
				cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
				//cv.GaussianBlur(gray,grayblured,ksize,0,0,cv.BORDER_DEFAULT);
				//cv.bilateralFilter(gray, grayblured, 9, 75, 75, cv.BORDER_DEFAULT);
				
				cv.adaptiveThreshold(gray,gray,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C,cv.THRESH_BINARY_INV,updated(grader.paperBlockSize),updated(grader.paperConstant));
				cv.findContours(gray, cnts, hierarchy, cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE)
				for (let i=0; i< cnts.size();++i){
					c = cnts.get(i);
					cv.approxPolyDP(c,approx, updated(grader.paperApprox)*cv.arcLength(c,true),true);
					if(approx.rows==4 &&  cv.contourArea(c,false)>1400 ){
						let approxV = new cv.MatVector();
						approxV.push_back(approx);
						//cv.drawContours(dst, approxV, -1, color, 1, cv.LINE_8);
						
						//imgs = four_point_transform(gray,approx);
						// detect paper
						
						let t = [
							[ approx.data32S[0],approx.data32S[1] ],
							[ approx.data32S[2],approx.data32S[3] ],
							[ approx.data32S[4],approx.data32S[5] ],
							[ approx.data32S[6],approx.data32S[7] ],
						];
						t = t.sort(function(a,b){
							return a[0]-b[0];
						});
										
						let leftMost = [t[0],t[1]];
						leftMost.sort(grader.compareByY);
						
						let rightMost = [t[2],t[3]];
						rightMost.sort(grader.compareByY);
						
						let topWidth = Math.round(Math.sqrt(Math.pow(rightMost[0][1]-leftMost[0][1],2)+Math.pow(rightMost[0][0]-leftMost[0][0],2)));	
						let bottomWidth = Math.round(Math.sqrt(Math.pow(rightMost[1][1]-leftMost[1][1],2)+Math.pow(rightMost[1][0]-leftMost[1][0],2)));	
						let maxWidth = (topWidth>bottomWidth)?topWidth:bottomWidth;
						
						let leftHeight = Math.round(Math.sqrt(Math.pow(rightMost[0][1]-rightMost[1][1],2)+Math.pow(rightMost[0][0]-rightMost[1][0],2)));	
						let rightHeight =Math.round(Math.sqrt(Math.pow(leftMost[0][1]-leftMost[1][1],2)+Math.pow(leftMost[0][0]-leftMost[1][0],2)));	
						let maxHeight = (leftHeight>rightHeight)?leftHeight:rightHeight;
						let dimension =  cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, maxWidth-5, 0, 0, maxHeight-5, maxWidth-5, maxHeight-5]);
						let rect =  cv.matFromArray(4, 1, cv.CV_32FC2, [leftMost[0][0], leftMost[0][1], rightMost[0][0], rightMost[0][1], leftMost[1][0], leftMost[1][1], rightMost[1][0], rightMost[1][1]]);
						let M = cv.getPerspectiveTransform(rect, dimension);
						
						let dsize = new cv.Size(maxWidth,maxHeight);//check 
						
						cv.warpPerspective(gray, gray, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
						cv.warpPerspective(dst, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
						//delete
						M.delete();dimension.delete();rect.delete();
						
						//gray = imgs[0];
						//dst = imgs[1];
						approxV.delete();
						
						break;
					}
				}
				/* grading */
				let question = [];
				//detect choices
				cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
				cv.adaptiveThreshold(gray,gray,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C,cv.THRESH_BINARY_INV,updated(grader.choicesBolockSize),updated(grader.choicesConstant))
				cv.findContours(gray, cnts, hierarchy, cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE)
				for (let i=0; i< cnts.size();++i){
					c = cnts.get(i);
					let nwRect = cv.boundingRect(c);
					let ar = nwRect.width/parseFloat(nwRect.height);
					let area = cv.contourArea(c,false);
					//if(nwRect.width > 2 && nwRect.height >10 && ar>=0.2 && ar < 0.4 && area >200 && area < 1000){
					if(nwRect.width > 2 && nwRect.height >10 && ar >0.2 && ar < 0.4 && area >20 && area < 1000){
						cv.rectangle(dst,new cv.Point(nwRect.x,nwRect.y),new cv.Point(nwRect.x+nwRect.width,nwRect.y+nwRect.height),color, 1, cv.LINE_AA, 0);
						nwRect.height = nwRect.height / 3;
						nwRect.width -= 5;
						nwRect.x+=2;
						nwRect.y+=4;
						question.push(nwRect);//check if cnt or nwrect is better
					}
				}
				
				if (question.length == 75){
					
					grader.detected();
					
					//sort question
					//left to right
					question.sort(function(a,b){
						return a.x-b.x;
					});
					//answer
					ans = [4,1,3,0,2,2,0,1,1,3,3,4,3,0,1];
					var correctCount = 0;
					for(var j=0;j<question.length;j+=5){
						var q = question.slice(j,j+5);
						q.sort(grader.compareByCordY);
						let max = cv.countNonZero(gray.roi(q[0]));
						let index =0;
						for(var a=1;a<q.length;a++){
							var currentQ =cv.countNonZero(gray.roi(q[a]));
							if(currentQ>max){
								max =currentQ;
								index = a;
							}
						}
	
						if((ans[j/5])==index){
							cv.rectangle(dst,new cv.Point(q[index].x,q[index].y),new cv.Point(q[index].x+q[index].width,q[index].y+q[index].height),new cv.Scalar(0,255,0,255), 1, cv.LINE_AA, 0);
							correctCount++;
						}else{
							cv.rectangle(dst,new cv.Point(q[index].x,q[index].y),new cv.Point(q[index].x+q[index].width,q[index].y+q[index].height),new cv.Scalar(255,0,0,255), 1, cv.LINE_AA, 0);
						}
						
					}
					console.log(correctCount);
				}
				cv.imshow('grayCanv', gray);
				cv.imshow('imgCanv', dst);
				// schedule the next one.
				let delay = 1000 / grader.FPS - (Date.now() - begin);
				setTimeout(processVideo, delay);
			}
			catch(err){
				grader.handleError(err);
			};
			
		}
		processVideo();
	},
	handleError:function(err){
		document.getElementById("error").text = "there was an error "+err;
		console.log(err,"there was an error")
	 },
	detected:function(){
		const sound  = new Audio("data:audio/mp3;base64,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");
		sound.play();
		//take a break;
		
		this.streaming = false;
		setTimeout(function(){
			grader.streaming = true;
			grader.opencvReady();	
		},this.BREAK_TIME)
	},
	
	isLoading:function(isloading){
		if(isloading)
			this.loading.display = "block";
		else
			this.loading.display = "none";
	},
	compareByY:function(a,b){
	   return a[1]-b[1];
	},
	compareByCordY:function(a,b){
		return b.y-a.y;
	},
	log:console.log	
 }
 
/* prepare everything */
grader.start();