export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // result is a data URL like: data:<mime>;base64,<data>
      const [, base64Data] = String(result).split(",");
      resolve({
        filename: file.name,
        size: file.size,
        type: file.type,
        base64: base64Data,
      });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};
