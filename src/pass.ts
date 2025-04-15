import { Renderer } from "./types";

//probably dont need this class or just move uniforms and render here
export class Pass {
  renderer: Renderer;
  shader: GPUShaderModule;

  constructor(renderer: Renderer, shader: GPUShaderModule) {
    this.renderer = renderer;
    this.shader = shader;
  }
}
