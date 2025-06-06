const express = require('express');

const { readData } = require('./fsUtils.js');

const PORT = 3000;

const app = express();
app.use(express.json());


const sanitizeEntryString = (inputString) => inputString
  .split(/SPOC - /) // Divide a string onde encontra "SPOC - "
  .filter(desc => desc.trim() !== "") // Remove entradas vazias
  .map(desc => desc.trim()); // Remove espaços extras

const DIRTY_ENTRY_STRING = `SPOC - Administração de CRLV DigitalSPOC - Consulta Posição Diária De FrotaSPOC - Registro de Quilometragem Improdutiva`

async function processAndMatch(imputString) {
  const SOURCE_OF_TRUTH = await readData();
  console.log(SOURCE_OF_TRUTH, "\n\n");

  const screensDemanded = sanitizeEntryString(imputString);
  console.log(`======================
|| SCREENS DEMANDED ||
======================`, screensDemanded, '\n\n');


  // return SOURCE_OF_TRUTH.filter(screenData =>
  //   // Verifica se o nome do screen está contido na string de entrada
  //   screensDemanded.some(screenNameDemanded => screenData.name.includes(screenNameDemanded))
  // ).forEach(screenMatched => {
  //   // Aqui você pode fazer o que quiser com os screens filtrados
  //   console.log(screenMatched.spocValues.nonCritical);
  // });

  const screensMatched = [];

  screensDemanded
  .forEach((screenNameDemanded) => {
  // screensMatched.push(SOURCE_OF_TRUTH.filter((screenData) => screenData.name === screenNameDemanded))
  screensMatched.push(...SOURCE_OF_TRUTH.filter((screenData) => screenData.name === screenNameDemanded)
    .map((matched) => matched.spocValues.nonCritical));
  
    }
  )
return screensMatched.flat();
}

processAndMatch(DIRTY_ENTRY_STRING);

app.get('/', (req, res) => {
  return res.send('Hello World!')
});

app.get('/process', async (req, res) => {
  const result = await processAndMatch(DIRTY_ENTRY_STRING);

  if (!result) {
    return res.status(500).json({ success: false, message: 'Erro ao processar a string.' });
  }

 return res.status(200).json(result);
});


app.listen(PORT, () => {
  console.log(`Listening @ PORT ${PORT}`)
});