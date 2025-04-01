import { Renderer } from "./render-pass";

export class Shader {
  constructor(
    private _code: string,
    private _renderer: Renderer,
  ) {}

  async createModule(): Promise<GPUShaderModule> {
    const device = this._renderer.device;

    const module = device.createShaderModule({
      code: this._code,
    });

    const compilationInfo = await module.getCompilationInfo();

    for (const message of compilationInfo.messages) {
      console.error(
        `Line ${message.lineNum || "?"}:${message.linePos || "?"} - 
            ${this._code.substring(message.offset, message.length + message.offset)}`,
      );
    }

    if (compilationInfo.messages.length) {
      throw new Error("WGSL error");
    }

    return module;
  }
}
