const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://burger:${password}@cluster0.gni5syf.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
  
const Person = mongoose.model('Person', noteSchema)

if (process.argv.length === 3) {
    //只有密码则全部输出的情况
    
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })

}
//添加姓名数字
else if (process.argv.length === 5) {

    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}
else {
    console.log('please give the right arguments')
    process.exit(1)
}

