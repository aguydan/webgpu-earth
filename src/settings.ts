import { Settings } from "./types";

const controls: Settings = {
  speed: 10,
  fovY: 0.5,
  aspectRatio: 16 / 9,
  zNear: 1,
  zFar: 2000,
  translate: {
    x: 0,
    y: 0,
    z: 0,
  },
  rotate: {
    x: 0,
    y: 0,
    z: 0,
  },
  cameraYaw: 0,
  cameraPitch: 0,
};

export default controls;
