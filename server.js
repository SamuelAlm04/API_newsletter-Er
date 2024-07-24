import express from 'express'
const server = express()
const port = 3001

const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './database.sqlite3',
    },
})

server.use(express.json())

server.get('/', async (req, res) => {
    const tbl1 = knex.select().from('users')
    res.json(await tbl1)

})

server.post('/', async (req, res) => {
    const user = {
        'name': req.body.user.name,
        'email': req.body.user.email,
        'hobby': req.body.user.hobby
    }
    if(user.name === undefined || user.email === undefined || user.hobby === undefined) {
        res.json('Informações incompletas.')
        return
    }
    if(typeof(user.name) != "string" || typeof(user.email) != "string" || typeof(user.hobby) != "string") {
        res.json('Tipo de variável não suportada.') 
        return
    }
    if(user.name === "" || user.email === "" || user.hobby === "") {
        res.json('Campos não preenchidos.')
        return
    }
    /*if((await knex.from('tabela1').select().where("email", user.email).orWhere("num", user.num)).lenght != 0) {
        res.json('E-mail ou número já existem no cadastro.')
        return
    }
    if((await knex.from('tabela1').select().where("num", user.num)).lenght != 0) {
        res.json("Número já cadastrado.")
        return
    }*/
    await knex('users').insert(user)
    res.json(user)
})

server.listen(port, async () => {
    knex.schema.hasTable('users').then(function(exists) {
        if (!exists) {
                knex.schema.createTableIfNotExists('users', function(table) {
                table.increments()
                table.string('name')
                table.string('email')
                table.string('hobby')
            })
        }
    })
    console.log(`Server listening on port ${port}`)
})
