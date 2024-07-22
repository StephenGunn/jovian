<!-- Include the model-viewer script from CDN in the head of your app -->
<svelte:head>
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
</svelte:head>

<!-- Use the model-viewer element to display your 3D model -->
<model-viewer src="/moon.glb" alt="A 3D model" auto-rotate camera-controls></model-viewer>

<style>
  model-viewer {
    width: 300px;
    height: 300px;
    position: absolute;
    z-index: 10;
    top: 200px;
    height: 200px;
  }
</style>
