window.onload = function(){
var forwardButton = document.getElementById('forwardButton');
var resetButton = document.getElementById('reset');
var undoButton = document.getElementById('undo');
var svg = document.getElementById('svg');
//var timer = document.getElementById('timer');
var defaultNumInput = document.getElementById('defaultNumInput');
var lengthBar = document.getElementById('lengthBar');
var bestBar = document.getElementById('bestBar');
var backButton = document.getElementById('backButton');
var defaultNumber = 5;
var number = defaultNumber;
var pathLength = 0;
var numPaths = 10;
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
    
//this function describes what should happen when the user clicks on a circle
var circleClickHandler = function(){
    //get clicked circle position 
    //(the event handler is attached to the circle element so 'this' references the circle element)
  var index = this.id;
  if (listOfPoints[index].type === 'end' && listOfLines.length === number - 1){
    listOfPoints[index].state = 'unconnected'
  }
  if(listOfPoints[index].state === 'unconnected'){
      pointDescriptor = listOfPoints[index]
    var x = pointDescriptor.x
    var y = pointDescriptor.y



      //fill the circle gray
    this.setAttribute('fill','#cccccc')

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
    lineSVG.setAttribute("style","stroke:rgb(0,0,0);stroke-width:2")
      lineSVG.setAttribute('x1',line.x1)
      lineSVG.setAttribute('y1',line.y1)
      lineSVG.setAttribute('x2',line.x2)
      lineSVG.setAttribute('y2',line.y2)
    svg.appendChild(lineSVG)
    listOfPoints[index].state = 'connected'
    
    calcPathLength()
    if (listOfPoints[index].type === 'end'){
      if (pathLength <= best || isNaN(best) || !best){
        storeBest();
        bestBar.setAttribute('y', 410-barHeight());
        bestBar.setAttribute('height', barHeight());
        console.log(pathLength,perfectLength);
        if(Math.abs(pathLength-perfectLength)<0.2){
        	console.log('error =', Math.abs(pathLength-perfectLength));
          bestBar.setAttribute('fill','green');          
          lengthBar.setAttribute('fill','green');
          listOfLines.forEach(function(line){
          	line.svgElement.setAttribute("style","stroke:green;stroke-width:3");
          });
          listOfPoints.forEach(function(point){
          	point.svgElement.setAttribute('fill','green');
          	point.svgElement.setAttribute('r','12');
          });
        }else{this.setAttribute('fill', 'red')}
      }
    }
  }
  updateLengthBars();
}

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
    listOfLines.forEach(function(line){
        svg.removeChild(line.svgElement)
    })
	colorPoints()
    pathLength = 0
    pathLengthString = pathLength.toString()
  listOfPoints.forEach(function(circle){
    circle.svgElement.setAttribute('r',10);
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
    if (listOfLines.length > 1){
        var lineDescriptor = listOfLines[listOfLines.length-1]
        svg.removeChild(lineDescriptor.svgElement);
        lineDescriptor.p2.svgElement.setAttribute('r','10');
		if (lineDescriptor.p2.type === 'end'){
		    lineDescriptor.p2.svgElement.setAttribute('fill','red')
		    lineDescriptor.p2.state = 'end'
		} else{
		    lineDescriptor.p2.svgElement.setAttribute('fill','black')
		    lineDescriptor.p2.state = 'unconnected'
		}
		if(listOfLines.length === 2){
			listOfPoints[0].svgElement.setAttribute('r','10');
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
    	xcoord = Math.floor((Math.random() * 390) + 15);
    	ycoord = Math.floor((Math.random() * 390) + 15);        
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
            
        var circle = {svgElement:circleSVG, x:randomx, y:randomy, type:pointType, state:pointState}
        listOfPoints.push(circle)
        circleSVG.setAttribute('cx',randomx)//set circle x position
        circleSVG.setAttribute('cy',randomy)//set circle y position
        circleSVG.setAttribute('r',10)      //set circle radius
        circleSVG.id = i;
        
        //add circle to svg image which is the svg tag in the html box
        svg.appendChild(circleSVG)
        
        //make it so that the functon circleClickHandler rund when a circle is clicked
        circleSVG.addEventListener('click',circleClickHandler)
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
	
	
	if(number < 14){console.log(difficulty(1.1*perfectLength), 'paths within 10%')};	
	console.log('total angle:', pathAngles(), 'radians');
	console.log('perfectLength', perfectLength);
	
}

var calculateHandler = function(){
  var newDefaultNumber = parseInt(defaultNumInput.value,10);
  if(newDefaultNumber > 21){
  	defaultNumber = 21;
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
  if(string.length > 13){
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
    	}
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
	var memo = new Float32Array((1<<(number-2)) * number * numPaths).fill(-1);
	var pathList = new Uint8Array((1<<(number-2)) * number * (number-2) * numPaths).fill(255);
	var optimalLength = function(startIndex,endIndex,middlePoints){
		//functionCounter++;
		var returnArray = [];
		var emptyPath = new Uint8Array(number - 2);
		if(middlePoints === 0){
			returnArray[0] = {length:lengthTable[startIndex][endIndex], path:emptyPath};
		  	for(i = 1; i<numPaths; i++){
		  		returnArray.push({length:Infinity, path:emptyPath});
		  	}
		  	//console.log(returnArray, returnArray[0]);
		  	return returnArray;
		}else{
			var memoIdx = (middlePoints*number + startIndex) * numPaths;
      
			if (memo[memoIdx] > 0) {
      	
				for(var i = 0; i < numPaths; i++){
		  			if(memo[memoIdx+i] > 0){
		  				returnArray[i] = {length:memo[memoIdx+i], path:pathList.slice((memoIdx+i)*(number-2), (memoIdx+i+1)*(number-2))};
		  			}else{
		  				returnArray[i] = {length:Infinity, path:emptyPath};	
		  			}
		  		}
      			return returnArray;
			}
    
			for(var i = 0; i < numPaths; i++){
		 		returnArray[i] = {length:Infinity, path:emptyPath};
		  	}
		  	
    		//console.log(returnArray);
    		var nextStart = [];
    		var pointsLeft = -1;
			for(var pointIndex=2; pointIndex<number; pointIndex++){
				if((middlePoints &  (1 << (pointIndex-2))) !== 0){
					pointsLeft++;
					var lengthToHere = lengthTable[startIndex][pointIndex];
					var nextMiddlePoints = middlePoints & ~(1<<(pointIndex-2));
					var result = optimalLength(pointIndex,endIndex,nextMiddlePoints);
					//console.log('result', result, result[0], result[1], result[2]);
					
					for(var i=0; i<numPaths; i++){
						for(var j=0; j<=i; j++){
							//console.log(i,j,result[j],returnArray[i]);
							if(result[j].length + lengthToHere < returnArray[i].length){
								returnArray[i].length = result[j].length + lengthToHere;
								nextStart[i] = pointIndex - 2;
								returnArray[i].path = result[j].path;
									
								//console.log(i, returnArray[i]);
								result[j].length = Infinity;
								break;
								
							}
						}
					}
					//console.log('return array after for loops', returnArray[0].length, returnArray[1], returnArray[2]);
					/*
					var length = lengthToHere + returnedObject.length;
						if(length<bestLength){
							bestLength = length;
							path0 = returnedObject.path0;
							path1 = returnedObject.path1;
							nextStart = pointIndex-2;
						}
					*/
				}
			}
			//console.log(returnArray); 
			for(var i=0; i<numPaths; i++){

				returnArray[i].path[pointsLeft] = nextStart[i];

			}
      
			for(var i = 0; i < numPaths; i++){ 
				memo[memoIdx+i] = returnArray[i].length;
				for(var m = 0; m < number-2; m++){
					pathList[(memoIdx+i)*(number-2) + m] = returnArray[i].path[m];
				}

			}     
			//console.log(returnArray);
			return returnArray;
		}
	}
	//var functionCounter = 0;
	var startTime = +new Date();
	var resultArray = optimalLength(startIndex,endIndex,middlePoints,Infinity);
	var endTime = +new Date();
	//timer.textContent = (endTime-startTime)/1000;
	console.log(resultArray, resultArray[0]);
	var returnedObject = resultArray[0];
	perfectLength = returnedObject.length;

	bestPath = [0]
	for(var k = number-3; k>-1; k--){
		bestPath.push(returnedObject.path[k]+2);
	}
	bestPath.push(1);
	console.log(bestPath);
  
	console.log(('Calculated in ', endTime-startTime)/1000, ' seconds');
	//console.log('optimalLength ran', functionCounter, 'times');
	//console.log((endTime-startTime)/(1000*functionCounter),'s per run');
	console.log('memo',memo);
	console.log('pathList',pathList);
	return perfectLength;
}

var barHeight = function(){
	var height = 10+pathLength*400/(1.5*perfectLength);
  if (height > 408){
  	return 408;
  }else{return height}
}
var updateLengthBars = function(){
  lengthBar.setAttribute('y',410-barHeight());
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



defaultNumInput.value = defaultNumber.toString();

if(retrieve(window.location.hash.replace('#','')) === false){
	genCoordinates();
}




window.location.hash = '#' + storePoints();

var functionCounter = 0;
var baseCaseCounter = 0;
calculatePoints();


}

