import { readData, writeData } from './fsUtils.js';

const sanitizeEntryString = (inputString) => inputString
  .split(/SPOC - /)
  .filter(desc => desc.trim() !== "")
  .map(desc => desc.trim());

const getElementsByName = (itensEntry, SOURCE_OF_TRUTH) => {
  const found = SOURCE_OF_TRUTH.filter((screenData) =>
    itensEntry.includes(screenData.name));

  const notFound = itensEntry.filter(screenEntry =>
    !SOURCE_OF_TRUTH.some(screenData => screenData.name === screenEntry));

  return {
    found,
    notFound
  };
}

const minorSpocValuesByName = (SCREENS_DEMANDED, SOURCE_OF_TRUTH) => {
  const nonCriticalSpocValues = getElementsByName(SCREENS_DEMANDED, SOURCE_OF_TRUTH).found
    .map((el) => el.spocValues.nonCritical);

  return nonCriticalSpocValues.flat();
}

const roleNotesFormatter = (SCREENS_DEMANDED, SOURCE_OF_TRUTH) => {
  const screensDemandedData = getElementsByName(SCREENS_DEMANDED, SOURCE_OF_TRUTH).found;

  const isThereAnyNote = screensDemandedData.find(({ spocValues: { note } }) => note.exists === true)

  if (!isThereAnyNote) {
    return false;
  }

  const screensDemandedThatHasRolesData = screensDemandedData
    .filter(({ spocValues: { note } }) => note.exists === true);

  const readyToReadRoleNotes = screensDemandedThatHasRolesData.map(({ name, spocValues: { note: { type } } }) => {
    const deserialize = type.map(({ role, spocValues: { critical, nonCritical } }) => {
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

function outputRoleNotes(SCREENS_DEMANDED, SOURCE_OF_TRUTH) {
  const data = roleNotesFormatter(SCREENS_DEMANDED, SOURCE_OF_TRUTH);

  if (!data) {
    return false
  }

  const result = [];

  data.forEach(({ screen, deserialize }) => {
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

export default async function main(dirtyEntryString) {
  const SOURCE_OF_TRUTH = await readData();
  const SCREENS_DEMANDED = sanitizeEntryString(dirtyEntryString);

  const notFound = getElementsByName(SCREENS_DEMANDED, SOURCE_OF_TRUTH).notFound;
  const notesChecker = outputRoleNotes(SCREENS_DEMANDED, SOURCE_OF_TRUTH);

  let output = [];

  const minorRun = minorSpocValuesByName(SCREENS_DEMANDED, SOURCE_OF_TRUTH);

  output = minorRun

  if (notesChecker) {
    output = minorRun.concat(['', ''], notesChecker);
  }  

  if (notFound.length > 0) {
    output = output.concat(['', ''], notFound.map(name => `Tela "${name}" não encontrada!!`));
  }

  return output;
  // return await writeData(output)
}

// async function runner() {
//   const result = await main(`SPOC - CatingaSPOC - JacaréSPOC - Cadastro Solicitação de LavagemSPOC - Movimentação de Veículos RetroativaSPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos`)
//   return console.log(result);
// } 
// runner();
