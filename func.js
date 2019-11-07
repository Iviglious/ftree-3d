
//////////////////////////////////////////////
//
//  CONSTANTS
//
//////////////////////////////////////////////

// Vertex shader program
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
}
`;

// Fragment shader program
const fsSource = `
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}
`;



//////////////////////////////////////////////
//
//  FUNCTIONS
//
//////////////////////////////////////////////

// Mouse functions
function MouseDown(event)
{
  vMouseDown = true;
  vStartMouseX = event.offsetX;
  vStartMouseY = event.offsetY;
}
function MouseUp()
{
  vMouseDown = false;
  vDegreeH += vDeltaH;
  vDegreeV += vDeltaV;
  vDeltaH = 0.0;
  vDeltaV = 0.0;
}
function MouseMove(event)
{
  if (vMouseDown)
  {
    vDeltaH = (vStartMouseX - event.offsetX)/200.0;
    vDeltaV = (vStartMouseY - event.offsetY)/200.0;
    
    PrintMsg("vDegreeH: " + vDegreeH + "\n"
             + "vDegreeV: " + vDegreeV + "\n"
             + "vDeltaH: " + vDeltaH + "\n"
             + "vDeltaV: " + vDeltaV + "\n"
             + "vMove(x): " + vMove[0] + "\n"
             + "vMove(y): " + vMove[1] + "\n"
             + "vMove(z): " + vMove[2] + "\n"
             + "vMoveBase(x): " + vMoveBase[0] + "\n"
             + "vMoveBase(y): " + vMoveBase[1] + "\n"
             + "vMoveBase(z): " + vMoveBase[2] + "\n"
             );
  }
}

// Keys functions
function KeyDown(event)
{
  //alert(event.keyCode);
  // Go front - W
  if (event.keyCode == 87) vMove[2] -= 0.1;
  // Go back - S
  if (event.keyCode == 83) vMove[2] += 0.1;
  // Go right - D
  if (event.keyCode == 68) vMove[0] += 0.1;
  // Go left - A
  if (event.keyCode == 65) vMove[0] -= 0.1;
  
}

// Put message in the textbox
function PrintMsg(msg)
{
  document.getElementById("ta").value = msg;
}


//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Set up the normals for the vertices, so that we can compute lighting.

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0,
    0.0,  0.0,
    // Back
    1.0,  1.0,
    1.0,  0.0,
    0.0,  0.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0,
    // Bottom
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0,
    0.0,  0.0,
    // Right
    1.0,  1.0,
    1.0,  0.0,
    0.0,  0.0,
    0.0,  1.0,
    // Left
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0,
    0.0,  0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    normal: normalBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


//
// Draws Node object in specified coordinates
//
//
function drawNode(gl, pInfo, vmMat, prjMat, texArr, texId, x, y, z)
{
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix,     // destination matrix
    vmMat,     // matrix to translate
    [x, y, z]);  // amount to translate
  
  // Scale
  //mat4.scale(modelViewMatrix,
  //  modelViewMatrix,
  //  [1.0, 2.0, 1.0]);
  
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //  modelViewMatrix,  // matrix to rotate
  //  cubeRotation,     // amount to rotate in radians
  //  [0, 0, 1]);       // axis to rotate around (Z)
  
  ///mat4.rotate(modelViewMatrix,  // destination matrix
  //    modelViewMatrix,  // matrix to rotate
  //    cubeRotation * .7,// amount to rotate in radians
  //    [0, 1, 0]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Set the shader uniforms
  gl.uniformMatrix4fv(pInfo.uniformLocations.projectionMatrix, false, prjMat);
  gl.uniformMatrix4fv(pInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(pInfo.uniformLocations.normalMatrix, false, normalMatrix);

  // Specify the texture to map onto the faces.
  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0 + texId);
  
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texArr[texId]);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(pInfo.uniformLocations.uSampler, texId);

  // Draw
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}



//
// Draws Link object in specified coordinates
//
//
function drawLink(gl, pInfo, vmMat, prjMat, texArr, texId, fx, fy, fz, tx, ty, tz)
{
  const modelViewMatrix = mat4.create();
  
  mat4.translate(modelViewMatrix,     // destination matrix
    vmMat,     // matrix to translate
    [(tx + fx)/2.0, (ty + fy)/2.0, (tz + fz)/2.0]);  // amount to translate

  // Calculate distance
  var LineWidth = vec3.distance([fx,fy,fz], [tx,ty,tz]);

  // Calculate rotation matrix
  const Mrot = mat4.create();
  MakeRoationMatrix4(Mrot, [2.0, 0.0, 0.0], [fx-tx, fy-ty, fz-tz]);
  //PrintMsg("Mrot: " + PrintMat4(Mrot));
  //PrintMsg("modelViewMatrix: " + PrintMat4(modelViewMatrix));
  // Rotate
  mat4.multiply(modelViewMatrix, modelViewMatrix, Mrot);
  //PrintMsg("modelViewMatrix: " + PrintMat4(modelViewMatrix));
  
  // Scale
  mat4.scale(modelViewMatrix,
    modelViewMatrix,
    [LineWidth/2.0, 0.05, 0.05]);
  

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Set the shader uniforms
  gl.uniformMatrix4fv(pInfo.uniformLocations.projectionMatrix, false, prjMat);
  gl.uniformMatrix4fv(pInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(pInfo.uniformLocations.normalMatrix, false, normalMatrix);

  // Specify the texture to map onto the faces.

  // Specify the texture to map onto the faces.
  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0 + texId);
  
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texArr[texId]);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(pInfo.uniformLocations.uSampler, texId);
  
  // Draw
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}


/**
 * Creates a rotation matrix (3d) from two vectors (3d)
 *
 * @param {mat3} out the receiving matrix
 * @param {vec3} a the first vector
 * @param {vec3} b the second vector
 * @returns {mat3} rotation matrix of a to b
 */
function MakeRoationMatrix3(out, a, b)
{
  if ((a[0] != b[0] || a[1] != b[1] || a[2] != b[2]) &&
    !(a[0] == 0 && a[1] == 0 && a[2] == 0) &&
    !(b[0] == 0 && b[1] == 0 && b[2] == 0))
  {

    Kcross = vec3.create();
    Kvec = vec3.create();

    vec3.cross(Kcross, a,b);
    vec3.normalize(Kvec, Kcross);

    Kmat = mat3.fromValues(
      0, -Kvec[2], Kvec[1],
      Kvec[2], 0, -Kvec[0],
      -Kvec[1], Kvec[0], 0
    );

    Theta = -vec3.angle(a,b);

    Ksqr = mat3.create(); // K * K
    mat3.multiply(Ksqr, Kmat, Kmat);

    Ksin = mat3.create(); // sim(Th)*K
    mat3.multiplyScalar(Ksin, Kmat, Math.sin(Theta));

    Kips = mat3.create(); // I + sim(Th)*K
    mat3.add(Kips, mat3.identity(mat3.create()), Ksin);

    Kcos = mat3.create(); // (1-cos(Th))*K*K
    mat3.multiplyScalar(Kcos, Ksqr, 1 - Math.cos(Theta));

    // I + sim(Th)*K + (1-cos(Th))*K*K
    mat3.add(out, Kips, Kcos);

    /*PrintMsg(""
      + "Kcross: " + vec3.str(Kcross) + "\n"
      + "Kvec: " + vec3.str(Kvec) + "\n"
      + "Theta: " + Theta + "\n"
      + "Kips: " + mat3.str(Kips) + "\n"
      + "Kcos: " + mat3.str(Kcos) + "\n"
      + "Out: " + mat3.str(out) + "\n"
    );*/

  }
  
  return out;
}


/**
 * Creates a rotation matrix (4d) from two vectors (3d)
 *
 * @param {mat4} out the receiving matrix
 * @param {vec3} a the first vector
 * @param {vec3} b the second vector
 * @returns {mat4} rotation matrix of a to b
 */
function MakeRoationMatrix4(out, a, b)
{
  if ((a[0] != b[0] || a[1] != b[1] || a[2] != b[2]) &&
    !(a[0] == 0 && a[1] == 0 && a[2] == 0) &&
    !(b[0] == 0 && b[1] == 0 && b[2] == 0))
  {

    Kcross = vec3.create();
    Kvec = vec3.create();

    vec3.cross(Kcross, a,b);
    vec3.normalize(Kvec, Kcross);

    Kmat = mat4.fromValues(
      0, -Kvec[2], Kvec[1], 0,
      Kvec[2], 0, -Kvec[0], 0,
      -Kvec[1], Kvec[0], 0 , 0,
      0, 0, 0, 1
    );

    Theta = -vec3.angle(a,b);

    Ksqr = mat4.create(); // K * K
    mat4.multiply(Ksqr, Kmat, Kmat);

    Ksin = mat4.create(); // sim(Th)*K
    mat4.multiplyScalar(Ksin, Kmat, Math.sin(Theta));

    Kips = mat4.create(); // I + sim(Th)*K
    mat4.add(Kips, mat4.identity(mat4.create()), Ksin);

    Kcos = mat4.create(); // (1-cos(Th))*K*K
    mat4.multiplyScalar(Kcos, Ksqr, 1 - Math.cos(Theta));

    // I + sim(Th)*K + (1-cos(Th))*K*K
    mat4.add(out, Kips, Kcos);

    // Normalize the 4th dimension
    out[15] = 1

    /*PrintMsg(""
      + "Kcross: " + vec3.str(Kcross) + "\n"
      + "Kvec: " + vec3.str(Kvec) + "\n"
      + "Theta: " + Theta + "\n"
      + "Kips: " + mat4.str(Kips) + "\n"
      + "Kcos: " + mat4.str(Kcos) + "\n"
      + "Out: " + mat4.str(out) + "\n"
    );*/
  }
  
  return out;
}


/**
 * Multiplies matrix (mat3) with vector (vec3)
 *
 * @param {vec3} out the receiving vector
 * @param {mat3} m the matrix
 * @param {vec3} v the vector
 * @returns {vec3} out
 */
function MultiplyMatVec(out, m, v)
{
  out[0] = m[0]*v[0] + m[3]*v[1] + m[6]*v[2];
  out[1] = m[1]*v[0] + m[4]*v[1] + m[7]*v[2];
  out[2] = m[2]*v[0] + m[5]*v[1] + m[8]*v[2];
}


function PrintMat4(m)
{
  return  "\n" +
    m[0] + ", " + m[1] + ", " + m[2] + ", " + m[3] + "\n" +
    m[4] + ", " + m[5] + ", " + m[6] + ", " + m[7] + "\n" +
    m[8] + ", " + m[9] + ", " + m[10] + ", " + m[11] + "\n" +
    m[12] + ", " + m[13] + ", " + m[14] + ", " + m[15] + "\n";
}

