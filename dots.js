window.onload = function(){
var calculateButton = document.getElementById('calculate');
var resetButton = document.getElementById('reset');
var undoButton = document.getElementById('undo');
var svg = document.getElementById('svg');
//var timer = document.getElementById('timer');
var defaultNumInput = document.getElementById('defaultNumInput');
var lengthBar = document.getElementById('lengthBar');
var bestBar = document.getElementById('bestBar');
var defaultNumber = 12;
var number = defaultNumber;
var pathLength = 0;
var i = 0;
var listOfLines;
var listOfPoints;
var best;
var perfectLength;
var pointCoordinates = [];
    
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
      if (pathLength < best || isNaN(best) || !best){
        storeBest();
        bestBar.setAttribute('y', 410-barHeight());
        bestBar.setAttribute('height', barHeight())
        if(Math.abs(pathLength-perfectLength)<0.2){
        	console.log('error =', Math.abs(pathLength-perfectLength));
          bestBar.setAttribute('fill','green');          
          lengthBar.setAttribute('fill','green');
        }
      }
      this.setAttribute('fill', 'red');
      this.setAttribute('r',12)
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
    if(circle.type === 'start'){
      circle.state = 'start'
    } else if(circle.type === 'end'){
      circle.svgElement.setAttribute('r',10)
      circle.state = 'end';
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
        svg.removeChild(lineDescriptor.svgElement)
    if (lineDescriptor.p2.type === 'start'){
        lineDescriptor.p2.svgElement.setAttribute('fill','#00ff00')
        lineDescriptor.p2.state = 'start'
    } else if (lineDescriptor.p2.type === 'end'){
        lineDescriptor.p2.svgElement.setAttribute('fill','red')
        lineDescriptor.p2.state = 'end'
    } else{
        lineDescriptor.p2.svgElement.setAttribute('fill','black')
        lineDescriptor.p2.state = 'unconnected'
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
    	xcoord = Math.floor((Math.random() * 20) + 1)*20;
      ycoord = Math.floor((Math.random() * 20) + 1)*20;        
      if (pointCoordinates !== []){
        pointCoordinates.forEach(function(point){
          if (xcoord === point.x && ycoord === point.y){
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

calculateButton.addEventListener('click', calculateHandler);

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

var storePoints = function(){
  var store = ""
  pointCoordinates.forEach(function(circle){
    var xString = String.fromCharCode(circle.x/20+96);
    var yString = String.fromCharCode(circle.y/20+96);
    store += xString
    store += yString
  })
  return(store)
}

var retrieve = function(string){
  i = 0;
  pointCoordinates = [];
	string = string.replace(/[^a-t]/g,'');
  if(string.length>42){
  	string = string.slice(0,42);
  }
  if(string.length > 5){
    number = Math.floor(string.length/2);
    while(i < number*2){
      var xCoord = (string.charCodeAt(i)-96)*20;
      var yCoord = (string.charCodeAt(i+1)-96)*20;
      var point = {x:xCoord, y:yCoord};
      pointCoordinates.push(point);
      i+=2
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
  var optimalLength = function(startIndex,endIndex,middlePoints){
  	//functionCounter++;
    if(middlePoints === 0){
    	return lengthTable[startIndex][endIndex];
    }else{
    	var memoIdx = middlePoints*number + startIndex;
      if (memo[memoIdx] > 0) {
      	return memo[memoIdx];
      }
    
    	var bestLength = Infinity
      for(var pointIndex=2; pointIndex<number; pointIndex++){
      	if((middlePoints &  (1 << (pointIndex-2))) !== 0){
          var lengthToHere = lengthTable[startIndex][pointIndex];
          var nextMiddlePoints = middlePoints & ~(1<<(pointIndex-2));
          var length = lengthToHere + optimalLength(pointIndex,endIndex,nextMiddlePoints);
          if(length<bestLength){
            bestLength = length;
          }
         }
      }
      
      memo[memoIdx] = bestLength;
      return bestLength;
    }
  }
	//var functionCounter = 0;
  var startTime = +new Date();
  perfectLength = optimalLength(startIndex,endIndex,middlePoints,Infinity);
  var endTime = +new Date();
	//timer.textContent = (endTime-startTime)/1000;
  console.log(('Calculated in ', endTime-startTime)/1000, ' seconds');
  //console.log('optimalLength ran', functionCounter, 'times');
  //console.log((endTime-startTime)/(1000*functionCounter),'s per run');
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
		if(retrieve(window.location.hash.replace('#','')) === true){
			calculatePoints();
		}else{
			genCoordinates();
			calculatePoints();
		}
	}
})

defaultNumInput.value = defaultNumber.toString();

if(retrieve(window.location.hash.replace('#','')) === false){
	genCoordinates();
}




window.location.hash = '#' + storePoints();
calculatePoints();
}

