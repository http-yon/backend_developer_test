const express = require('express');
const { access } = require('fs');
const fs = require('fs').promises;

//helpers
const compareDates = require('./helpers/compareDates.js');
const checkOutput = require('./helpers/checkOutput.js');


const app = express();
const PORT = 20000;

app.use(express.json());

const DATA_FOLDER = 'data';



























//funcion para verificar si el usuario tiene o no permisos
const verifyUser = async (authorization, account, whatForm, typeCrud) => {
  try {
    //traemos datos de users y accounts
    const userData = await loadData("users");
    const accData = await loadData("accounts");

    //traemos usuario para autenticar
    const user = userData[authorization];

    if (!user) {
      return { respond: false, error: "usuario no encontrado" }
    }

    //detectar si el usuario tiene la msima account que quiere modificar
    let mismoAccount = Object.values(user.accounts).find(data => data.name.toLowerCase() === account.toLowerCase())

    //si no la tiene, no puede crear
    if (!mismoAccount) {
      return ({ respond: false, error: "no se puede crear ya que no perteneces a el account" })
    }

    //traer el account segun el rol del usuario
    const userAccount = Object.values(accData).find(data => data.name.toLowerCase() === mismoAccount.name.toLowerCase())

    //traer el form1 del usuario (encargado de las cosechas) y ver permisos
    const formPermissions = userAccount.roles[mismoAccount.role].permissions[whatForm][typeCrud];

    if (!formPermissions) {
      return { respond: false, error: "no tiene permisos para modificar un nuevo elemento o no cuentas con este formulario" }

    }

    return { respond: true, message: "usuario valido para realizar la solicitud" }

  } catch (error) {
    console.log(error);
    return { respond: false, error: "no se pudo verificar el usuario" }
  }
}



////////////////Servicio número 1//////////////////////////
app.get("/users/acc-permissions/:idUser", async (req, res) => {
  const { idUser } = req.params
  try {

    const userData = await loadData("users")
    const accountData = await loadData("accounts")
    const user = userData[idUser]

    const accountDataObj = Object.values(accountData);
    const userDataObj = Object.values(user.accounts);


    const arrayWithRoles = []

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
app.post("/harvest/:authorization/:account", async (req, res) => {
  const { authorization, account } = req.params
  const dataPost = req.body

  try {
    const formData = await loadData("forms");
    const cosechasData = await loadData("cosechas");

    const verification = await verifyUser(authorization, account, "form1", "create")
    if (verification.respond !== true) {
      return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
    }

    const invalidFields = formData.form1.fields.filter(data => !Object.keys(dataPost).includes(data.field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
    }

    if (typeof (dataPost.quantity) !== "number") {
      return res.status(400).json({ error: "el valor de quantity debe ser de tipo numerico" })
    }

    const response = [
      {
        id: new Date(),
        data: dataPost
      },
      ...cosechasData
    ];

    await saveData("cosechas", response);
    res.json({ response: "agregado correctamente", data: dataPost })


  } catch (error) {
    console.log(error);
    res.json("error del sistema")
  }
})
//////////////////////////////////////////////////////////



////////////////Servicio número 3//////////////////////////

//get
app.get("/fermentation/get/:authorization/:account", async (req, res) => {
  const { authorization, account } = req.params

  try {
    const fermentacionData = await loadData("fermentacion")

    const verification = await verifyUser(authorization, account, "form3", "read")

    if (verification.respond !== true) {
      return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
    }

    const totalFermentaciones = fermentacionData.length;
    let totalDays = 0;
    let totalWeightLoss = 0;

    fermentacionData.forEach(fermentacion => {
      const startDate = new Date(fermentacion.data.start_date);
      const endDate = new Date(fermentacion.data.end_date);
      const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24); 
      totalDays += daysDiff;
      totalWeightLoss += (fermentacion.data.input - fermentacion.data.output) / fermentacion.data.input;
    });

    const avgDays = totalDays / totalFermentaciones;
    const avgWeightLoss = totalWeightLoss / totalFermentaciones;

    res.json({
      data: fermentacionData,
      summary: {
        avg_days: avgDays.toFixed(2),
        avg_weight_loss: avgWeightLoss.toFixed(4)
      }
    });

  } catch (error) {
    console.log(error)
    return { error: "error en la solicutud" }

  }
})

//post
app.post("/fermentation/post/:authorization/:account", async (req, res) => {
  const { authorization, account } = req.params
  const newData = req.body

  try {
    const fermentacionData = await loadData("fermentacion")
    const formData = await loadData("forms");

    const verification = await verifyUser(authorization, account, "form3", "read")

    if (verification.respond !== true) {
      return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
    }

    const invalidFields = formData.form3.fields.filter(data => !Object.keys(newData).includes(data.field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
    }


    if (!compareDates(newData.start_date, newData.end_date)) {
      return res.json({ error: "fecha de inicio es mayor que la fecha de salida" })
    }

    if (!checkOutput(newData.input, newData.output)) {
      return res.json({ error: "la cantidad de salida no puede ser mayor a la cantidad de entrada" })
    }

    const response = [
      {
        id: new Date(),
        data: newData
      },
      ...fermentacionData
    ];

    await saveData("fermentacion", response);
    res.json({ response: "agregado correctamente", data: newData })

  } catch (error) {
    console.log(error)
    return { error: "error en la solicutud" }
  }

})

//delete
app.delete("/fermentation/delete/:authorization/:account/:id", async (req, res) => {
  const { authorization, account, id } = req.params

  try {
    const fermentacionData = await loadData("fermentacion")

    const verification = await verifyUser(authorization, account, "form3", "delete")

    if (verification.respond !== true) {
      return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
    }


    const newFermData = fermentacionData.filter(item => item.id !== id);

    if (newFermData.length === fermentacionData.length) {
      return res.json({ response: "No se encontro el dato" });
    }

    await saveData("fermentacion", newFermData);
    res.json({ response: "Eliminado correctamente" });


  } catch (error) {
    console.log(error)
    return { error: "error en la solicutud" }
  }

})

//put
app.put("/fermentation/put/:authorization/:account/:id", async (req, res) => {
  const { authorization, account, id } = req.params
  const dataBody = req.body

  try {
    const fermentacionData = await loadData("fermentacion")
    const formData = await loadData("forms")

    const indexFiltrado = fermentacionData.findIndex(item => item.id === id);

    if (indexFiltrado === -1) {
      return res.status(404).json({ error: "usuario no existe en la db" });
    }

    const verification = await verifyUser(authorization, account, "form3", "update")

    if (verification.respond !== true) {
      return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
    }

    const invalidFields = formData.form3.fields.filter(data => !Object.keys(dataBody).includes(data.field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
    }

    if (!compareDates(dataBody.start_date, dataBody.end_date)) {
      return res.json({ error: "fecha de inicio es anterior que la fecha de salida" })
    }

    if (!checkOutput(dataBody.input, dataBody.output)) {
      return res.json({ error: "la cantidad de salida no puede ser mayor a la cantidad de entrada" })
    }

    const response = {
      id: fermentacionData[indexFiltrado].id,
      data: fermentacionData[indexFiltrado].data = dataBody
    }

    fermentacionData[indexFiltrado] = response

    await saveData("fermentacion", fermentacionData);
    res.json({ response: "modificado correctamente", data: dataBody })

  } catch (error) {
    console.log(error)
    return { error: "error en la solicutud" }
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

