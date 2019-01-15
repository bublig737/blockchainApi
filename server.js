const app = require('express')()
const bodyParser = require('body-parser');
const RouterModule = require('./router')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', RouterModule.router)


app.listen(8088, ()=>{
    console.log('API BLOCKCHAIN SERVER STARTED');
})