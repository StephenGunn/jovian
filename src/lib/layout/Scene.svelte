<script lang="ts">
  import { T } from "@threlte/core";
</script>

<T.PerspectiveCamera
  position={[10, 10, 10]}
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0);
  }}
/>

<T.Mesh>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshBasicMaterial color="red" />
</T.Mesh>
