var scene, camera, renderer;
var cubes;
var k = 3;
var gap = 0.15;
var rowRotationAxis   = new THREE.Vector4(0,1,0,0);
var colRotationAxis   = new THREE.Vector4(1,0,0,0);
var sliceRotationAxis = new THREE.Vector4(0,0,1,0);

var indMapRow   = [[0,  2, 20, 18], [1, 11, 19,  9]];
var indMapCol   = [[0, 18, 24,  6], [3,  9, 21, 15]];
var indMapSlice = [[0,  2,  8,  6], [3,  1,  5,  7]];

// for turn animation
var framesPerTurn = 20;
var turnAnglePerFrame = (Math.PI/2)/framesPerTurn;
var frameCount = 0;

// these have to be assigned on user input:
var isTurning = true;
var rowNo = 1, colNo = 1, sliceNo = 1;

var rowRing, colRing, sliceRing;

var cameraControl = false;
var shuffles = 20;

// main code
init();
makeCubes();
makeSelectors();
setTimeout(shuffle, 500);
render();

function init()
{
	scene = new THREE.Scene();
	var viewSize = 10;
	var aspectRatio = window.innerWidth/window.innerHeight;
	camera = new THREE.PerspectiveCamera( 50, aspectRatio, 3, 100 );
	// camera = new THREE.OrthographicCamera( -aspectRatio*viewSize/2, aspectRatio*viewSize/2, viewSize/2, -viewSize/2, 0.1, viewSize );
	camera.position.z = k+6;
	camera.position.y = k+2;
	camera.position.x = k+3;

	// camera controls
	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 8.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.addEventListener( 'change', render );

	// lights
	var light = new THREE.SpotLight( 0xffffff, 1);
	light.position.set( 0, 0, 8 );

	var light2 = new THREE.SpotLight( 0xffffff, 1);
	light2.position.set( 0, 8, 0 );

	var light3 = new THREE.SpotLight( 0xffffff, 1);
	light3.position.set( 0, 0, -8 );

	var light4 = new THREE.SpotLight( 0xffffff, 1);
	light4.position.set( 0, -8, 0 );

	var light5 = new THREE.SpotLight( 0xffffff, 1);
	light5.position.set( 8, 0, 0 );

	var light6 = new THREE.SpotLight( 0xffffff, 1);
	light6.position.set( -8, 0, 0 );
	
	scene.add( light  );
	scene.add( light2 );
	scene.add( light3 );
	scene.add( light4 );
	scene.add( light5 );
	scene.add( light6 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

function makeCubes()
{
	cubes = [];

	//Colors: Blue, Green, Red, Orange, Yellow, White
	var colors = [0x0000ff,0x00ff00,0xff0000,0xff6600,0xffff00,0xffffff];
	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors, shininess: 10, metal: false, specular: 0x333333 } );
	
	for (var i = 0; i < k*k*k; i++) 
	{
		var x = (i%k-1);
		var y = (((i/k) | 0)%(k)-1);
		var z = (((i/(k*k)) | 0)%(k)-1);

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );

		// assign colors to faces
		for ( j = 0; j < geometry.faces.length; j+=2 ) 
		{
			geometry.faces[ j ].color.setHex(colors[j/2]);
			geometry.faces[ j+1 ].color.setHex(colors[j/2]);
		}

		// blacken out non-relevant faces
		if (x > -1)
		{
			geometry.faces[ 2 ].color.setHex(0x000000);
			geometry.faces[ 3 ].color.setHex(0x000000);
		}
		if (x < 1)
		{
			geometry.faces[ 0 ].color.setHex(0x000000);
			geometry.faces[ 1 ].color.setHex(0x000000);
		}
		if (y > -1)
		{
			geometry.faces[ 6 ].color.setHex(0x000000);
			geometry.faces[ 7 ].color.setHex(0x000000);
		}
		if (y < 1)
		{
			geometry.faces[ 4 ].color.setHex(0x000000);
			geometry.faces[ 5 ].color.setHex(0x000000);
		}
		if (z > -1)
		{
			geometry.faces[ 10 ].color.setHex(0x000000);
			geometry.faces[ 11 ].color.setHex(0x000000);
		}
		if (z < 1)
		{
			geometry.faces[ 8 ].color.setHex(0x000000);
			geometry.faces[ 9 ].color.setHex(0x000000);
		}

		// make mini-cube
		var cube = new THREE.Mesh( geometry, material );

		// place cube at the correct position
		cube.translateX((1+gap)*x);
		cube.translateY((1+gap)*y);
		cube.translateZ((1+gap)*z);
		scene.add(cube);
		cubes.push(cube);
	}
}

function makeSelectors()
{
	var radius = 2.45;
	var segments = 100;
	var material = new THREE.MeshLambertMaterial({
		color: 0xaaaaaa, transparent: true, opacity: 0.5
	});
	var cyl1 = new THREE.CylinderGeometry( radius, radius, 0.5, segments, segments, true);
	var cyl2 = new THREE.CylinderGeometry( radius-0.05, radius-0.05, 0.5, segments, segments, true);
	var cyl3 = new THREE.CylinderGeometry( radius+0.05, radius+0.05, 0.5, segments, segments, true);
	rowRing = new THREE.Mesh( cyl1, material );
	colRing = new THREE.Mesh( cyl2, material );
	sliceRing = new THREE.Mesh( cyl3, material );
	colRing.rotation.z = Math.PI/2;
	sliceRing.rotation.x = Math.PI/2;
	scene.add( rowRing );
	scene.add( colRing );
	scene.add( sliceRing );
}

function shuffle()
{
	if (shuffles <= 0)
		return (isTurning = false);

	shuffles--;
	
	var op, cl;
	var r = Math.random();
	var n = (Math.random()*3)|0;
	var d = (Math.random() > 0.5) ? 1:-1;
	
	if (r < 0.333)
	{
		op = rotateRow(n, d*turnAnglePerFrame);
		cl = updateRowInd(n, d);
	}
	else if (r < 0.666)
	{
		op = rotateCol(n, d*turnAnglePerFrame);
		cl = updateColInd(n, d);
	}
	else
	{
		op = rotateSlice(n, d*turnAnglePerFrame);
		cl = updateSliceInd(n, -d);
	}

	isTurning = true;
	animate(op, function() { cl(); shuffle(); });
}

function render()
{
	// draw row/col selectors
	rowRing.position.y   = (rowNo-1)  *(1+gap);
	colRing.position.x   = (colNo-1)  *(1+gap);
	sliceRing.position.z = (sliceNo-1)*(1+gap);

	renderer.render( scene, camera );
}

function animate(currentOperation, cleanup)
{
	if(cameraControl)
	{
		requestAnimationFrame( animate );
		controls.update();
	}
	else
	{
		if (frameCount >= framesPerTurn)
		{
			frameCount = 0;
			isTurning = false;
			cleanup();
			requestAnimationFrame(render);
		}
		else if (isTurning)
		{
			frameCount++;
			currentOperation();
			requestAnimationFrame(function () { animate(currentOperation, cleanup); });
		}
	}
	renderer.render( scene, camera );
}

// 0 <= row < k
function rotateRow(row, angle)
{
	return function ()
	{
		for (var i = 0; i < k*k; i++)
		{
			var ind = k*row + (i%k) + (((i/k)|0)*(k*k));
			cubes[ind].position.applyMatrix4(new THREE.Matrix4().makeRotationAxis( rowRotationAxis.normalize(), angle ));
			cubes[ind].rotateOnAxis(cubes[ind].worldToLocal(rowRotationAxis.clone()), angle);
		}		
	}
}

// 0 <= col < k
function rotateCol(col, angle)
{
	return function ()
	{
		for (var i = col; i < cubes.length; i+=k)
		{
			cubes[i].position.applyMatrix4(new THREE.Matrix4().makeRotationAxis( colRotationAxis.normalize(), angle ));
			cubes[i].rotateOnAxis(cubes[i].worldToLocal(colRotationAxis.clone()), angle);
		}
	}
}

// 0 <= slice < k
function rotateSlice(slice, angle)
{
	return function ()
	{
		for (var i = slice*k*k; i < (slice+1)*k*k; i++)
		{
			cubes[i].position.applyMatrix4(new THREE.Matrix4().makeRotationAxis( sliceRotationAxis.normalize(), angle ));
			cubes[i].rotateOnAxis(cubes[i].worldToLocal(sliceRotationAxis.clone()), angle);
		}
	}
}

function rotateAllRows(angle)
{
	return function ()
	{
		for (var i = 0; i < k; i++)
		{
			rotateRow(i, angle)();
		}
	}
}

function rotateAllCols(angle)
{
	return function ()
	{
		for (var i = 0; i < k; i++)
		{
			rotateCol(i, angle)();		
		}
	}
}

function rotateAllSlices(angle)
{
	return function ()
	{
		for (var i = 0; i < k; i++)
		{
			rotateSlice(i, angle)();		
		}
	}
}

function updateRowInd(row, dir)
{
	return function ()
	{
		rotateIndices(indMapRow, row*k, dir);
	}
}

function updateColInd(col, dir)
{
	return function ()
	{
		rotateIndices(indMapCol, col, dir);
	}
}

function updateSliceInd(slice, dir)
{
	return function ()
	{
		rotateIndices(indMapSlice, slice*k*k, dir);
	}
}

function rotateIndices(indMap, offset, dir)
{
	for (var i = 0; i < indMap.length; i++)
	{
		if (dir == 1)
		{
			var tmp = cubes[indMap[i][0] + offset];
			cubes[indMap[i][0] + offset] = cubes[indMap[i][1] + offset];
			cubes[indMap[i][1] + offset] = cubes[indMap[i][2] + offset];
			cubes[indMap[i][2] + offset] = cubes[indMap[i][3] + offset];
			cubes[indMap[i][3] + offset] = tmp;
		}
		else
		{
			var tmp = cubes[indMap[i][3] + offset];
			cubes[indMap[i][3] + offset] = cubes[indMap[i][2] + offset];
			cubes[indMap[i][2] + offset] = cubes[indMap[i][1] + offset];
			cubes[indMap[i][1] + offset] = cubes[indMap[i][0] + offset];
			cubes[indMap[i][0] + offset] = tmp;
		}
	}
}

function updateIndAll(func, dir) 
{
	return function ()
	{
		for (var i = 0; i < k; i++)
			func(i, dir)();
	}
}

document.onkeydown = function(evt) 
{
    evt = evt || window.event;

    if (evt.shiftKey && evt.keyCode == 67) 
    {
        toggleCameraControl();
    }
	
	if (isTurning || cameraControl) return;

    if (evt.ctrlKey && evt.shiftKey && evt.keyCode == 39) // right
    {
        isTurning = true;
        animate(rotateAllSlices(-turnAnglePerFrame), updateIndAll(updateSliceInd, 1));
    }
    else if (evt.ctrlKey && evt.shiftKey && evt.keyCode == 37) // left
    {
        isTurning = true;
        animate(rotateAllSlices( turnAnglePerFrame), updateIndAll(updateSliceInd, -1));
    }
    else if (evt.shiftKey && evt.keyCode == 39) // right
    {
        isTurning = true;
        animate(rotateSlice(sliceNo, -turnAnglePerFrame), updateSliceInd(sliceNo, 1));
    }
    else if (evt.shiftKey && evt.keyCode == 37) // left
    {
        isTurning = true;
        animate(rotateSlice(sliceNo,  turnAnglePerFrame), updateSliceInd(sliceNo, -1));
    }    
    else if (evt.ctrlKey && evt.keyCode == 37) // left
    {
        isTurning = true;
        animate(rotateAllRows(-turnAnglePerFrame), updateIndAll(updateRowInd, -1));
    }
    else if (evt.ctrlKey && evt.keyCode == 39) // right
    {
        isTurning = true;
        animate(rotateAllRows(turnAnglePerFrame), updateIndAll(updateRowInd, 1));
    }
    else if (evt.ctrlKey && evt.keyCode == 38) // up
    {
        isTurning = true;
        animate(rotateAllCols(-turnAnglePerFrame), updateIndAll(updateColInd, -1));
    }
    else if (evt.ctrlKey && evt.keyCode == 40) // down
    {
        isTurning = true;
        animate(rotateAllCols(turnAnglePerFrame), updateIndAll(updateColInd, 1));
    }
    else if (evt.keyCode == 37) // left
    {
        isTurning = true;
        animate(rotateRow(rowNo, -turnAnglePerFrame), updateRowInd(rowNo, -1));
    }
    else if (evt.keyCode == 39) // right
    {
        isTurning = true;
        animate(rotateRow(rowNo, turnAnglePerFrame), updateRowInd(rowNo, 1));
    }
    else if (evt.keyCode == 38) // up
    {
        isTurning = true;
        animate(rotateCol(colNo, -turnAnglePerFrame), updateColInd(colNo, -1));
    }
    else if (evt.keyCode == 40) // down
    {
        isTurning = true;
        animate(rotateCol(colNo, turnAnglePerFrame), updateColInd(colNo, 1));
    }
    else
    {
	    if (evt.keyCode == 65) // left
	    {
	        colNo = (colNo>0) ? (colNo-1)%k:(k-1);
	    }    
	    else if (evt.keyCode == 83) // down
	    {
	        rowNo = (rowNo>0) ? (rowNo-1)%k:(k-1);
	    }
	    else if (evt.keyCode == 69) // backward
	    {
	        sliceNo = (sliceNo>0) ? (sliceNo-1)%k:(k-1);
	    }
	    else if (evt.keyCode == 68) // right
	    {
	        colNo = (colNo+1)%k;
	    }    
	    else if (evt.keyCode == 87) // up
	    {
	        rowNo = (rowNo+1)%k;
	    }
	    else if (evt.keyCode == 81) // forward
	    {
	        sliceNo = (sliceNo+1)%k;
	    }
	    else
	    {
	    	return;
	    }
	    render();
    }
};

function toggleCameraControl()
{
	if(cameraControl)
	{
		cameraControl = false;
	}
	else
	{
		cameraControl= true;
		animate();
	}
}