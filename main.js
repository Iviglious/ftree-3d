
// Global variables
var vDegreeH = 0.0;
var vDegreeV = -0.25;
var vDeltaH = 0.0;
var vDeltaV = 0.0;
var vStartMouseX = 0;
var vStartMouseY = 0;
var vMouseDown = false;
var vMoveBase = [0,0,0];
var vMove = [0,0,0];
var vCanvasWidth = document.getElementById("glcanvas").width;
var vCanvasHeight = document.getElementById("glcanvas").height;


// MAIN BODY
try
{
  main();
}
catch(ex)
{
  alert(ex);
}

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexNormal, aTextureCoord,
  // and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  // Load texture images
  // Links textures
  var textures = [
    loadTexture(gl, "img/pink.png"),
    loadTexture(gl, "img/blue.png")
  ];
  // Nodes images
  for(var i=0;i<NodeArr.length;i++)
  {
    textures.push(loadTexture(gl, NodeArr[i][1]));
  }
  
  // Repaint on page action
  function render(now)
  {
    drawScene(gl, programInfo, buffers, textures);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}


//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texArr) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

    
  // Create camera and rotate it
  const cameraMatrix = mat4.create();
  
  // Move the camera
  mat4.translate(cameraMatrix,     // destination matrix
    cameraMatrix,     // matrix to translate
    [
       0.0 + vMoveBase[0] + vMove[0]
      ,5.0 + vMoveBase[1] + vMove[1]
      ,15.0 + vMoveBase[2] + vMove[2]
    ]);  // amount to translate
  
  
  mat4.rotate(cameraMatrix,  // destination matrix
    cameraMatrix,  // matrix to rotate
    vDegreeH + vDeltaH, //0 * Math.PI/180,     // amount to rotate in radians
    [0, 1, 0]);       // axis to rotate around (Y)
  mat4.rotate(cameraMatrix,  // destination matrix
    cameraMatrix,  // matrix to rotate
    vDegreeV + vDeltaV, //0 * Math.PI/180,     // amount to rotate in radians
    [1, 0, 0]);       // axis to rotate around (X)
  
  const viewMatrix = mat4.create();
  // Make a view matrix from the camera matrix
  mat4.invert(viewMatrix, cameraMatrix);
  // Compute a view projection matrix
  //const vmMatrix = mat4.create();
  mat4.multiply(projectionMatrix, projectionMatrix, viewMatrix);

  // GL stuff
  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  /*
  // DRAW Y
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 2, -10.0,  -3.0, -9.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 3, -4.0,  0.0,  -9.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 4, -10.0,  3.0, -9.0);
  
  //drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 0, 0.0,  0.0, 0.0,  0.0,  0.0, 1.0);

  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 0, -4.0,  0.0, -9.0,  -10.0,  -3.0, -9.0);
  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 1, -4.0,  0.0, -9.0,  -10.0,  3.0, -9.0);
  
  // DRAW Z
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 2, -3.0,  -3.0, -9.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 3, 3.0,  -3.0, -6.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 4, -3.0,  -3.0, -3.0);
  
  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 0, 3.0,  -3.0, -6.0,  -3.0,  -3.0, -9.0);
  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 1, 3.0,  -3.0, -6.0,  -3.0,  -3.0, -3.0);

  // DRAW X
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 2, 6.0,  -3.0, -9.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 3, 6.0,  0.0, -3.0);
  drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, 4, 6.0,  3.0, -9.0);
  
  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 0, 6.0,  0.0, -3.0,  6.0,  -3.0, -9.0);
  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 1, 6.0,  0.0, -3.0,  6.0,  3.0, -9.0);

  drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 1,6.0,  3.0, -9.0,  -4.0,  0.0,  -9.0);
  */

  const zC = 2;

  // Draw Nodes
  for(var i=0;i<NodeArr.length;i++)
  {
    drawNode(gl, programInfo, viewMatrix, projectionMatrix, texArr, i+2, NodeArr[i][2] * zC,  NodeArr[i][3] * zC, NodeArr[i][4] * zC);
  }

  // Draw links
  for(var i=0;i<LinkArr.length;i++)
  {
    var pA = GetNodePointById(LinkArr[i][0]);
    var pB = GetNodePointById(LinkArr[i][1]);
    if (pA!=null && pB!=null)
      drawLink(gl, programInfo, viewMatrix, projectionMatrix, texArr, 0, pA[0]*zC,pA[1]*zC,pA[2]*zC, pB[0]*zC,pB[1]*zC,pB[2]*zC);
  }
}

/**
 * Searches and returns the coordinates (point) of a node.
 * Searches by ID of the node in a form of a string.
 * If the given ID is not found a NULL is returned.
 *
 * @param {string} NodeId the node ID as a string
 * @returns {vec3} out 3d array (point)
 */
function GetNodePointById(NodeId)
{
  var out = null;

  for(var i=0;i<NodeArr.length;i++)
  {
    if (NodeId == NodeArr[i][0])
      return [NodeArr[i][2], NodeArr[i][3], NodeArr[i][4]];
  }

  return out;
}

