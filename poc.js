const DIRTY_ENTRY_STRING = `
SPOC - Movimentação de Veículos RetroativaSPOC - Cadastro Solicitação de LavagemSPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
`;
/*
SPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
SPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
*/
import { readData, writeData } from './fsUtils.js';

const sanitizeEntryString = (inputString) => inputString
.split(/SPOC - /) // Splits "SPOC - "
.filter(desc => desc.trim() !== "") // Empty entries
.map(desc => desc.trim()); // the \n at the end

const SCREENS_DEMANDED = sanitizeEntryString(DIRTY_ENTRY_STRING);
const SOURCE_OF_TRUTH = await readData();

const getElementsByName = (itensEntry) => {
  return SOURCE_OF_TRUTH.filter((screenData) => {
    return itensEntry.find((screenDemanded) => screenData.name === screenDemanded)
  });
}

const minorSpocValuesByName = () => {
  const nonCriticalSpocValues = getElementsByName(SCREENS_DEMANDED)
    .map((el) => el.spocValues.nonCritical);
  return nonCriticalSpocValues.flat()
}

const roleNotesFormatter = () => {
  const screensDemandedData = getElementsByName(SCREENS_DEMANDED);

  const isThereAnyNote = screensDemandedData.find(({ spocValues: { note } }) => note.exists === true)

  if (!isThereAnyNote) {
    return false;
  }

  const screensDemandedThatHasRolesData = screensDemandedData
    .filter(({ spocValues: { note } }) => note.exists === true);
    
  const readyToReadRoleNotes = screensDemandedThatHasRolesData.map(({name, spocValues: { note: { type } }})=> {
    const deserialize = type.map(( { role, spocValues: { critical, nonCritical } } ) => {
      return {
        role: role,
        nonCriticalSpocValues: nonCritical,
        criticalSpocValues: critical
      }
    })

    return {
      screen: name,
      deserialize
    }
  });

return readyToReadRoleNotes;
}

function outputRoleNotes(dirty) {
  const data = roleNotesFormatter();

  if (!data) {
    return false
  }
  
  const result = [];

  dirty = data

  dirty.forEach(({ screen, deserialize }) => {
    // "deserialize" pode ser um array de arrays de objetos
    deserialize.flat().forEach(({ role, nonCriticalSpocValues, criticalSpocValues }) => {      
      let line = `[${role}] ${screen}: ${nonCriticalSpocValues.join(';')}`;

      if (criticalSpocValues && criticalSpocValues.length > 0) {
        line += ` (CRÍTICOS ${criticalSpocValues.join(', ')})`;
      }

      result.push(line);
    });
  });

  return result;
}
// outputRoleNotes(SUJO);


async function main(){
  const notesChecker = outputRoleNotes(DIRTY_ENTRY_STRING);
  
  if (!notesChecker) {
    return minorSpocValuesByName();
  }
  
  const minorRun = minorSpocValuesByName();
  
  const output = minorRun.concat(notesChecker)

  
  
  
  
return await writeData(output)
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