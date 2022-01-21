import Shader from './shader';

const screenTextureVertexSource = `#version 300 es

  out vec2 uv;
  
  void main() {
    switch (gl_VertexID) {
    case 0:
      gl_Position = vec4(-1, -1, 0, 1);
      uv = vec2(0, 0);
      return;
    case 1:
      gl_Position = vec4(-1, 1, 0, 1);
      uv = vec2(0, 1);
      return;
    case 2:
      gl_Position = vec4(1, 1, 0, 1);
      uv = vec2(1, 1);
      return;
    case 3:
      gl_Position = vec4(-1, -1, 0, 1);
      uv = vec2(0, 0);
      return;
    case 4:
      gl_Position = vec4(1, -1, 0, 1);
      uv = vec2(1, 0);
      return;
    case 5:
      gl_Position = vec4(1, 1, 0, 1);
      uv = vec2(1, 1);
      return;
    }
  }
`;

const screenTextureFragmentSource = `#version 300 es

  precision mediump float;

  uniform sampler2D uTexture;

  in vec2 uv;

  out vec4 FragColor;

  void main() {
    FragColor = texture(uTexture, uv);
    // FragColor = vec4(texelFetch(uTexture, ivec2(0, 0), 0).r, 0, 0, 1);
  }
`;

const temperatureVertexSource = `#version 300 es

void main() {
  switch (gl_VertexID) {
  case 0:
    gl_Position = vec4(-1, -1, 0, 1);
    return;
  case 1:
    gl_Position = vec4(-1, 1, 0, 1);
    return;
  case 2:
    gl_Position = vec4(1, 1, 0, 1);
    return;
  case 3:
    gl_Position = vec4(-1, -1, 0, 1);
    return;
  case 4:
    gl_Position = vec4(1, -1, 0, 1);
    return;
  case 5:
    gl_Position = vec4(1, 1, 0, 1);
    return;
  }
}
`;

const temperatureFragmentSource = `#version 300 es

  precision mediump float;

  uniform sampler2D uTexture;
  
  out vec4 FragColor;

  void main() {
    FragColor = vec4(texelFetch(uTexture, ivec2(gl_FragCoord), 0).r + 0.01, 0, 0, 1);
    // FragColor = vec4(1, 0, 0, 1);
  }
`;

export default class Space {
  screenWidth: number;
  screenHeight: number;

  screenTextureVAO: WebGLVertexArrayObject;
  screenTextureShader: Shader;
  currentScreenTexture: WebGLTexture;
  nextScreenTexture: WebGLTexture;
  currentScreenTextureFBO: WebGLFramebuffer;
  nextScreenTextureFBO: WebGLFramebuffer;

  temperatureVAO: WebGLVertexArrayObject;
  temperatureShader: Shader;

  constructor(
    gl: WebGL2RenderingContext,
    screenWidth: number,
    screenHeight: number
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    gl.viewport(0, 0, screenWidth, screenHeight);

    /********************* Current screen texture **********************/
    this.screenTextureVAO = gl.createVertexArray()!;

    this.screenTextureShader = new Shader(
      gl,
      screenTextureVertexSource,
      screenTextureFragmentSource
    );

    this.currentScreenTexture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentScreenTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      screenWidth,
      screenHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.currentScreenTextureFBO = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentScreenTextureFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.currentScreenTexture,
      0
    );

    /********************* Next screen texture **********************/
    this.nextScreenTexture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.nextScreenTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      screenWidth,
      screenHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.nextScreenTextureFBO = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.nextScreenTextureFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.nextScreenTexture,
      0
    );

    /********************* Render temperature to screen texture **********************/
    this.temperatureVAO = gl.createVertexArray()!;

    this.temperatureShader = new Shader(
      gl,
      temperatureVertexSource,
      temperatureFragmentSource
    );
  }

  step() {}

  draw(gl: WebGL2RenderingContext) {
    /********************* Use current texture to write to next texture **********************/
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentScreenTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.nextScreenTextureFBO);
    gl.bindVertexArray(this.temperatureVAO);
    this.temperatureShader.use(gl);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    /********************* Swap current and next textures **********************/
    // gl.copyTexImage2D(
    //   gl.TEXTURE_2D,
    //   0,
    //   gl.RGBA,
    //   0,
    //   0,
    //   this.screenWidth,
    //   this.screenHeight,
    //   0
    // );

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.nextScreenTextureFBO);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.currentScreenTextureFBO);
    gl.blitFramebuffer(
      0,
      0,
      this.screenWidth,
      this.screenHeight,
      0,
      0,
      this.screenWidth,
      this.screenHeight,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST
    );

    /********************* Draw current texture to screen **********************/
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.bindTexture(gl.TEXTURE_2D, this.currentScreenTexture);
    // gl.activeTexture(gl.TEXTURE0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(this.screenTextureVAO);
    this.screenTextureShader.use(gl);
    gl.uniform1i(
      gl.getUniformLocation(this.screenTextureShader.program, 'uTexture'),
      1
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawScreenTexture(gl: WebGL2RenderingContext) {}
}
