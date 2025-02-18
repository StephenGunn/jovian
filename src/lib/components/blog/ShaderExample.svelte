<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext | null;
  let animationFrameId: number;
  let startTime: number;

  const vsSource = `#version 300 es
  in vec4 aPosition;
  void main() {
      gl_Position = aPosition;
  }`;

  const fsSource = `#version 300 es
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  out vec4 fragColor;

  float fs(float x, float offset) {
      return cos(4.0*x - offset)*0.2 + 0.4;
  }

  void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord/iResolution.xy;
      
      vec3 colors[12];
      colors[0]  = vec3(241., 097., 095.)/255.;//red
      colors[1]  = vec3(244., 191., 066.)/255.;
      colors[2]  = vec3(245., 217., 048.)/255.;
      colors[3]  = vec3(246., 233., 033.)/255.;
      colors[4]  = vec3(248., 248., 053.)/255.;//yellow
      colors[5]  = vec3(248., 247., 073.)/255.;
      colors[6]  = vec3(250., 251., 097.)/255.;
      colors[7]  = vec3(241., 252., 133.)/255.;
      colors[8]  = vec3(126., 252., 162.)/255.;//green
      colors[9]  = vec3(035., 249., 237.)/255.;
      colors[10] = vec3(018., 241., 254.)/255.;
      colors[11] = vec3(120., 237., 255.)/255.;//cyan
      
      vec3 col = vec3(0.0);
      for(int i = 0; i < 12; i++) {
          float animation = fs(uv.x, iTime+float(i)/5.0) * min(1.0, iTime/5.0);
          float f = fs(uv.x, float(i)/5.0 - animation);
          float d = 50.0*abs(uv.y - f);
          //color
          float a = clamp(1.0 - d*d*d, 0.0, 1.0);
          col += mix(vec3(0.0), colors[i]*0.75, a);
          //bloom
          float ablur = clamp(1.0 - 0.15*d, 0.0, 1.0);
          col += mix(vec3(0.0), colors[i]*0.1, ablur);
      }
      
      fragColor = vec4(col,1.0);
  }`;

  function createShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initWebGL(): boolean {
    if (!canvas) return false;

    gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return false;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return false;

    const program = gl.createProgram();
    if (!program) return false;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return false;
    }

    const positionBuffer = gl.createBuffer();
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "iResolution");
    const timeLocation = gl.getUniformLocation(program, "iTime");

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    startTime = Date.now();

    function render() {
      if (!gl || !canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const currentTime = (Date.now() - startTime) / 1000;

      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform1f(timeLocation, currentTime);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render();
    return true;
  }

  onMount(() => {
    if (!initWebGL()) {
      console.error("Failed to initialize WebGL");
    }
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
</script>

<div class="shader">
  <canvas bind:this={canvas} style=""></canvas>
</div>

<style>
  canvas {
    width: 100%;
    height: 100%;
    display: block;
    padding: 0;
  }
  .shader {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-3);
    padding: 0 !important;
  }
  @media (max-width: 800px) {
    .shader {
      aspect-ratio: 1 / 2;
    }
  }
</style>
