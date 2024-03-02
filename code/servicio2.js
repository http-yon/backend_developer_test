////////////////Servicio número 2//////////////////////////

app.post("/harvest/:authorization/:account", async (req, res) => {
    const { authorization, account } = req.params
    const dataPost = req.body
  
    try {

      //traemos datos de los json
      const formData = await loadData("forms");
      const cosechasData = await loadData("cosechas");
  
      //verificamos permisos del usuario en el create del form1
      const verification = await verifyUser(authorization, account, "form1", "create")
      if (verification.respond !== true) {
        return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
      }
  
      //verificar si cumple con la estructura del form
      const invalidFields = formData.form1.fields.filter(data => !Object.keys(dataPost).includes(data.field));
  
      if (invalidFields.length > 0) {
        return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
      }
  
      //verificar el tipo de dato
      if (typeof (dataPost.quantity) !== "number") {
        return res.status(400).json({ error: "el valor de quantity debe ser de tipo numerico" })
      }
  
      //preparamos respuesta para enviar
      const response = [
        {
          id: new Date(),
          data: dataPost
        },
        ...cosechasData
      ];
  
      //enviamos a la db simulada
      await saveData("cosechas", response);
      res.json({ response: "agregado correctamente", data: dataPost })
  
  
    } catch (error) {
      console.log(error);
      res.json("error del sistema")
    }
  })