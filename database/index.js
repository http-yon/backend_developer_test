const express = require('express');
const fs = require('fs').promises;

const app = express();
const PORT = 20000;

app.use(express.json());

const DATA_FOLDER = 'data';

/**
 * Load data from JSON file
 * @param {String} entity - Entity name
 * @returns {Object} Object with data from JSON file
 */
const loadData = async (entity) => {
  try {
    const fileData = await fs.readFile(`${DATA_FOLDER}/${entity}.json`, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    console.error(`Error reading ${entity} JSON file:`, err);
    return {};
  }
};

/**
 * Save data to JSON file
 * @param {String} entity - Entity name
 * @param {Object} data - Data to save to JSON file
 */
const saveData = async (entity, data) => {
  try {
    await fs.writeFile(`${DATA_FOLDER}/${entity}.json`, JSON.stringify(data, null, 4), 'utf8');
  } catch (err) {
    console.error(`Error saving ${entity} data to JSON file:`, err);
  }
};

app.get('/:entity', async (req, res) => {
  const { entity } = req.params;
  const data = await loadData(entity);
  res.json(data);
});

app.get('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  res.json(data[id]);
});

app.post('/:entity', async (req, res) => {
  const { entity } = req.params;
  const id = Date.now();
  const record = req.body;
  const data = await loadData(entity);
  data[id] = record;
  await saveData(entity, data);
  res.status(201).send('Record added');
});

app.put('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const record = req.body;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  data[id] = record;
  await saveData(entity, data);
  res.send('Record updated');
});

app.delete('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  delete data[id];
  await saveData(entity, data);
  res.send('Record deleted');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
