import express from "express";
import cors from "cors";
import xlsx from "xlsx";
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';

import { readFile } from 'node:fs/promises';

const upload = multer({ dest: 'temp/' });

const swaggerDocument = JSON.parse(
  await readFile(new URL('./swagger.json', import.meta.url), 'utf-8')
);

const PORT = 3001;
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  res.set('Content-Type', 'text/plain');
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.set("Access-Control-Allow-Methods", '*');
  
  next();
});

app.use(cors());

app.listen(PORT, () => {
  console.log(`Listening @ PORT ${PORT}`)
});

import main from "./pocPartII.js"

const ENTRY_STRING = `SPOC - CatingaSPOC - JacaréSPOC - Cadastro Solicitação de LavagemSPOC - Movimentação de Veículos RetroativaSPOC - Atendimento 24HSPOC - Aviso SinistroSPOC - Consulta FornecedorSPOC - Consulta Movimentações do Veículo (RAC)SPOC - Consulta OrçamentosSPOC - Digitalização - SSSPOC - Fila de Aprovação de Orçamentos`

app.get('/process', async (req, res) => {
  const { screenSearched } = req.query;
  res.set('Content-Type', 'text/plain');
  
  const result = await main(screenSearched);
  
  if (!screenSearched) {
    return res.status(404).send("Tela para busca não encontrada");
  }

  return res.send(Array.isArray(result) ? result.join('\n') : String(result));
});


app.post('/parseFleet', upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];

  const range = xlsx.utils.decode_range(ws['!ref']);
  const fleetData = [];

  for (let row = 6; row <= range.e.r; row++) {
    const cellAddress = { c: 0, r: row };
    const cellRef = xlsx.utils.encode_cell(cellAddress);
    const cell = ws[cellRef];
    if (cell 
        && cell.v 
        !== undefined 
        && cell.v 
        !== null 
        && String(cell.v).trim() 
        !== "")
         {
      fleetData.push(cell.v);
    }
  }

  import('fs').then(fs => fs.unlinkSync(filePath));

  const output = fleetData.filter(el => !el.includes('Tf24SUP'));

  return res.send(Array.isArray(output) ? output.join('\n') : String(output));
});

app.get('/screensData', async (req, res) => {
  const result = await processAndMatch(DIRTY_ENTRY_STRING);

  if (!result) {
    return res.status(500).json({ success: false, message: 'Erro ao processar a string.' });
  }

 return res.status(200).json(result);
});

app.post('/screensData', async (req, res) => {
  const result = await processAndMatch(DIRTY_ENTRY_STRING);

  if (!result) {
    return res.status(500).json({ success: false, message: 'Erro ao processar a string.' });
  }

 return res.status(200).json(result);
});

app.patch('/screensData', async (req, res) => {
  const result = await processAndMatch(DIRTY_ENTRY_STRING);

  if (!result) {
    return res.status(500).json({ success: false, message: 'Erro ao processar a string.' });
  }

 return res.status(200).json(result);
});

app.delete('/screensData', async (req, res) => {
  const result = await processAndMatch(DIRTY_ENTRY_STRING);

  if (!result) {
    return res.status(500).json({ success: false, message: 'Erro ao processar a string.' });
  }

 return res.status(200).json(result);
});