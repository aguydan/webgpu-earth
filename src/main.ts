import { MeshGenerator } from "./mesh-generator";
import { Renderer, RenderPass } from "./render-pass";
import shader from "./shader.wgsl?raw";

async function init() {
  const generator = new MeshGenerator();
  const meshes = generator.generateCube(30);

  if (!navigator.gpu) {
    throw new Error("WebGPU not supported.");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("Couldn't request WebGPU adapter.");
  }

  const device = await adapter.requestDevice();

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgpu");

  if (!context) {
    throw Error("Canvas is not supported");
  }

  const textureFormat = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device: device,
    format: textureFormat,
    alphaMode: "premultiplied",
  });

  canvas.width = 720;
  canvas.height = 720;
  document.body.appendChild(canvas);

  //uniforms
  const uniformValues = new Float32Array([0]);

  const renderer = new Renderer(context, textureFormat, 720, 1, device);
  const pass = new RenderPass(renderer, shader, uniformValues, meshes);

  pass.writeVertexBuffers();

  function frame(time: DOMHighResTimeStamp) {
    pass.render(time / 1000);

    //requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

init();
