import { Vector3 } from "./vector";

export class VertexData {
  valuesPerVertex = 3;

  vertices: Vector3[];
  indicies: Uint16Array;

  constructor(vertices: Vector3[], indicies: Uint16Array) {
    this.vertices = vertices;
    this.indicies = indicies;
  }

  get layout(): GPUVertexBufferLayout {
    return {
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x3",
        },
      ],
      arrayStride: this.valuesPerVertex * Float32Array.BYTES_PER_ELEMENT,
      stepMode: "vertex",
    };
  }

  toFloat32(): Float32Array {
    const data = new Float32Array(this.vertices.length * this.valuesPerVertex);

    for (let i = 0; i < this.vertices.length; i++) {
      const temp = this.vertices[i].values;

      for (let j = 0; j < temp.length; j++) {
        data[i * temp.length + j] = temp[j];
      }
    }

    return data;
  }
}
