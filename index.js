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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

const randRange = 100000000

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body)

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing!'
        })
    }

    Person.findOne({name: body.name}).then(existingPerson => {
        //我这里的逻辑是如果存在则返回错误，与前端的不一致，但是暂时不管他
        if(existingPerson) {
            return response.status(400).json({
                error: 'name already exists!'
            })
        }
        const person = new Person({
            name: body.name,
            number: body.number
        })
        
        person.save().then(savedPerson => {
            response.json(savedPerson)
        }).catch(error => next(error))
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    
    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`)
})
