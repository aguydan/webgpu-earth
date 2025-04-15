export async function createImageTexture(device: GPUDevice, path: string) {
  const image = await fetch(path);
  const blob = await image.blob();

  const bitmap = await createImageBitmap(blob, {
    colorSpaceConversion: "none",
  });

  const texture = device.createTexture({
    size: [bitmap.width, bitmap.height],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: bitmap, flipY: true },
    { texture: texture },
    { width: bitmap.width, height: bitmap.height },
  );

  return texture;
}
