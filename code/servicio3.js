////////////////Servicio número 3//////////////////////////

//get
app.get("/fermentation/get/:authorization/:account", async (req, res) => {
    const { authorization, account } = req.params

    try {

        //traemos datos de fermentacion
        const fermentacionData = await loadData("fermentacion")

        //validando autorizacion del usuario para leer (read)
        const verification = await verifyUser(authorization, account, "form3", "read")

        if (verification.respond !== true) {
            return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
        }

        // Calcular promedio de días transcurridos y promedio de merma
        const totalFermentaciones = fermentacionData.length;
        let totalDays = 0;
        let totalWeightLoss = 0;

        fermentacionData.forEach(fermentacion => {
            const startDate = new Date(fermentacion.data.start_date);
            const endDate = new Date(fermentacion.data.end_date);
            const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24); // para convertir a dias
            totalDays += daysDiff;
            totalWeightLoss += (fermentacion.data.input - fermentacion.data.output) / fermentacion.data.input; // porcentaje de merma
        });

        //datos de merma y promedio de dias
        const avgDays = totalDays / totalFermentaciones;
        const avgWeightLoss = totalWeightLoss / totalFermentaciones;

        // preparamos respuesta con todo lo pedido
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
        //traemos los datos de fermentacion y formulario
        const fermentacionData = await loadData("fermentacion")
        const formData = await loadData("forms");


        //verificamos el usuario
        const verification = await verifyUser(authorization, account, "form3", "read")

        if (verification.respond !== true) {
            return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
        }

        //verificamos si coincide on la estructura del form
        const invalidFields = formData.form3.fields.filter(data => !Object.keys(newData).includes(data.field));

        if (invalidFields.length > 0) {
            return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
        }


        // validamos que la fecha de salida sea mayor o igual a la fecha de entrada
        if (!compareDates(newData.start_date, newData.end_date)) {
            return res.json({ error: "fecha de inicio es mayor que la fecha de salida" })
        }

        // validamos que la cantidad de salida sea menor o igual a la cantidad de entrada.
        if (!checkOutput(newData.input, newData.output)) {
            return res.json({ error: "la cantidad de salida no puede ser mayor a la cantidad de entrada" })
        }

        //creamos respuesta para enviar
        const response = [
            {
                id: new Date(),
                data: newData
            },
            ...fermentacionData
        ];

        //enviamos a la db simulada
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
        //traemos los datos de fermentacion
        const fermentacionData = await loadData("fermentacion")

        //verificamos el usuario para form 3
        const verification = await verifyUser(authorization, account, "form3", "delete")

        if (verification.respond !== true) {
            return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
        }


        // Eliminamos el elemento con el ID especificado
        const newFermData = fermentacionData.filter(item => item.id !== id);

        //verificar si elimino algo o no
        if (newFermData.length === fermentacionData.length) {
            return res.json({ response: "No se encontro el dato" });
        }

        //mandar respusta a db
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
        //traemos los datos de fermentacion
        const fermentacionData = await loadData("fermentacion")
        const formData = await loadData("forms")

        //verificamos si el id esta en la db
        const indexFiltrado = fermentacionData.findIndex(item => item.id === id);

        if (indexFiltrado === -1) {
            return res.status(404).json({ error: "usuario no existe en la db" });
        }

        //verificamos el usuario
        const verification = await verifyUser(authorization, account, "form3", "update")

        if (verification.respond !== true) {
            return res.json({ error: "usuario no verificado o sin permisos para realizar la peticion", reason: verification.error })
        }

        //verificamos si coincide on la estructura del form
        const invalidFields = formData.form3.fields.filter(data => !Object.keys(dataBody).includes(data.field));

        if (invalidFields.length > 0) {
            return res.status(400).json({ error: "No se cumple con la estructura del formulario", invalidFields });
        }

        //verificamos si fecha de inicio es anterior que la fecha de salida
        if (!compareDates(dataBody.start_date, dataBody.end_date)) {
            return res.json({ error: "fecha de inicio es anterior que la fecha de salida" })
        }

        // validamos que la cantidad de salida sea menor o igual a la cantidad de entrada.
        if (!checkOutput(dataBody.input, dataBody.output)) {
            return res.json({ error: "la cantidad de salida no puede ser mayor a la cantidad de entrada" })
        }

        //creamos respuesta modificada
        const response = {
            id: fermentacionData[indexFiltrado].id,
            data: fermentacionData[indexFiltrado].data = dataBody
        }

        //modificamos el valor
        fermentacionData[indexFiltrado] = response

        //enviamos a la db
        await saveData("fermentacion", fermentacionData);
        res.json({ response: "modificado correctamente", data: dataBody })

    } catch (error) {
        console.log(error)
        return { error: "error en la solicutud" }
    }
})
