import { Vector3 } from "./vector3";
import { Mesh } from "./mesh";

export class MeshGenerator {
  constructor(private _device: GPUDevice) {}

  generateFace(normal: Vector3, resolution: number = 2): Mesh {
    const axisA = new Vector3(normal.y, normal.z, normal.x);
    const axisB = Vector3.cross(normal, axisA);

    const vertices: Vector3[] = [];
    const indicies = new Uint16Array((resolution - 1) * (resolution - 1) * 6);

    let triangleIndex = 0;

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const vertexIndex = x + resolution * y;

        // we first subtract 1 because if the resolution is 3
        // then x / resolution yields 0, 0.3, 0.6 which isnt 0 to 1 range
        //
        // 2 * a - 1 is for mapping a to the -1 to 1 range
        const vertex = normal
          .add(axisA.mult(2 * (x / (resolution - 1)) - 1))
          .add(axisB.mult(2 * (y / (resolution - 1)) - 1));

        vertices.push(vertex);

        if (x !== resolution - 1 && y !== resolution - 1) {
          indicies[triangleIndex] = vertexIndex;
          indicies[triangleIndex + 1] = vertexIndex + resolution + 1;
          indicies[triangleIndex + 2] = vertexIndex + resolution;
          indicies[triangleIndex + 3] = vertexIndex;
          indicies[triangleIndex + 4] = vertexIndex + 1;
          indicies[triangleIndex + 5] = vertexIndex + resolution + 1;

          triangleIndex += 6;
        }
      }
    }

    return new Mesh(vertices, indicies, this._device);
  }

  generateCube(resolution: number): Mesh[] {
    const data: Mesh[] = [];

    const sideNormals = [
      Vector3.up,
      Vector3.down,
      Vector3.left,
      Vector3.right,
      Vector3.forward,
      Vector3.back,
    ];

    for (const normal of sideNormals) {
      data.push(this.generateFace(normal, resolution));
    }

    return data;
  }

  generateCubeSphere(resolution: number): Mesh[] {
    const data = this.generateCube(resolution);

    for (const d of data) {
      d.vertices = d.vertices.map((vertex) => vertex.normalized);
    }

    return data;
  }
}
