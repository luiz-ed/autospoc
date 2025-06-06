const { readFile, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const DATA_PATH = './data.json';
const WRITE_PATH = "./bucha-de-canhao-da-poc.txt"


async function readData(){
  try {
    return JSON.parse(await readFile(resolve(__dirname, DATA_PATH), 'utf8'));
  } catch (err) {
    console.error(`====================
    || ERRO @ READING ||
    ====================`, err);
    return null;
  }
}

// async function read(){
//   const data = await readData();
// console.log(data.map((screenData, index) => {
//     return `${index} - ${screenData.name}`;
//   }));

//   return;
// }
// read();


async function writeData(newData){
  const content = Array.isArray(newData) ? newData.join('\n') : String(newData);
  try {
    return await writeFile(resolve(__dirname, WRITE_PATH), content);
  } catch (e) {
    console.error(e.message);
    return null;
  }
}

module.exports =  { readData, writeData };
