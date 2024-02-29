const express = require('express');
const { access } = require('fs');
const fs = require('fs').promises;

const app = express();
const PORT = 20000;

app.use(express.json());

const DATA_FOLDER = 'data';

////////////////Servicio número 1//////////////////////////
app.get("/users/:idUser", async (req, res) => {
  const { idUser } = req.params
  try {

    //traemos datos de usuarios y cuentas
    const userData = await loadData("users")
    const accountData = await loadData("accounts")

    //cuentas que tienen el usuario en cuestion
    const user = userData[idUser]

    //convertimos a obj Object para iterar
    const accountDataObj = Object.values(accountData);
    const userDataObj = Object.values(user.accounts);


    //aca se almacenan los detalles del rol al que pertenece el usuario junto a sus permisos
    const arrayWithRoles = []

    //iteramos datos de account para encontrar los que tiene el usuario
    //cuando detecta uno igual lo pushea a arrayWithRoles
    accountDataObj.map((eleAcc) => {
      userDataObj.map((eleUser) => {
        if (eleUser.name === eleAcc.name) {
          arrayWithRoles.push({
            AccountName: eleAcc.name,
            formName: eleAcc.roles[eleUser.role].name
          })
        }
      })
    })

    const response = {
      accounts: Object.keys(userDataObj).map(userId => {
        const { role, ...userDataWithoutRole } = userDataObj[userId];
        return userDataWithoutRole;
      }),
      form: arrayWithRoles
    };

    res.json(response)

  } catch (error) {
    res.json("error del sistema")
    console.log(error);
  }
})
//////////////////////////////////////////////////////////


////////////////Servicio número 2//////////////////////////
app.get("/harvest/:authorization/:account", async (req, res) => {
  const { authorization, account } = req.params
  try {
    const userData = await loadData("users");
    const formData = await loadData("forms");
    const accData = await loadData("accounts");

    //traemos usuario para autenticar
    const user = userData[authorization];

    let x = new Set();



    Object.values(accData).map((dataAc) => {
      Object.values(user.accounts).map((dataUser) => {
        //detectar que cuentas tiene el usuario
        if (dataAc.name.includes(dataUser.name)) {
          x.add(dataAc)
        }
      })


    })


    console.log(x);

    //auth
    //paso 1- verificar que accounts tiene
    //debe tener el rol que es
    //console.log(userAcc.accounts);




    /* Object.values(userAcc.accounts).map(data=>{
      if (data.name === account) {
        console.log("cauchos");
      }
    }); */

    /* if (auth.accounts.includes(account)) {
      console.log("Se puede");
    } else {
      console.log("No se puede");
    } */



    res.json("in process")
  } catch (error) {
    console.log(error);
    res.json("error del sistema")
  }
})
//////////////////////////////////////////////////////////



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
