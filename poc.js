const DIRTY_ENTRY_STRING = `
SPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
`;

const { readData, writeData } = require('./fsUtils.js');

const sanitizeEntryString = (inputString) => inputString
  .split(/SPOC - /) // Splits "SPOC - "
  .filter(desc => desc.trim() !== "") // Empty entries
  .map(desc => desc.trim()); // to be shure

async function processAndMatch(imputString) {
  const SOURCE_OF_TRUTH = await readData();  
  const screensDemanded = sanitizeEntryString(imputString);

  const screensMatched = [];

  screensDemanded
  .forEach((screenDemandedName) => 
    screensMatched.push(
      ...SOURCE_OF_TRUTH.filter((screenData) => screenData.name === screenDemandedName)
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



/* TODO #1

Ao enviar o verbo POST, verificar, das telas do payload, se todas já se encontram no banco

O retorno deve ser o código das telas, mas, também a informação que tela X não foi encontrada

EX:
  payload:
SPOC - Tela de Fazer IssoSPOC - Tela faz Aquilo

output:

5413
3546

"SPOC - Tela faz Aquilo" não encontrada


TODO #2

Processar os GF, mas cortando todos os críticos, com "sup" no nome.
*/