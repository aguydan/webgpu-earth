import { Renderer } from "./render-pass";

export class Pass {
  renderer: Renderer;
  shader: GPUShaderModule;

  //uniform data with bind groups??
  uniforms: Float32Array;

  constructor(
    renderer: Renderer,
    shader: GPUShaderModule,
    uniforms: Float32Array,
  ) {
    this.renderer = renderer;
    this.shader = shader;
    this.uniforms = uniforms;
  }
}
