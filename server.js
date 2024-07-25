//@ts-check
import express from 'express'
import cors from 'cors'
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

server.use(cors({origin: "*", credentials: false}))

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
    const validateEmail = (/** @type {string} */ email) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
    }
    if(validateEmail(user.email) != true) {
        res.json('Email inválido')
        return
    } 
    const tempVar = await knex.from('users').select().where("email", user.email)
    if((tempVar).length != 0) {
        await knex('users').where('id',tempVar[0].id).update({'hobby': user.hobby})
        res.json(user)
        return
    }
    await knex('users').insert(user)
    res.json(user)
})

server.get('/:id', async (req, res) => {
    const userID = req.params.id
    const tempVar = await knex.from('users').select().where("id", userID)
    if(tempVar.length != 0) {
        res.json(tempVar[0])
        return
    }
    res.json('ID não cadastrada na database.')
})

server.get('/:id/context', async (req, res) => {
    const userID = req.params.id
    const tempVar = await knex.from('users').select().where("id", userID)
    if(tempVar.length == 0) {
        res.json('ID não cadastrada na database')
        return
    }
    const userHobby = tempVar[0].hobby
    tempVar[0].hobby = await knex.from('hobbies').select().where("hobby", userHobby).first()
    res.json(tempVar)
}) 

server.listen(port, async () => {
    const insertFunc = async () => {
        const golfe = {
            'hobby': "Golfe",
            'description': "Esporte onde os jogadores usam tacos para acertar bolas em buracos no menor número possível de tacadas"
        }
        const futebol = {
            'hobby': "Futebol",
            'description': "Esporte de equipe onde os jogadores chutam uma bola para marcar gols no gol do adversário."
        }
        const basquete = {
            'hobby': "Basquete",
            'description': "Esporte de equipe onde os jogadores arremessam uma bola em uma cesta elevada para marcar pontos."
        }
        const volei = {
            'hobby': "Vôlei",
            'description': "Esporte de equipe onde os jogadores batem uma bola por cima de uma rede para marcar pontos no lado adversário."
        }
        const natacao = { 
            'hobby': "Natação",
            'description': "Atividade esportiva onde os atletas competem nadando em diferentes estilos e distâncias em uma piscina."
        }
        const all = [golfe, futebol, basquete, volei, natacao]
        await knex('hobbies').insert(all)
    }
    knex.schema.hasTable('users').then(async function(exists) {
        if(!exists) {
            return knex.schema.createTableIfNotExists('users', function(table) {
                table.increments()
                table.string('name')
                table.string('email')
                table.string('hobby')
            })
        }
    })
    knex.schema.hasTable('hobbies').then(async function(exists) {
        if(!exists) {
            return knex.schema.createTableIfNotExists('hobbies', function(table) {
                table.increments()
                table.string('hobby')
                table.string('description')
                insertFunc()
            })
        }
    })
    console.log(`Server listening on port ${port}`)
})
