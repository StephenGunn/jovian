---
title: Using GLSL shaders on the web without dependencies
description: Wrangling the power of LLMs to create stunning visuals from GLSL shaders.
date: "2025-2-24"
categories:
  - svelte
  - canvas
  - shaders
  - GLSL
published: true
bluesky_thread_id: "3liwweufa5c2h"
---

<script lang="ts">
 import ShaderExample from "$lib/components/blog/ShaderExample.svelte"
</script>

## The Inspiration

As a web developer that doesn't have any background in 3D programming, the world of
[GLSL](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>) shaders is as
mysterious as it is magical. I often spend time on the site
[Shadertoy.com](https://shadertoy.com) with my mind perpetually blown by the visual
wonders achieved in what seems impossibly few lines of code.

I've messed around with this before but have never put something like this into
production. Quite frankly, I don't know if something like this belongs in production...
but it makes for a fun blog post so here we go.

> note: I usually don't use AI to help me write content for my blog, but this post is an
> exception

## Shaders?

Yes, shaders. They are everywhere in video games, video processing, and real-time
graphics. They are pieces of code that run directly on your GPU, making them incredibly
powerful tools for creating live art and visual effects. Think of them as tiny programs
that determine how each pixel on your screen should be colored.

## Finding a shader to play with

ShaderToy.com is a fantastic resource where people write and post endless amounts of
shaders to play with. The one I chose to mess with today is called
[Logistics - Love Letters remake](https://www.shadertoy.com/view/7dScz3) by
[bezo97](https://www.shadertoy.com/results?query=tag%3Dbezo97). I chose this shader
because it looks like something that could be integrated into the next hot startup landing
page. The code, in totality, for this shader is as follows:

```glsl
float fs(float x, float offset)
{
    return cos(4.0*x - offset)*0.2 + 0.4;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
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
    for(int i = 0; i < 12; i++)
    {
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
}
```

The raw shader code above isn't immediately usable on a website, but
[WebGL](https://www.khronos.org/webgl/) through the HTML `<canvas>` tag gives us the power
to bring it to life. Here's what this shader looks like rendered in a
[Svelte](https://svelte.dev/) Component with a Canvas tag:

<ShaderExample />

The original shader code is only 39 lines. The Svelte Component is 175.

## How I use LLMs to wrangle shaders

I will reiterate, I've never put anything like this into production. I have not spent time
doing tests on this sort of thing to see how they affect the general user experience. I
would not recommend using something like this in production without some serious thought.

I pasted the shader code into Claude.ai's web interface and asked it to generate a svelte
component to render the shader using canvas and no dependencies. The code it returned is:

```typescript:Shader.svelte
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
  <canvas bind:this={canvas} style="width: 100%; height: 100%; display: block;"></canvas>
</div>

<style>
  .shader {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-3);
  }
  @media (max-width: 800px) {
    .shader {
      aspect-ratio: 1 / 2;
    }
  }
</style>
```

The above component code isn't hard to reason about. The real weight of the code would be
on the GPU, and not every device has a great one.

## Notes on WebGL and Shader Usage

Using WebGL and shaders in production environments comes with some important
considerations (the following was written by AI):

_When deploying this shader to production, you'll want to consider a few key performance
aspects. WebGL shaders can be resource-intensive, particularly on mobile devices, so
implementing a fallback mechanism for devices that don't support WebGL2 or have
performance limitations would be prudent. You might also want to consider adding a
mechanism to pause the animation when the component isn't visible in the viewport, as the
continuous requestAnimationFrame calls can impact battery life and overall system
performance._

_Browser compatibility is another important consideration. While WebGL2 support is now
widespread, some older browsers and certain mobile devices might not support it fully. The
current implementation will gracefully fail with an error message, but you might want to
enhance this with a more user-friendly fallback, perhaps a static gradient or a simpler
CSS animation. Additionally, some browsers might require vendor prefixes or specific
handling for high-DPI displays to ensure the shader renders crisply on retina and 4K
screens._

_Memory management and cleanup are crucial for production deployments. The current
implementation includes basic cleanup in the onDestroy hook, but you might want to add
more robust error boundaries and memory cleanup, particularly for the WebGL context and
shader programs. Also consider implementing a loading state while the shader initializes,
as compilation and setup can take a noticeable amount of time on slower devices. These
considerations will help ensure your shader runs smoothly and efficiently in a production
environment while providing a good user experience across different devices and browsers._

Good job, robot.

## In Conclusion

This was just a quick and fun experiment inspired by my awe of shader code and lack of 3d
programming ability. The world of shaders is vast and fascinating, and while they might
not always be the right choice for production websites, they're definitely worth
exploring.

I should try to write some shaders.
