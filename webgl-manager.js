//////////////////////////////////////////////////////////////////////////////////////////
//
// WEBGL MANAGER
//
//////////////////////////////////////////////////////////////////////////////////////////
class WebGLManager {
   constructor(canvas) {
      this.gl = this.initGL(canvas);
      if (!this.gl) throw new Error('WebGL is not supported by this browser.');

      this.startTime = undefined;
      this.isProgramReady = false;
      this.errorMessage = document.getElementById("error-message");
      this.errorMarker = document.getElementById("error-marker");
   }

   initGL(canvas) {
      return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
   }

   loadAndCompileShader(type, src, program) {
      this.errorMessage.innerHTML = '<br>';

      // Reset error marker position
      this.errorMarker.style.display = "block";
      this.errorMarker.style.top = '0px';


      const shader = this.gl.createShader(type);

      this.gl.shaderSource(shader, src);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
         const msg = this.gl.getShaderInfoLog(shader);
         console.log('Cannot compile shader:\n\n' + msg);

         const regex = /ERROR:\s+0:(\d+):/;
         const match = msg.match(regex);

         if (match && match[1]) {
            const errorLineFromLog = parseInt(match[1], 10);
            const errorLine = errorLineFromLog - NUMBER_OF_LINES_FRAGMENT_SHADER_HEADER;
            const topOffset = errorLine * TEXT_EDITOR_LINE_HEIGHT;
            this.errorMarker.style.top = topOffset + 'px';
         }


         let msgContent = msg.substring(6);
         let colonIndex = msgContent.indexOf(':');
         msgContent = msgContent.substring(colonIndex + 2);
         let newlineIndex = msgContent.indexOf('\n');
         if (newlineIndex > 0) {
            msgContent = msgContent.substring(0, newlineIndex);
         }

         this.errorMessage.innerHTML = msgContent;
      } else {
         this.errorMarker.style.display = "none";
      }

      this.gl.attachShader(program, shader);
   }

   createShaderProgram(vertexShader, fragmentShader) {
      // Create the WebGL program.
      const program = this.gl.createProgram();

      // Add the vertex and fragment shaders.
      this.loadAndCompileShader(this.gl.VERTEX_SHADER, vertexShader, program);
      this.loadAndCompileShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_HEADER + fragmentShader, program);

      // Link the program, report any errors.
      this.gl.linkProgram(program);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
         console.log('Could not link the shader program!');
      this.gl.useProgram(program);

      return program;
   }

   configureGeometry() {
      // Create a square as a triangle strip
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());

      // consisting of two triangles.
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(
         [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]), this.gl.STATIC_DRAW);

      // Set aPos attribute for each vertex.
      const aPos = this.gl.getAttribLocation(this.gl.program, 'aPos');
      this.gl.enableVertexAttribArray(aPos);
      this.gl.vertexAttribPointer(aPos, 3, this.gl.FLOAT, false, 0, 0);
   }

   setShaders(vertexShader, fragmentShader) {
      const program = this.createShaderProgram(vertexShader, fragmentShader);
      this.gl.program = program;
      this.configureGeometry();
      this.isProgramReady = true;
   }

   setUniform(type, name, ...values) {
      const loc = this.gl.getUniformLocation(this.gl.program, name);

      if (loc === null) {
         console.warn(`Uniform '${name}' not found.`);
         return;
      }

      const functionName = `uniform${type}`

      if (typeof this.gl[functionName] !== 'function') {
         console.error(`Function 'gl.${functionName}' is not a valid function.`);
         return;
      }

      this.gl[functionName](loc, ...values);
   }

   animate() {
      if (!this.isProgramReady) return;
      if (this.startTime === undefined)
         this.startTime = Date.now();

      const time = (Date.now() - this.startTime) / 1000;
      this.setUniform('1f', 'uTime', time);

      // Implementation of animation-related computations
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
   }
}