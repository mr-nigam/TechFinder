import fs from 'fs';


const removeLocalFile = async (filePath) => {
  try {
    if (filePath) await fs.promises.unlink(filePath);
  } catch {}
};


export default removeLocalFile;
