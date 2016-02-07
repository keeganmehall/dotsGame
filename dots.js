window.onload = function(){
var forwardButton = document.getElementById('forwardButton');
var resetButton = document.getElementById('reset');
var undoButton = document.getElementById('undo');
var svg = document.getElementById('svg');
//var outerSVG = document.getElementById('outerSVG');
//var timer = document.getElementById('timer');
var defaultNumInput = document.getElementById('defaultNumInput');
var lengthBar = document.getElementById('lengthBar');
var bestBar = document.getElementById('bestBar');
var backButton = document.getElementById('backButton');
var shareURL = document.getElementById('URL');
var popupDiv = document.getElementById('popupDiv');
var message = document.getElementById('message');
var defaultNumber = 12;
var number = defaultNumber;
var pathLength = 0;
var i = 0;
var listOfLines;
var listOfPoints;
var best;
var perfectLength;
var pointCoordinates = [];
var listOfBoards = [];
var boardIndex = -1;
var bestPath = [];
var lengthTable;
var circleSize = 10;
var lineWidth = 2;
var mobile = false;
var scale = 1;
var startTime;

if(/mobi|android|touch|mini/i.test(navigator.userAgent.toLowerCase())){
	mobile = true;
	document.body.style.content = "width=device-width, initial-scale=1, user-scalable=0";
	document.body.style.overflow = 'hidden';
	circleSize = 15;
	lineWidth = 3;
}

var setScale = function(){
	scale = Math.min(window.innerHeight/480 , window.innerWidth/480);
	document.body.style.transform = 'scale(' + scale + ')';
	document.body.style.webkittransform = 'scale(' + scale + ')';
	document.body.style.transformOrigin = '0 0';
	document.body.style.webkitTransformOrigin = '0 0';
}
if(mobile){
	window.addEventListener("resize", setScale)
}
var circleClickHandler = function(){
	circleEventHandler(this.id);
}    
//this function describes what should happen when the user clicks on a circle
var circleEventHandler = function(index){
    //get clicked circle position 
    //(the event handler is attached to the circle element so 'this' references the circle element)

  if(listOfPoints[index].state === 'unconnected'){
      pointDescriptor = listOfPoints[index]
    var x = pointDescriptor.x
    var y = pointDescriptor.y



      //fill the circle gray
    if(listOfPoints[index].type !== 'end'){
    	listOfPoints[index].svgElement.setAttribute('fill','#bbbbbb');
    }

      //draw line from previous point to currently clicked point
    var lineSVG = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var prevIndex = listOfLines.length-1;

      var line = {
          svgElement:lineSVG, 
          x2:x,
          y2:y,
          p2:pointDescriptor,
          x1:listOfLines[prevIndex].x2,
          y1:listOfLines[prevIndex].y2,
          p1:listOfLines[prevIndex].p2
      };

      listOfLines.push(line)
    lineSVG.setAttribute("style","stroke:rgb(0,0,0);stroke-width:" + lineWidth)
      lineSVG.setAttribute('x1',line.x1)
      lineSVG.setAttribute('y1',line.y1)
      lineSVG.setAttribute('x2',line.x2)
      lineSVG.setAttribute('y2',line.y2)
    svg.insertBefore(lineSVG, listOfPoints[0].svgElement);
    listOfPoints[index].state = 'connected';
    if (listOfLines.length === number - 1){
    	listOfPoints[1].state = 'unconnected'
  	}
    
    calcPathLength()
    if (listOfPoints[index].type === 'end'){
    	var time = (new Date()-startTime)/1000;
		var percentShorter = (100*(pathLength-perfectLength)/pathLength);
		if(pathLength-perfectLength<0.01){
			var animationTime = 300;
			storeBest();
			bestBar.setAttribute('y', 424-barHeight());
			bestBar.setAttribute('height', barHeight());
			bestBar.setAttribute('fill','green');          
			lengthBar.transiton = 'fill ' + animationTime/1000+'s';
			lengthBar.setAttribute('fill','green');
			var largeLineWidth = lineWidth*1.5;
			var largeCircleSize = circleSize*1.2;
			var changeLine = function(line){
				line.svgElement.setAttribute("style","stroke:green;stroke-width:" + largeLineWidth);
			}
			var changePoint = function(line){
				line.p2.svgElement.setAttribute('fill','green');
				line.p2.svgElement.setAttribute('r',largeCircleSize);
			}
			listOfLines.forEach(function(line, index){
				setTimeout(changePoint, (number-index)*animationTime/number, line);
				setTimeout(changeLine, (number-index+0.2)*animationTime/number, line);
			});
			
			var newMessage = 'Congratulations, you found the best path in ' + Math.round(time) + ' second'
			if(Math.round(time)!==1){newMessage+='s'}
			newMessage += ". To share this board, send this page's URL.";
			message.textContent = newMessage;
			setTimeout(function(){
				//shareURL.textContent = window.location;
				showPopupDiv();
			}, animationTime/2);

			/*listOfPoints.forEach(function(point){
			point.svgElement.setAttribute('fill','green');
			point.svgElement.setAttribute('r',largeCircleSize);
			});*/
		}else if(best && !isNaN(best) && pathLength - best > 0.01){
			message.textContent = 'You finished, but you have done better. The perfect path is ' + percentShorter.toPrecision(2) +'% shorter';
			//shareURL.textContent = window.location;
			showPopupDiv();
		}else if(best && !isNaN(best) && Math.abs(pathLength-best) < 0.01){
			message.textContent = 'This is the same as your last best path. The perfect path is ' + percentShorter.toPrecision(2) +'% shorter';
			//shareURL.textContent = window.location;
			showPopupDiv();
		}else if(pathLength < best || isNaN(best) || !best){
			storeBest();
			bestBar.setAttribute('y', 424-barHeight());
			bestBar.setAttribute('height', barHeight());
			message.textContent = 'This is your shortest path yet, but the perfect one is ' + percentShorter.toPrecision(2) +'% shorter';
			//shareURL.textContent = window.location;
			showPopupDiv();
      	}
		
      
    }
  }
  updateLengthBars();
}

var svgElementFilters = function(){
	var lengthBarsBackground = document.getElementById('lengthBarsBackground');
	lengthBarsBackground.style.filter='opacity(0.99%)';
	lengthBarsBackground.setAttribute('style', '-webkit-filter:opacity(0.99%)');
	console.log(lengthBarsBackground.style);
}

var showPopupDiv = function(){
	setTimeout(function(){svg.style.animationPlayState = 'paused'},1000);
	svg.style.animationPlayState = 'running';
	svg.style.animationDirection = 'reverse';
	svg.style.animationFillMode = 'both';
	svg.style.animationName = 'blur';
	svg.style.animationDuration = '0.4s';
	svg.blurred = true;
	//if(svg.style.filter !== 'blur(1.5px) opacity(50%)' && svg.style.webkitFilter !== 'blur(1.5px) opacity(50%)'){
	//	popupDiv.style.backgroundColor = 'rgba(255,255,255,0.8)';
	//}
	popupDiv.style.display = 'block';
	setTimeout(function(){popupDiv.style.opacity = 1},5);
}
var hidePopupDiv = function(){
	svg.style.animationPlayState = 'paused';
	svg.style.animation = '';
	svg.style.filter = 'none';
	svg.style.webkitFilter = 'none';
	svg.style.opacity = '1';
	popupDiv.style.backgroundColor = 'rgba(255,255,255,0)';
	popupDiv.style.opacity = 0;
	setTimeout(function(){popupDiv.style.display = 'none'}, 400);
	svg.blurred = false;
}

var oldCoordinates;
var timeOfLastTouchMove;
var touchHandler = function(evt){
	evt.preventDefault();
	//console.log(pointCoordinates[0].x,pointCoordinates[0].y);
	//console.log("touch", (evt.touches[0].pageX-svg.getBoundingClientRect().left)/scale, (evt.touches[0].pageY-svg.getBoundingClientRect().top)/scale);
	var x = (evt.touches[0].pageX-svg.getBoundingClientRect().left)/scale;
	var y = (evt.touches[0].pageY-svg.getBoundingClientRect().top)/scale;
	if(0<x && x<430 && 0<y && y<430){
		var closestIndex;
		var closestLength = Infinity;
		var distance = function(idx){
			return Math.pow(x-pointCoordinates[idx].x,2) + Math.pow(y-pointCoordinates[idx].y,2);
		}
		for(var i=0; i<number; i++){
			var dist = distance(i);
			//console.log(dist, closestLength, i)
			if(dist < closestLength && dist < 2500 && listOfPoints[i].state === 'unconnected'){
				closestLength = dist;
				closestIndex = i;
			}
		}
		//console.log(closestIndex);
		if(closestIndex){
			circleEventHandler(closestIndex);
		}
		var currentTime = new Date();
		
		var speedSquared = (Math.pow(x-oldCoordinates[0],2)+Math.pow(y-oldCoordinates[1],2))/(Math.pow(currentTime - timeOfLastTouchMove, 2));
		
		timeOfLastTouchMove = currentTime;
		oldCoordinates = [x,y];
	}
}

boardDiv.addEventListener("touchstart" , touchHandler, true);
boardDiv.addEventListener("touchmove" , touchHandler, true);

var storeBest = function (){
  best = calcPathLength()
  bestLengthString = Math.round(best).toString()
}

var calcPathLength = function(){
  pathLength = 0;
  listOfLines.forEach(function(line){
    pathLength += Math.sqrt(Math.pow(line.p2.x-line.p1.x,2)+Math.pow(line.p2.y-line.p1.y,2))
  })
  pathLengthString = Math.round(pathLength).toString()
  return pathLength
}

resetButton.addEventListener('click',function(){
    hidePopupDiv();
    lengthBar.setAttribute('fill', 'blue');
    listOfLines.forEach(function(line){
        svg.removeChild(line.svgElement)
    })
	colorPoints()
    pathLength = 0
    pathLengthString = pathLength.toString()
  listOfPoints.forEach(function(circle){
    circle.svgElement.setAttribute('r',circleSize);
    if(circle.type === 'start'){
      circle.state = 'start'
    } else if(circle.type === 'end'){
      circle.state = 'end'
    } else{
      circle.state = 'unconnected';
    }
  })
  updateLengthBars();
})

var length = function(line){
	var lineLength = Math.sqrt(Math.pow(line.x2-line.x1,2)+Math.pow(line.y2-line.y1,2)) 
    return lineLength
}

undoButton.addEventListener('click',function(){
    hidePopupDiv();
    lengthBar.setAttribute('fill', 'blue');
    if (listOfLines.length > 1){
        var lineDescriptor = listOfLines[listOfLines.length-1]
        svg.removeChild(lineDescriptor.svgElement);
        lineDescriptor.p2.svgElement.setAttribute('r',circleSize);
		if (lineDescriptor.p2.type === 'end'){
		    lineDescriptor.p2.svgElement.setAttribute('fill','red');
		    lineDescriptor.p2.state = 'unconnected';
		} else{
		    lineDescriptor.p2.svgElement.setAttribute('fill','black');
		    lineDescriptor.p2.state = 'unconnected';
		    listOfPoints[1].state = 'end'
		}
		if(listOfLines.length === 2){
			listOfPoints[0].svgElement.setAttribute('r',circleSize);
    		listOfPoints[0].svgElement.setAttribute('fill','#00ff00');
		}
        listOfLines.pop();
        calcPathLength();
        updateLengthBars();
    }
})    

var colorPoints = function(){
    //set points to the correct color
    listOfPoints.forEach(function(circle, i){
        //color first circle green
        if (i==0){
            circle.svgElement.setAttribute('fill','#00ff00')
            var lineSVG = document.createElementNS("http://www.w3.org/2000/svg", "line");
            svg.appendChild(lineSVG)
            pointDescriptor = listOfPoints[0]
            listOfLines = [
                {
                    svgElement: lineSVG,
                    x2:listOfPoints[0].x,
                    y2:listOfPoints[0].y,
                  	p2:pointDescriptor,
                  	p1:pointDescriptor
                }
            ];
        } else if (i==1){
            circle.svgElement.setAttribute('fill','red')
        } else {
            circle.svgElement.setAttribute('fill','black')
        }
    })
}
  
var genCoordinates = function(){
  pointCoordinates = []
  i = 0
  while(i < number){
    var xcoord;
    var ycoord;
    var genPoint = function(){
    	xcoord = Math.floor((Math.random() * 390) + 20);
    	ycoord = Math.floor((Math.random() * 390) + 20);        
    	if (pointCoordinates !== []){
        pointCoordinates.forEach(function(point){
          if (Math.pow(xcoord - point.x,2) + Math.pow(ycoord - point.y,2) < 2500){
            genPoint();
          }
        })
      }
    }
    genPoint();
    var point = {x:xcoord, y:ycoord};
    pointCoordinates.push(point);
    i++;
  }
  
  listOfBoards.push(pointCoordinates);
  //console.log(listOfBoards)
  boardIndex++;
}
                          
var calculatePoints = function(){
  hidePopupDiv();
  //remove all points
  location.hash = '#' + storePoints();
  listOfPoints = [];
    while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
	}
    i = 0
    //add new points
    while (i<number){
  			var randomx = pointCoordinates[i].x;
        var randomy = pointCoordinates[i].y;
  
        //create single dot
        var circleSVG = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        var svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        if (i === 0){
        	var pointType =	'start';
          var pointState = 'start';
        } else if (i === 1){
        	var pointType =	'end';
          var pointState = 'end';
        } else{
            var pointType = 'normal';
          	var pointState = 'unconnected';
        }
            
        var circle = {svgOverlay:svgOverlay, svgElement:circleSVG, x:randomx, y:randomy, type:pointType, state:pointState}
        listOfPoints.push(circle)
        circleSVG.setAttribute('cx',randomx)//set circle x position
        circleSVG.setAttribute('cy',randomy)//set circle y position
        circleSVG.setAttribute('r',circleSize)      //set circle radius
        circleSVG.id = i;
        svgOverlay.setAttribute('cx',randomx)//set circle x position
        svgOverlay.setAttribute('cy',randomy)//set circle y position
        svgOverlay.setAttribute('r', '25');      //set circle radius
        svgOverlay.setAttribute('opacity', '0');
        svgOverlay.id = i;
        
        //add circle to svg image which is the svg tag in the html box
        svg.appendChild(circleSVG);
        svg.appendChild(svgOverlay);
        
        
        //make it so that the functon circleClickHandler rund when a circle is clicked
        svgOverlay.addEventListener('click',circleClickHandler);
        circleSVG.addEventListener('click',circleClickHandler);
        i++
    }
    i=0
    colorPoints()
    pathLength = 0;
    
    pathLengthString = Math.round(pathLength).toString();
  calcBestPath();
  updateLengthBars();
  bestBar.setAttribute('height', '0')
  bestBar.setAttribute("y","2");
  bestBar.setAttribute('fill','#adadff');
  lengthBar.setAttribute('fill','blue');
	
	
	if(number < 14){console.log(difficulty(perfectLength*1.1), 'paths within 10%')};	
	console.log('total angle:', pathAngles(), 'radians');
	console.log('perfectLength', perfectLength);
	startTime = new Date();
	
}

var calculateHandler = function(){
  var newDefaultNumber = parseInt(defaultNumInput.value,10);
  if(newDefaultNumber > 18){
  	defaultNumber = 18;
  }else if(2 < newDefaultNumber){
  	defaultNumber = newDefaultNumber;
  }else if(3 > newDefaultNumber){
  	defaultNumber = 3;
  }
  defaultNumInput.value = defaultNumber;
  number = defaultNumber;
  genCoordinates();
  calculatePoints();
  best = ''
}

defaultNumInput.addEventListener('keypress', function(event){
	if(event.keyCode === 13){calculateHandler()}
})

/*
var retrieveHandler = function(){
  if(retrieve(codeInput.value.toString()) === true){
    calculatePoints();
    best = ''
    console.log(codeInput.value,'code');
   }
}
retrieveButton.addEventListener('click', retrieveHandler);

codeInput.addEventListener('keypress', function(event){
	if(event.keyCode === 13){
  	console.log('retrieve handler');
    retrieveHandler();
  };
})
*/

var numToBase64 = function(number){
	var string = '';
	var numToChar = function(number){
		if(number > 64 || number < 0){
			console.log('error');
			return;
		}
		if(number < 10){
			return(String.fromCharCode(number + 48))
		}
		if(number < 36){
			return(String.fromCharCode(number + 55))
		}
		if(number < 62){
			return(String.fromCharCode(number + 61))
		}
		if(number < 63){
			return('-')
		}
		if(number < 64){
			return '~';
		}
		if(number === 64){
			return '10';
		}
	}
	
	
	var i = 1;
	if(number === 0){
			string += '0';
		}
	while(number > 0){
		var mod = number % Math.pow(64,i);
		string = numToChar(mod/Math.pow(64,i-1)) + string;
		number -= mod;
		i++;
	}
	return string;
}

var base64ToNum = function(string){
	var charToNum = function(char){
		var code = char.charCodeAt(0)
		if(code > 47 && code < 58){
			return code - 48;
		}
		if(code > 64 && code < 91){
			return code - 55;
		} 
		if(code > 96 && code < 123){
			return code - 61;
		}
		if(char === '-'){
			return 62
		}
		if(char === '~'){
			return 63
		}else{
			console.log('invalid code');
		}
	}
	var number = 0;
	var length = string.length;
	for(var i = 0; i < length; i++)
		number += charToNum(string[i])*Math.pow(64, length-i-1);
		i++;
	return number;
}

var pointToNum = function(point){
	return point.x + point.y*512;
}

var numToPoint = function(num){
	var mod = num % 512;
 	var point = {
		x:mod,
		y:(num - mod)/512
	}
	return point;
}

var storePoints = function(){
  var checksum = 0
  var store = ""
  pointCoordinates.forEach(function(circle){
    var num = pointToNum(circle);
    checksum += num
    store += numToBase64(num);
  })
  var checksumString = numToBase64(checksum);
  while(checksumString.length < 4){
  	checksumString = '0' + checksumString;
  }
  store += checksumString;

  return(store)
}

var retrieve = function(string){
  i = 0;
  var newPointCoordinates = [];
	string = string.replace(/[^a-zA-Z0-9~-]/g,'');
  if(string.length>52){
  	string = string.slice(0,52);
  }
  if(string.length > 12){
    var oldNumber = number;
    number = Math.floor((string.length-4)/3);
    var checksum = 0
    while(i < number*3){
      var subString = string.slice(i,i+3);
      var num = base64ToNum(subString);
      checksum += num;
      newPointCoordinates.push(numToPoint(num));
      i+=3
  	}
  	if(checksum === base64ToNum(string.slice(string.length-4))){
  		pointCoordinates = newPointCoordinates;
  	}else{
  		number = oldNumber;
  		console.log('invalid checksum', checksum, '!==', base64ToNum(string.slice(string.length-4)))
  		return false
  	}
  	
  	if(listOfBoards[boardIndex-1] !== pointCoordinates && pointCoordinates === newPointCoordinates){
  		listOfBoards.push(pointCoordinates);
  		boardIndex +=1;
  	}
  	return true;	
  }else{
  	return false;
  }
}


var calcBestPath = function(){
  var calcLengths = function(){
    var lengthTable = []
    var lineLength = function(p1,p2) {
      return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2))
    };
    listOfPoints.forEach(function(outerPoint,columnIndex){
      var column = []
      listOfPoints.forEach(function(innerPoint,rowIndex){
        var length = lineLength(outerPoint,innerPoint)
        column.push(length);
      })
      lengthTable.push(column);
    })
    return lengthTable  
  }
	var lengthTable = calcLengths();
  var startIndex = 0;
  var endIndex = 1;
  var middlePoints = (1<<(number-2))-1;
  var memo = new Float32Array((1<<(number-2)) * number).fill(-1);
  var pathList = new Uint32Array((1<<(number-2)) * number*2).fill(-1);
  var optimalLength = function(startIndex,endIndex,middlePoints){
  	//functionCounter++;
    if(middlePoints === 0){
    	return{length:lengthTable[startIndex][endIndex], path0:0, path1:0};
    }else{
    	var memoIdx = middlePoints*number + startIndex;
      if (memo[memoIdx] > 0) {
      	return{length:memo[memoIdx], path0:pathList[memoIdx*2], path1:pathList[memoIdx*2+1]};
      }
    
    	var bestLength = Infinity
    	var path0;
    	var path1;
    	var nextStart;
    	var pointsLeft = -1;
      for(var pointIndex=2; pointIndex<number; pointIndex++){
      	if((middlePoints &  (1 << (pointIndex-2))) !== 0){
          pointsLeft++;
          var lengthToHere = lengthTable[startIndex][pointIndex];
          var nextMiddlePoints = middlePoints & ~(1<<(pointIndex-2));
          var returnedObject = optimalLength(pointIndex,endIndex,nextMiddlePoints);
          var length = lengthToHere + returnedObject.length;
          if(length<bestLength){
            bestLength = length;
            path0 = returnedObject.path0;
            path1 = returnedObject.path1;
            nextStart = pointIndex-2;
          }
         }
      }
      if(pointsLeft < 8){
		path0 += (nextStart << (pointsLeft*4));
      }else{
      	path1 += (nextStart << ((pointsLeft-8)*4));
      }
      
           
      memo[memoIdx] = bestLength;
      pathList[memoIdx*2] = path0;
      pathList[memoIdx*2+1] = path1;      
      
      return{length:bestLength, path0:path0, path1:path1};
    }
  }
	//var functionCounter = 0;
  var startTime = +new Date();
  var returnedObject = optimalLength(startIndex,endIndex,middlePoints,Infinity);
  var endTime = +new Date();
	//timer.textContent = (endTime-startTime)/1000;
  perfectLength = returnedObject.length;
  

  bestPath = [0]
	if(number>10){  
	  for(var k = number-11; k>-1; k--){
	  	bestPath.push(((returnedObject.path1 >> (k*4)) & 15)+2);
	  }
	  for(var k = 7; k > -1; k--){
	  	bestPath.push(((returnedObject.path0 >> (k*4)) & 15)+2);
	  }
	}else{
		for(var k = number-3; k > -1; k--){
			bestPath.push(((returnedObject.path0 >> (k*4)) & 15)+2);
		}
	}
  bestPath.push(1);
  
  console.log(('Calculated in ', endTime-startTime)/1000, ' seconds');
  //console.log('optimalLength ran', functionCounter, 'times');
  //console.log((endTime-startTime)/(1000*functionCounter),'s per run');
  return perfectLength;
}

var barHeight = function(){
	var height = 6+(pathLength*412/(1.5*perfectLength));
  if (height > 418){
  	return 418;
  }else{return height}
}
var updateLengthBars = function(){
  lengthBar.setAttribute('y',424-barHeight());
  lengthBar.setAttribute('height', barHeight());
}

window.addEventListener('hashchange', function(){
	if(window.location.hash.replace('#','') !== storePoints()){
		if(retrieve(window.location.hash.replace('#','')) === true || pointCoordinates.length > 2){
			calculatePoints();
		}else{
			genCoordinates();
			calculatePoints();
		}
	}
})

forwardButton.addEventListener('click', function(){
	if(listOfBoards[boardIndex+1]){
		boardIndex += 1;
		pointCoordinates = listOfBoards[boardIndex];
		number = pointCoordinates.length;
		calculatePoints();
	}else{
		calculateHandler();
	}
});

backButton.addEventListener('click',function(){
	if(listOfBoards[boardIndex-1]){
		boardIndex -= 1;
		pointCoordinates = listOfBoards[boardIndex];
		number = pointCoordinates.length;
		calculatePoints();
	}
})


var pathAngles = function(){
	var angle = function(pointIdx){
		var P1 = bestPath[pointIdx-1];
		var P2 = bestPath[pointIdx];
		var P3 = bestPath[pointIdx+1];
		return Math.acos((Math.pow(lengthTable[P1][P2] , 2) + Math.pow(lengthTable[P2][P3] , 2) - Math.pow(lengthTable[P3][P1] , 2)) / (2 * lengthTable[P1][P2] * lengthTable[P2][P3]));
	}
	var angleSum = 0
	for(var i=1; i < number-1; i++){
		angleSum += Math.PI - angle(i);
	}
	return angleSum;
}


var difficulty = function(threshold){

	
	
	var calcLengths = function(){
		var lengthTable = []
		var lineLength = function(p1,p2) {
		  return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2))
		};
		listOfPoints.forEach(function(outerPoint,columnIndex){
		  var column = []
		  listOfPoints.forEach(function(innerPoint,rowIndex){
		    var length = lineLength(outerPoint,innerPoint)
		    column.push(length);
		  })
		  lengthTable.push(column);
		})
		return lengthTable  
	}
	lengthTable = calcLengths();
	
	
	
	var middlePoints = (1<<(number-2))-1;
	var startIndex = 0;
	var endIndex = 1;
	var paths = 0;
	var recursive = function(startIndex,middlePoints,length){
		functionCounter++;
		if(length > threshold){
			return;
		}
		if(middlePoints === 0){
			//console.log('end reached');
			baseCaseCounter++
			if(length + lengthTable[startIndex][1] < threshold){
				paths++;
			}
		}else{
			var pointIndex;
			for(pointIndex=2; pointIndex<number; pointIndex++){
				if((middlePoints & (1<<(pointIndex-2))) !== 0){
					var nextMiddlePoints = middlePoints & ~(1<<(pointIndex-2));
					var nextLength = length + lengthTable[startIndex][pointIndex];
					recursive(pointIndex,nextMiddlePoints,nextLength);
				}
			}
		}
	}
	var startTime = +new Date()
	recursive(startIndex,middlePoints,0);
	console.log((+new Date())-startTime);
	return paths;
}


if(mobile){setScale()}

defaultNumInput.value = defaultNumber.toString();

if(retrieve(window.location.hash.replace('#','')) === false){
	genCoordinates();
}




window.location.hash = '#' + storePoints();

var functionCounter = 0;
var baseCaseCounter = 0;
calculatePoints();


}

