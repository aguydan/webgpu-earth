export default async function createShaderModule(
  code: string,
  device: GPUDevice,
): Promise<GPUShaderModule> {
  const module = device.createShaderModule({
    code,
  });

  const compilationInfo = await module.getCompilationInfo();

  for (const message of compilationInfo.messages) {
    console.error(
      `Line ${message.lineNum || "?"}:${message.linePos || "?"} - 
            ${code.substring(message.offset, message.length + message.offset)}`,
    );
  }

  //temporary
  if (compilationInfo.messages.length) {
    throw new Error("WGSL error");
  }

  return module;
}
