const path = require('path');
const fs = require('fs');
const axios = require('axios');
const zlib = require('zlib');

const downloadFile = async (url, path) => {
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        if(response.status != 200){
            console.log("Error downloading demo: " + url);
            return;
        }

        const writer = fs.createWriteStream(path);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(error);
    }
}

const decompressFile = async (filePath) => {
    const decompressedFilePath = filePath.replace('.gz', '');
  
    const compressedReadStream = fs.createReadStream(filePath);
    const decompressedWriteStream = fs.createWriteStream(decompressedFilePath);
  
    compressedReadStream.pipe(zlib.createGunzip()).pipe(decompressedWriteStream);
  
    return new Promise((resolve, reject) => {
        decompressedWriteStream.on('finish', () => {
            resolve(decompressedFilePath);
        });
  
        decompressedWriteStream.on('error', (error) => {
            reject(error);
        });
    });
};

const deleteFile = (filePath) => {
    fs.unlinkSync(filePath);
}

module.exports = {
    downloadFile,
    decompressFile,
    deleteFile
}