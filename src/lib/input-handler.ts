/* 
  let prev = {
    x: 0,
    y: 0,
  };

  const sensitivity = 0.001;
  let shouldRequest = true;

  let yawFactor = 0;
  let pitchFactor = 0;

  canvas.addEventListener("mousemove", (e) => {
    if (!shouldRequest) return;

    shouldRequest = false; */

/*
    requestAnimationFrame(() => {
      if (prev.x === 0 && prev.y === 0) {
        (prev.x = e.clientX), (prev.y = e.clientY);
      }

      const current = { x: e.clientX, y: e.clientY };

      yawFactor += (e.clientY - prev.y) * sensitivity;
      pitchFactor += (prev.x - e.clientX) * sensitivity;

      settings.cameraYaw = Math.PI * Math.min(Math.max(yawFactor, 0), 1);
      settings.cameraPitch = (2 * Math.PI * pitchFactor) % (2 * Math.PI);

            updateUniforms(timeValue, matrixValue, settings);
      pass.render(uniformValues);

      prev = { ...current };

      shouldRequest = true;
    }); */
//   });
