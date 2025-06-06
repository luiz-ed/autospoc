const DIRTY_ENTRY_STRING = `
Administração de CRLV Digital
`;

const { readData, writeData } = require('./fsUtils.js');

const sanitizeEntryString = (inputString) => inputString
  .split(/SPOC - /) // Divide a string onde encontra "SPOC - "
  .filter(desc => desc.trim() !== "") // Remove entradas vazias
  .map(desc => desc.trim()); // Remove espaços extras

async function processAndMatch(imputString) {
  const SOURCE_OF_TRUTH = await readData();  
  const screensDemanded = sanitizeEntryString(imputString);

  const screensMatched = [];

  screensDemanded
  .forEach((screenNameDemanded) => 
    screensMatched.push(
      ...SOURCE_OF_TRUTH.filter((screenData) => screenData.name === screenNameDemanded)
        .map((matched) => matched.spocValues.nonCritical))
  )
return screensMatched.flat();
}
async function main(){
const runned = await processAndMatch(DIRTY_ENTRY_STRING);
await writeData(runned)

return;
}
main();