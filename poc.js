const dirtyEntryString = `
SPOC - CatingaSPOC - JacaréSPOC - Cadastro Solicitação de LavagemSPOC - Movimentação de Veículos RetroativaSPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
`;
/*
SPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
SPOC - Cadastro Solicitação de LavagemSPOC - Movimentação de Veículos RetroativaSPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos
*/
import { readData, writeData } from './fsUtils.js';

const sanitizeEntryString = (inputString) => inputString
.split(/SPOC - /) // Splits "SPOC - "
.filter(desc => desc.trim() !== "") // Empty entries
.map(desc => desc.trim()); // the \n at the end

const SCREENS_DEMANDED = sanitizeEntryString(dirtyEntryString);
const SOURCE_OF_TRUTH = await readData();

const getElementsByName = (itensEntry) => {
  const found = SOURCE_OF_TRUTH.filter((screenData) => 
    itensEntry.includes(screenData.name));

    const notFound = itensEntry.filter(screenEntry => 
      !SOURCE_OF_TRUTH.some(screenData => screenData.name === screenEntry));
      
    return {
      found,
      notFound
    };

}

const minorSpocValuesByName = () => {
  const nonCriticalSpocValues = getElementsByName(SCREENS_DEMANDED).found
    .map((el) => el.spocValues.nonCritical);

  return nonCriticalSpocValues.flat()
}

const roleNotesFormatter = () => {
  const screensDemandedData = getElementsByName(SCREENS_DEMANDED).found;

  const isThereAnyNote = screensDemandedData.find(({ spocValues: { note } }) => note.exists === true)

  if (!isThereAnyNote) {
    return false;
  }

  const screensDemandedThatHasRolesData = screensDemandedData
    .filter(({ spocValues: { note } }) => note.exists === true);
    
  const readyToReadRoleNotes = screensDemandedThatHasRolesData.map(({name, spocValues: { note: { type } }}) => {
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


async function main(){
  const notFound = getElementsByName(SCREENS_DEMANDED).notFound;
  const notesChecker = outputRoleNotes(SCREENS_DEMANDED);
  
  let output = [];
  
  const minorRun = minorSpocValuesByName();

  if (!notesChecker) {
    output = minorRun;
  }

  output = minorRun.concat(['', ''], notesChecker);

  if (notFound.length > 0) {
    output = output.concat(['', ''], notFound.map(name => `Tela "${name}" não encontrada!!`));
  }

return await writeData(output)
}
main();


/*
TODO #2

Processar os GF, mas cortando todos os críticos, com "sup" no nome.
*/