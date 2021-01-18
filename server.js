var express = require("express")
var Sequelize = require("sequelize")

//connect to mysql database
//baza de date, username, password
var sequelize = new Sequelize('library', 'username', 'password', {
    dialect:'mysql',
    host:'localhost'
})

sequelize.authenticate().then(function(){
    console.log('Success')
}).catch( function(err) {
    console.log(err)
})

//define a new Model
var Books = sequelize.define('books', {
    title: Sequelize.STRING,
    author: Sequelize.STRING,
})

var app = express()

//access static files
app.use(express.static('public'))
app.use('/admin', express.static('admin'))

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get('/createdb', (request, response) => {
    sequelize.sync({force: true}).then(() => {
        response.status(200).send('tables created')
    }).catch((err) => {
        response.status(500).send('could not create tables')
    })
})

app.get('/createdata', (req, res) => {
    //TODO add some test data here
})

async function getBooks(request, response) {
    try {
        let books = await Books.findAll();
        response.status(200).json(books)
    } catch(err) {
        response.status(500).send('something bad happened')
    }
}

// get a list of books
app.get('/books', getBooks)

// get one book by id
app.get('/books/:id', function(request, response) {
    Books.findOne({where: {id:request.params.id}}).then(function(book) {
        if(book) {
            response.status(200).send(book)
        } else {
            response.status(404).send()
        }
    })
})

//create a new book
app.post('/books', function(request, response) {
    Books.create(request.body).then(function(book) {
        response.status(201).send(book)
    })
})

app.put('/books/:id', function(request, response) {
    Books.findByPk(request.params.id).then(function(book) {
        if(book) {
            book.update(request.body).then(function(book){
                response.status(201).send(book)
            }).catch(function(error) {
                response.status(200).send(error)
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.delete('/books/:id', function(request, response) {
    Books.findByPk(request.params.id).then(function(book) {
        if(book) {
            book.destroy().then(function(){
                response.status(204).send()
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.listen(8080)