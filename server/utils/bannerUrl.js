// Turns an uploaded (in-memory) file into a data URL that can be stored in MongoDB.
export const fileToDataUrl = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
