# DESARROLLO PRUEBA TECNICA - Galapp



> [!NOTE]
>
> LA EXPLICACION DEL CODIGO SE ENCUENTRA EN LA CARPETA "code", PERO ESTAS FUNCIONES ESTAN IMPLEMENTADAS DIRECTAMENTE EN **index.js** O COMO UN **HELPER**



### INSTRUCCIONES

#### Paso 1

Descargar el repositorio y dirigirse a la carpeta "database"

```powershell
cd database
```



#### Paso 2

Instalar todas las dependencias

```powershell
npm i
```



#### Paso 3

Correr el programa con localhost

```powershell
npm run dev
```



Esto dará inicio a nuestro programa que se ejecutara en ->  http://localhost:20000

---



### SERVICIO 1

Consultar las cuentas a las que un usuario tiene acceso y los formularios dentro de cada cuenta a los que puede acceder con el permiso de lectura



**METODO:** GET

**ENDPOINT** -> http://localhost:20000/users/acc-permissions/:idUser



- **idUser** -> usuario al que se quiere averiguar los permisos y accounts 
- lo puse en la ruta de **account** debido a que se esta interactuando directamente con el mismo y se esta averiguando datos específicos del mismo



**EJEMPLO DE USO** -> http://localhost:20000/users/acc-permissions/user2

Esto dará el siguiente formato:

```json
{
  "accounts": [
    {
      "name": "Café"
    }
  ],
  "form": [
    {
      "AccountName": "Café",
      "formName": "Administrador finca"
    }
  ]
}
```

---



### SERVICIO 2

Creación de registros de cosecha.



> [!IMPORTANT]
>
> - para simular la base de datos de cosecha y poder implementar las solicitudes, he creado un nuevo archivo tipo json llamado **cosechas.json**
> - Como los datos no tenían identificador, decidí crearlo con la fecha actual en la que se crean



**METODO:** POST

**ENDPOINT** -> http://localhost:20000/harvest/:authorization/:account

- **authorization** -> el usuario que esta haciendo la solicitud
- **account** -> nombre de la cuenta para validar permisos 
- Probar para verificar validaciones



**EJEMPLO DE USO** -> http://localhost:20000/users/acc-permissions/user2

ingresamos en el body el siguiente json

```json
{
    "date": "2028-02-02T00:34:44.075Z",
    "employee": "yohan pedraza",
    "quantity": 100
}
```



Esto dará la siguiente respuesta:

```json
{
    "response": "agregado correctamente",
    "data": {
        "date": "2028-02-02T00:34:44.075Z",
        "employee": "yohan pedraza",
        "quantity": 100
    }
}
```

---



### SERVICIO 3

CRUD de registros de fermentación.



> [!IMPORTANT]
>
> - para simular la base de datos de fermentacion y poder implementar las solicitudes, he creado un nuevo archivo tipo json llamado **fermentacion.json**
> - Como los datos no tenían identificador, decidí crearlo con la fecha actual en la que se crean



### GET

**ENDPOINT** -> http://localhost:20000/fermentation/get/:authorization/:account

- **get** -> tipo de solicitud para no confundir
- **authorization** -> el usuario que esta haciendo la solicitud
- **account** -> nombre de la cuenta para validar permisos 
- Probar para verificar validaciones



**EJEMPLO DE USO** -> http://localhost:20000/fermentation/get/user3/cacao

Esto dará la siguiente respuesta:

```json
{
    "data": [
        {
            "id": "2024-03-02T04:44:35.335Z",
            "data": {
                "start_date": "2027-02-02T00:34:44.075Z",
                "input": 100,
                "end_date": "2029-02-02T00:34:44.075Z",
                "output": 90
            }
        },
        {
            "id": "2024-03-02T04:44:28.863Z",
            "data": {
                "start_date": "2027-02-02T00:34:44.075Z",
                "input": 100,
                "end_date": "2029-02-02T00:34:44.075Z",
                "output": 90
            }
        },
        {
            "id": "2024-03-02T04:43:49.731Z",
            "data": {
                "start_date": "2027-02-02T00:34:44.075Z",
                "input": 100,
                "end_date": "2029-02-02T00:34:44.075Z",
                "output": 90
            }
        },
        {
            "id": "2024-03-02T04:42:58.116Z",
            "data": {
                "start_date": "2027-02-02T00:34:44.075Z",
                "input": 100,
                "end_date": "2029-02-02T00:34:44.075Z",
                "output": 90
            }
        },
        {
            "id": "2024-03-02T04:42:51.275Z",
            "data": {
                "start_date": "2010-02-02T00:34:44.075Z",
                "input": 100,
                "end_date": "2029-02-02T00:34:44.075Z",
                "output": 90
            }
        }
    ],
    "summary": {
        "avg_days": "1972.80",
        "avg_weight_loss": "0.1000"
    }
}
```

---



### POST

**ENDPOINT** -> http://localhost:20000/fermentation/post/:authorization/:account

- **post** -> tipo de solicitud para no confundir
- **authorization** -> el usuario que esta haciendo la solicitud
- **account** -> nombre de la cuenta para validar permisos 
- Probar para verificar validaciones



**EJEMPLO DE USO** -> http://localhost:20000/fermentation/post/user3/cacao

Ingresamos en el body el siguiente json

```json
{
    "start_date":"2027-02-02T00:34:44.075Z",
    "input":100,
    "end_date":"2029-02-02T00:34:44.075Z",
    "output":90
}
```



Esto dará la siguiente respuesta:

```json
{
    "response": "agregado correctamente",
    "data": {
        "start_date": "2027-02-02T00:34:44.075Z",
        "input": 100,
        "end_date": "2029-02-02T00:34:44.075Z",
        "output": 90
    }
}
```

---



### PUT

**ENDPOINT** -> http://localhost:20000/fermentation/put/:authorization/:account/:id

- **put** -> tipo de solicitud para no confundir
- **authorization** -> el usuario que esta haciendo la solicitud
- **account** -> nombre de la cuenta para validar permisos 
- **id** -> donde se va a hacer la modificación
- Probar para verificar validaciones



**EJEMPLO DE USO** -> http://localhost:20000/fermentation/put/user1/cacao/2024-03-02T04:42:51.275Z

Ingresamos en el body el siguiente json que contiene las modificaciones

```json
{
    "start_date": "2010-02-02T00:34:44.075Z",
    "input": 100,
    "end_date": "2029-02-02T00:34:44.075Z",
    "output": 90
}
```



Esto dará la siguiente respuesta:

```json
{
    "response": "modificado correctamente",
    "data": {
        "start_date": "2010-02-02T00:34:44.075Z",
        "input": 100,
        "end_date": "2029-02-02T00:34:44.075Z",
        "output": 90
    }
}
```

---



### DELETE

**ENDPOINT** -> http://localhost:20000/fermentation/delete/:authorization/:account/:id

- **delete** -> tipo de solicitud para no confundir
- **authorization** -> el usuario que esta haciendo la solicitud
- **account** -> nombre de la cuenta para validar permisos 
- **id** -> donde se va a hacer la modificación
- Probar para verificar validaciones



**EJEMPLO DE USO** -> http://localhost:20000/fermentation/delete/user1/cacao/2024-03-02T01:51:58.489Z

Tener en cuenta que el id puede estar ya eliminado, si es así probar con otro

Esto dará la siguiente respuesta:

```json
{
    "response": "Eliminado correctamente"
}
```

---



### HELPERS

Debido a que se repetían funciones, decidi reutilizar algunas y ponerlas en esta carpeta

> [!IMPORTANT]
>
> - En la carpeta "helpers" se encuentran estas funciones junto a una explicacionmas detallada



- **compareDates** -> compara las fechas para saber cual es mayor que cual
- **checkOutput** -> compara que el input sea mayor que el output  
- **verifyUser** -> verifica si el usuario tiene o no permisos para modificar en la db simulada (esta se encuentra directamente en **index.js** ya que usa funciones que se encuentran ahi)