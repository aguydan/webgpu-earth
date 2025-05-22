import { GUI } from "dat.gui";
import { Settings } from "../types";

export default function initializeGUI(
  controls: Settings,
  callback: () => void,
) {
  const gui = new GUI();

  const generalFolder = gui.addFolder("General");
  generalFolder.add(controls, "speed", 1, 40);

  const matrixFolder = gui.addFolder("Projection matrix");
  matrixFolder.add(controls, "fovY", 0, Math.PI);
  matrixFolder.add(controls, "zNear", 0, 2000);
  matrixFolder.add(controls, "zFar", 0, 2000);

  const translationFolder = gui.addFolder("Translation");
  translationFolder.add(controls.translate, "x", -10, 10);
  translationFolder.add(controls.translate, "y", -10, 10);
  translationFolder.add(controls.translate, "z", -10, 10);

  const rotationFolder = gui.addFolder("Rotation");
  rotationFolder.add(controls.rotate, "x", 0, 2 * Math.PI);
  rotationFolder.add(controls.rotate, "y", 0, 2 * Math.PI);
  rotationFolder.add(controls.rotate, "z", 0, 2 * Math.PI);

  // might be better to accept different callbacks (callback object) for model matrix updates and camera updates
  Object.values(gui.__folders).forEach((folder) => {
    folder.__controllers.forEach((controller) => {
      controller.onChange(callback);
    });
  });
}
