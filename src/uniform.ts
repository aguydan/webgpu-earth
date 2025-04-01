import { Renderer } from "./render-pass";

export class Uniform {
  constructor(private _renderer: Renderer) {}

  static getLayout(binding: number): GPUBindGroupLayoutEntry {
    return {
      binding,
      visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
      buffer: { type: "uniform" },
    };
  }
}
