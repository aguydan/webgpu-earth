import { Vector3 } from "./vector3";

export interface GPUMesh {
  verticesBuffer: GPUBuffer;
  indiciesBuffer: GPUBuffer;
  indiciesCount: number;
}

export class Mesh {
  static vertexSize = 3;

  vertices: Vector3[];
  indicies: Uint16Array;

  constructor(
    vertices: Vector3[],
    indicies: Uint16Array,
    private _device: GPUDevice,
  ) {
    this.vertices = vertices;
    this.indicies = indicies;
  }

  // the layout only cares about the vertices array. Indicies dont have layouts
  static getLayout(shaderLocation: number): GPUVertexBufferLayout {
    return {
      attributes: [
        {
          shaderLocation,
          offset: 0,
          format: "float32x3",
        },
      ],
      arrayStride: Mesh.vertexSize * Float32Array.BYTES_PER_ELEMENT,
      stepMode: "vertex",
    };
  }

  //maybe should be a separate class converter
  toFloat32(): Float32Array {
    const data = new Float32Array(this.vertices.length * Mesh.vertexSize);

    for (let i = 0; i < this.vertices.length; i++) {
      const temp = this.vertices[i].values;

      for (let j = 0; j < temp.length; j++) {
        data[i * temp.length + j] = temp[j];
      }
    }

    return data;
  }

  toGPUMesh(): GPUMesh {
    const verticesBuffer = this._device.createBuffer({
      size:
        this.vertices.length * Mesh.vertexSize * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    const indiciesBuffer = this._device.createBuffer({
      size: this.indicies.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    const verticesView = new Float32Array(verticesBuffer.getMappedRange());
    verticesView.set(this.toFloat32());

    const indiciesView = new Uint16Array(indiciesBuffer.getMappedRange());
    indiciesView.set(this.indicies);

    verticesBuffer.unmap();
    indiciesBuffer.unmap();

    return {
      verticesBuffer,
      indiciesBuffer,
      indiciesCount: this.indicies.length,
    };
  }
}
