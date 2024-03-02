////////////////Servicio número 1//////////////////////////

app.get("/users/acc-permissions/:idUser", async (req, res) => {
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
  
      //preparamos respuesta
      const response = {
        accounts: Object.keys(userDataObj).map(userId => {
          const { role, ...userDataWithoutRole } = userDataObj[userId];
          return userDataWithoutRole;
        }),
        form: arrayWithRoles
      };
  
      //mostramos en formato json
      res.json(response)
  
    } catch (error) {
      res.json("error del sistema")
      console.log(error);
    }
  })