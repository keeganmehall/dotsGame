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
var popupDivContent = document.getElementById('popupDiv-content');
var controls = document.getElementById('controls');
var defaultNumber = 12;
var number = defaultNumber;
var pathLength = 0;
var i = 0;
var listOfLines = [];
var listOfPoints = [];
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
var cssTransforms = true;
var popupVisible = false;

if(/mobi|android|touch|mini/i.test(navigator.userAgent.toLowerCase())){
	mobile = true;
	document.body.style.content = "width=device-width, initial-scale=1, user-scalable=0";
	document.body.style.overflow = 'hidden';
	circleSize = 15;
	lineWidth = 3;
}

if(/Edge|Trident/i.test(navigator.userAgent)){
	cssTransforms = false;
}

var setScale = function(){
	scale = Math.min(window.innerHeight/535 , window.innerWidth/480);
	document.body.style.transform = 'scale(' + scale + ')';
	document.body.style.webkittransform = 'scale(' + scale + ')';
	document.body.style.transformOrigin = '0 0';
	document.body.style.webkitTransformOrigin = '0 0';
}
if(mobile){
	window.addEventListener("resize", setScale)
}

//controls behavior when a circle is clicked or when a touch event is closest to the circle
var circleEventHandler = function(index){
	if(popupVisible){
		hidePopupDiv();
		return;
	}

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
    	var time = (new Date() - pointCoordinates[0].startTime)/1000;
		var percentShorter = (100*(pathLength-perfectLength)/pathLength);
		if(pathLength-perfectLength<0.01){
			var animationTime = 300;
			storeBest();
			bestBar.setAttribute('y', 424-barHeight(pathLength));
			bestBar.setAttribute('height', barHeight(pathLength));
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
			
			var newMessage = '<h2>Congratulations</h2> <p>You found the best path in ' + Math.round(time) + ' second'
			if(Math.round(time)!==1){
				newMessage+='s'
			}
			newMessage += '.</p>';
			
			if(!(localStorage.dots_shownCongratulationsMessage === 'true')){
				localStorage.dots_shownCongratulationsMessage = true;
				newMessage += "<p>Use the right arrow to calculate a new board, or use the left arrow to return to a previous board.</p>"
			}
			
			newMessage += "<p>To share this board, send this page's URL.</p>";
			setTimeout(function(){
				//shareURL.textContent = window.location;
				showPopupDiv(newMessage);
			}, animationTime/2);

			/*listOfPoints.forEach(function(point){
			point.svgElement.setAttribute('fill','green');
			point.svgElement.setAttribute('r',largeCircleSize);
			});*/
		}else if(pointCoordinates[0].best && !isNaN(pointCoordinates[0].best) && pathLength - pointCoordinates[0].best > 0.01){
			var newMessage = "<h2>You've done better</h2> <p>You finished, but you have done better. The perfect path is " + percentShorter.toPrecision(2) +"% shorter.</p>";
			showPopupDiv(newMessage);
		}else if(pointCoordinates[0].best && !isNaN(pointCoordinates[0].best) && Math.abs(pathLength-pointCoordinates[0].best) < 0.01){
			var newMessage = "<h2>You've tried this path before.</h2> <p>The perfect path is " + percentShorter.toPrecision(2) +"% shorter.</p>";
			//shareURL.textContent = window.location;
			showPopupDiv(newMessage);
		}else if(pathLength < pointCoordinates[0].best || isNaN(pointCoordinates[0].best) || !pointCoordinates[0].best){
			storeBest();
			bestBar.setAttribute('y', 424-barHeight(pathLength));
			bestBar.setAttribute('height', barHeight(pathLength));
			var newMessage = '<h2>New Best Path</h2> <p>The perfect one is ' + percentShorter.toPrecision(2) +'% shorter.</p>';
			
			if(!(localStorage.dots_shownFinishedMessage === 'true')){
				localStorage.dots_shownFinishedMessage = true;
				newMessage += "<p>Use the circular arrow to try again. Your current length will stay as a light blue bar. To go to a new board, use the right arrow. To return to this board later, use the left arrow or return to this page's URL.<p>"
			}
			
			//shareURL.textContent = window.location;
			showPopupDiv(newMessage);
      	}
		
      
    }
  }
  updateLengthBars();
  if(!(localStorage.dots_shownLengthIntro === 'true')){
  	showLengthIntro();
  }
}

var showPopupDiv = function(text, dismissButtons){
	popupVisible = true;	
	var buttons = '';
	if(dismissButtons === true){
		buttons = "<div><button type='button' id='continue'>Continue</button><button type='button' id='skip'>Skip Directions</button></div>"
	}
	popupDivContent.innerHTML = text + buttons;
	
	if(dismissButtons){
		var skip = function(){
			hidePopupDiv();
			localStorage.dots_shownGameIntro = true
			localStorage.dots_shownLengthIntro = true;
			localStorage.dots_shownCongratulationsMessage = true;
			localStorage.dots_shownFinishedMessage = true;
			
		}
		document.getElementById('continue').addEventListener('click', hidePopupDiv);
		document.getElementById('continue').addEventListener('touchstart', hidePopupDiv);
		document.getElementById('skip').addEventListener('click', skip);
		document.getElementById('skip').addEventListener('touchstart', skip);
		
	}
	
	setTimeout(function(){svg.style.animationPlayState = 'paused'},1000);
	svg.style.animationPlayState = 'running';
	svg.style.animationDirection = 'reverse';
	svg.style.animationFillMode = 'both';
	svg.style.animationName = 'blur';
	svg.style.animationDuration = '0.4s';
	
	//if(svg.style.filter !== 'blur(1.5px) opacity(50%)' && svg.style.webkitFilter !== 'blur(1.5px) opacity(50%)'){
	//	popupDiv.style.backgroundColor = 'rgba(255,255,255,0.8)';
	//}
	popupDiv.style.display = 'block';
	setTimeout(function(){popupDiv.style.opacity = 1},5);
	
	controls.addEventListener("mousedown", hidePopupDiv)
	controls.addEventListener("touchstart", hidePopupDiv);
	svg.blurred = true;
}
var hidePopupDiv = function(){
	popupVisible = false;
	svg.style.animationPlayState = 'paused';
	svg.style.animation = '';
	svg.style.filter = 'none';
	svg.style.webkitFilter = 'none';
	svg.style.opacity = '1';
	popupDiv.style.opacity = 0;
	popupDiv.style.display = 'none';
	svg.blurred = false;
	controls.removeEventListener("mousedown", hidePopupDiv);
	controls.removeEventListener("touchstart", hidePopupDiv);
}

document.getElementById('closebutton').addEventListener('click', hidePopupDiv);
document.getElementById('closebutton').addEventListener('touchstart', hidePopupDiv);

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
		
		//var speedSquared = (Math.pow(x-oldCoordinates[0],2)+Math.pow(y-oldCoordinates[1],2))/(Math.pow(currentTime - timeOfLastTouchMove, 2));
		
		timeOfLastTouchMove = currentTime;
		oldCoordinates = [x,y];
	}
}

boardDiv.addEventListener("touchstart" , touchHandler, true);
boardDiv.addEventListener("touchmove" , touchHandler, true);

var clickHandler = function(evt){
	evt.preventDefault();
	var x = (evt.clientX-svg.getBoundingClientRect().left)/scale;
	var y = (evt.clientY-svg.getBoundingClientRect().top)/scale;
	if(0<x && x<430 && 0<y && y<430){
		var closestIndex;
		var closestLength = Infinity;
		var distance = function(idx){
			return Math.pow(x-pointCoordinates[idx].x,2) + Math.pow(y-pointCoordinates[idx].y,2);
		}
		for(var i=0; i<number; i++){
			var dist = distance(i);
			if(dist < closestLength && dist < 2500 && listOfPoints[i].state === 'unconnected'){
				closestLength = dist;
				closestIndex = i;
			}
		}
		if(closestIndex){
			circleEventHandler(closestIndex);
		}
	}
}

var mouseMoveHandler = function(evt){
	if(evt.buttons){
		clickHandler(evt);
	}else{
		boardDiv.removeEventListener("mousemove" , mouseMoveHandler);
	}
}

boardDiv.addEventListener("mousedown" , function(evt){
	evt.preventDefault();
	clickHandler(evt);
	boardDiv.addEventListener("mousemove" , mouseMoveHandler);
});
boardDiv.addEventListener("mouseup" , function(evt){
	boardDiv.removeEventListener("mousemove" , mouseMoveHandler);
});
boardDiv.addEventListener("mouseleave", function(){
	boardDiv.removeEventListener("mousemove" , mouseMoveHandler);
})
boardDiv.addEventListener("mousemove", function(evt){
	evt.preventDefault();
})

var storeBest = function (){
  pointCoordinates[0].best = calcPathLength()
  bestLengthString = Math.round(pointCoordinates[0].best).toString()
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
  pointCoordinates[0].startTime = new Date();
  listOfBoards.push(pointCoordinates);
  //console.log(listOfBoards)
  boardIndex++;
}
                          
var calculatePoints = function(){
  lengthBar.style.transform = 'none';
  if(lengthBar.style.transform !== 'none'){cssTransforms = false}
  //remove all points
  listOfLines.forEach(function(line){
  	svg.removeChild(line.svgElement);
  })
  listOfLines = []
  location.hash = '#' + storePoints();
  //listOfPoints = [];
    /*while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
	}*/
    i = 0
    //add new points
    while(listOfPoints.length > number){
    	svg.removeChild(listOfPoints[listOfPoints.length-1].svgElement);
    	listOfPoints.pop();
    }
    
    while (i<number){
  			var randomx = pointCoordinates[i].x;
        var randomy = pointCoordinates[i].y;
  
        //create single dot

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
        
        if(listOfPoints[i]){
        	var circleSVG = listOfPoints[i].svgElement;
        }else{
		    var circleSVG = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		}
        var circle = {svgElement:circleSVG, x:randomx, y:randomy, type:pointType, state:pointState}
        if(!listOfPoints[i]){
        	listOfPoints.push(circle);
        }else{
        	listOfPoints[i] = circle;
        }
       	if(cssTransforms){
		    if(listOfPoints[i]){
		    	circleSVG.setAttribute('cx',20)//set circle x position
		    	circleSVG.setAttribute('cy',400)//set circle y position
		    }
		} else{
			circleSVG.setAttribute('cx',randomx)//set circle x position
		    circleSVG.setAttribute('cy',randomy)//set circle y position
		}
        circleSVG.setAttribute('r',circleSize)
        
        circleSVG.id = i;
        circleSVG.style.transition = 'transform 0.3s, opacity 0.2s';
        circleSVG.style.transitionTimingFunction = 'cubic-bezier(0.42, 0, 0.58, 1.2)';
        
        svg.appendChild(circleSVG);
        
        i++
    }
	if(cssTransforms){
		setTimeout(function(){
			for(var i=0; i<number; i++){			
				listOfPoints[i].svgElement.style.transform = 'translate('+(pointCoordinates[i].x-20)+'px, '+(pointCoordinates[i].y-400)+'px)';
			}
		}, 10);
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
	
	
	//if(number < 14){
	//console.log(difficulty(perfectLength*1.1), 'paths within 10%')};	
	//console.log('total angle:', pathAngles(), 'radians');
	//console.log('perfectLength', perfectLength);
	
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
  pointCoordinates[0].best = ''
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
  		pointCoordinates[0].startTime = new Date();
  	}else{
  		number = oldNumber;
  		console.log('invalid checksum', checksum, '!==', base64ToNum(string.slice(string.length-4)))
  		return false
  	}
  	if(listOfBoards[boardIndex-1] !== pointCoordinates && pointCoordinates === newPointCoordinates){
  		listOfBoards.splice(boardIndex, 0, pointCoordinates);
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
  var memo = new Float32Array((1<<(number-2)) * number);
  var pathList = new Uint32Array((1<<(number-2)) * number*2);
  for(var i=0; i<(1<<(number-2)) * number; i++){
  	memo[i] = -1;
  	pathList[2*i] = -1;
  	pathList[2*i+1] = -1;
  }
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
  
  //console.log(('Calculated in ', endTime-startTime)/1000, ' seconds');
  //console.log('optimalLength ran', functionCounter, 'times');
  //console.log((endTime-startTime)/(1000*functionCounter),'s per run');
  return perfectLength;
}

var barHeight = function(length){
	var height = 6+(length*412/(1.5*perfectLength));
  if (height > 418){
  	return 418;
  }else{return height}
}
var updateLengthBars = function(){
  lengthBar.setAttribute('y',424-barHeight(pathLength));
  lengthBar.setAttribute('height', barHeight(pathLength));
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
		bestBar.setAttribute('height', barHeight(pointCoordinates[0].best));
		//console.log(pointCoordinates[0].best);
		bestBar.setAttribute('y', 424-barHeight(pointCoordinates[0].best));
		if(pointCoordinates[0].best - perfectLength < 0.01 && !isNaN(pointCoordinates[0].best)){
			bestBar.setAttribute('fill', 'green');
		}
	}else{
		calculateHandler();
		pointCoordinates[0].best = ''
	}
});

backButton.addEventListener('click',function(){
	if(listOfBoards[boardIndex-1]){
		boardIndex -= 1;
		pointCoordinates = listOfBoards[boardIndex];
		number = pointCoordinates.length;
		calculatePoints();
		//console.log(pointCoordinates[0].best);
		//console.log(barHeight(pointCoordinates[0].best));
		bestBar.setAttribute('height', barHeight(pointCoordinates[0].best));
		bestBar.setAttribute('y', 424-barHeight(pointCoordinates[0].best));
		if(pointCoordinates[0].best - perfectLength < 0.01 && !isNaN(pointCoordinates[0].best)){
			bestBar.setAttribute('fill', 'green');
		}
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
	//console.log((+new Date())-startTime);
	return paths;
}

var showGameIntro = function(){
	var introMessage = '<h2>Welcome</h2>'
	if(mobile){
		var description = 'Drag your finger over the dots to select your path.';
	} else{
		var description = 'Click the dots to select your path.';
	}
	introMessage += "Find the shortest path from the green dot to the red dot through all other dots. " + description;
	showPopupDiv(introMessage, true);
	localStorage.dots_shownGameIntro = true;
}

var showLengthIntro = function(){
	localStorage.dots_shownLengthIntro = true;
	showPopupDiv(
		"<h2>Welcome</h2> The blue bar on the right shows the current length relative to the shortest possible path. You can undo using the curved back arrow below, or restart using the the circular arrow."
	, true);
}

var resetDirections = function(){
	localStorage.dots_shownLengthIntro = false;
	localStorage.dots_shownCongratulationsMessage = false;
	localStorage.dots_shownFinishedMessage = false;
	showGameIntro();
}

document.getElementById('showDirections').addEventListener('click', resetDirections);

if(mobile){setScale()}

defaultNumInput.value = defaultNumber.toString();

if(retrieve(window.location.hash.replace('#','')) === false){
	genCoordinates();
}




window.location.hash = '#' + storePoints();

var functionCounter = 0;
var baseCaseCounter = 0;
calculatePoints();
if(!(localStorage.dots_shownGameIntro === 'true')){
	showGameIntro();
}


}

