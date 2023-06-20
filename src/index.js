
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000

app.use(morgan('combined'))
app.use(express.static(path.join(__dirname, 'public')))

//Template engine
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resource/views'))
console.log('PATH: ', path.join(__dirname, 'resource/views'))

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})