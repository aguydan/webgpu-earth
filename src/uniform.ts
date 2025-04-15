import { Matrix4x4 } from "./matrix4x4";
import { Vector3 } from "./vector3";

export enum UniformType {
  Number,
  Vector3,
  Matrix4x4,
}

interface UniformEntry {
  type: UniformType;
  data: number | Vector3 | Matrix4x4;
}

const uniformTypeData = {
  [UniformType.Number]: {
    size: 1,
    alignment: 1,
  },
  [UniformType.Vector3]: {
    size: 3,
    alignment: 4,
  },
  [UniformType.Matrix4x4]: {
    size: 16,
    alignment: 4,
  },
};

export interface GPUUniform {
  buffer: GPUBuffer;
  values: Float32Array;
  bindGroupEntry: GPUBindGroupEntry;
  layoutEntry: GPUBindGroupLayoutEntry;
}

export class Uniform {
  private _view: Float32Array;
  private _offsets: Map<string, number>;

  constructor(
    private _device: GPUDevice,
    data: Map<string, UniformEntry>,
  ) {
    const values: number[] = [];
    //maybe we should actually keep subarrays into the view instead of offsets
    //gonna make life easier for the get function
    const offsets = new Map();

    let prev: UniformEntry | null = null;
    let prevOffset = 0;

    // we assume it's a struct without arrays for now
    // maybe we should actually make a dedicated tofloat32 function

    data.entries().forEach((e) => {
      const [key, value] = e;

      if (prev) {
        const { alignment } = uniformTypeData[value.type];
        const { size } = uniformTypeData[prev.type];

        // initial offset still not fixed
        // something called the roundUp function
        // move to utils
        const currentOffset =
          Math.ceil((prevOffset + size) / alignment) * alignment;
        const padding = currentOffset - prevOffset - size;

        // pad with zeroes
        for (let i = 0; i < padding; i++) {
          values.push(0);
        }

        //some way to store the offsets
        offsets.set(key, currentOffset);
        prevOffset = currentOffset;
      }

      if (typeof value.data === "number") {
        values.push(value.data);
      } else {
        //this wont work because values may not come one after another
        values.push(...value.data);
      }

      prev = value;
    });

    this._view = new Float32Array(values);
    this._offsets = offsets;
  }

  //this wont work because values may not come one after another
  set(key: string, value: number | Vector3 | Matrix4x4): void {
    const offset = this._offsets.get(key);

    if (!offset) {
      throw new Error("No array position found for the key " + key);
    }

    if (typeof value === "number") {
      this._view[offset] = value;
    } else {
      for (let i = 0; i < value.values.length; i++) {
        this._view[offset + i] = value.values[i];
      }
    }
  }

  get(key: string) {}

  toGPUUniform(binding: number): GPUUniform {
    const buffer = this._device.createBuffer({
      size: this._view.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupEntry: GPUBindGroupEntry = {
      binding,
      resource: {
        buffer,
      },
    };

    const layoutEntry: GPUBindGroupLayoutEntry = {
      binding,
      visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
      buffer: { type: "uniform" },
    };

    return {
      buffer,
      values: this._view,
      bindGroupEntry,
      layoutEntry,
    };
  }
}
