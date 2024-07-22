<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement | null = null;

  const vertex_shader_source: string = `
    attribute vec4 position;
    void main() {
      gl_Position = position;
    }
  `;

  // generate a random number between two floats
  const random = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const fragment_shader_source: string = `
    #define M_PI 3.1415926535897932384626433832795

    precision mediump float;

    float rand(vec2 co)
    {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    uniform float iTime;
    uniform vec2 iResolution;

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      float size = ${random(30.0, 40.0)};
      float prob = ${random(0.99, 0.995)};
      
      vec2 pos = floor(1.0 / size * fragCoord.xy);
      
      float color = 0.0;
      float starValue = rand(pos);
      
      if (starValue > prob)
      {
        vec2 center = size * pos + vec2(size, size) * 0.5;
        
        float t = 0.9 + 0.2 * sin(iTime + (starValue - prob) / (1.0 - prob) * 45.0);
                
        color = 1.0 - distance(fragCoord.xy, center) / (0.5 * size);
        color = color * t / (abs(fragCoord.y - center.y)) * t / (abs(fragCoord.x - center.x));
        fragColor = vec4(vec3(color), color);
      }
      else if (rand(fragCoord.xy / iResolution.xy) > 0.996)
      {
        float r = rand(fragCoord.xy);
        color = r * (0.25 * sin(iTime * (r * 5.0) + 720.0 * r) + 0.75);
        fragColor = vec4(vec3(color), color);
      }
      else
      {
        fragColor = vec4(0.0);
      }
    }

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `;

  const create_shader = (gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) {
      console.error("Unable to create shader");
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile failed with: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const create_program = (
    gl: WebGLRenderingContext,
    vertex_shader_source: string,
    fragment_shader_source: string
  ): WebGLProgram | null => {
    const vertex_shader = create_shader(gl, vertex_shader_source, gl.VERTEX_SHADER);
    const fragment_shader = create_shader(gl, fragment_shader_source, gl.FRAGMENT_SHADER);
    if (!vertex_shader || !fragment_shader) {
      return null;
    }
    const program = gl.createProgram();
    if (!program) {
      console.error("Unable to create program");
      return null;
    }
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link failed with: " + gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  };

  onMount(() => {
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const program = create_program(gl, vertex_shader_source, fragment_shader_source);
    if (!program) {
      return;
    }

    const position_attribute_location = gl.getAttribLocation(program, "position");
    const position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const i_resolution_location = gl.getUniformLocation(program, "iResolution");
    const i_time_location = gl.getUniformLocation(program, "iTime");

    let last_time = 0;

    const render = (time: number) => {
      const current_time = time * 0.001; // convert to seconds
      const delta_time = current_time - last_time;
      last_time = current_time;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(position_attribute_location);
      gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

      const size = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(position_attribute_location, size, type, normalize, stride, offset);

      gl.uniform2f(i_resolution_location, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(i_time_location, current_time);

      const primitive_type = gl.TRIANGLES;
      const count = 6;
      gl.drawArrays(primitive_type, offset, count);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  });

  let width: number = 0;
  let height: number = 0;
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
