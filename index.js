const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require("bcrypt")

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})


// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

// APL create userpassword

app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedpassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `
  select * from
  user where 
  username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser == undefined) {
    const createUserQuery = `
    insert into user
    (username, name, password, gender, location)
    values
    (
      '${username}',
      '${name}',
      '${hashedpassword}',
      '${gender}',
      '${location}'
    );`
    await db.run(createUserQuery)
    response.send('User created seccessfully')
  } else {
    response.status(400)
    response.send('Username already exits')
  }
})

//APL login

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `
  select * from user
   where 
   username = '${username}';`
  const dbUser = await db.get(selectUserQuery)

  if (dbUser == undefined) {
    response.status(400)
    response.send('User not Found')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched == true) {
      response.send('Password matched')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})