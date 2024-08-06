require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('content', (request) => {
    const body = request.body
    return JSON.stringify(body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', {
    skip: (request) => {return request.method !== 'POST'}
})) 

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: (request) => {return request.method === 'POST'}
})) 

//连接到数据库


let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]



const date = new Date()

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/info', (request, response) => {
    console.log('get info requests: ', request)
    Person.find({}).then( persons =>{
        response.send(`<p>Phonebook has info for ${persons.length} people
        <br/>
        ${date}
        </p>`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    if(request.params) {
        Person.findById(request.params.id).then(person => {
            response.json(person)
        })
    }
    else {
        response.status(404).send()
    }
})

const randRange = 100000000

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            if(result) {
                response.status(204).send()
            }
            else {
                response.status(400).send()
            }
        })
})

/*const generateId = () => {
    const newId = Math.random() * randRange
    return newId
} */

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
    const ifExist = (person) => person.name === body.name

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing!'
        })
    }

    else if(Person.exsists(`{${body.name}}`)){
        return response.status(400).json({
            error: 'name already exist!'
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`)
})
