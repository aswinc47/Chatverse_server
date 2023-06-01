const express= require('express')
const databaseConnection = require('./config/database')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const bodyParser = require("body-parser");
const { userLogin, userRegister, logOut } = require('./controllers/AuthController')
const { getFriend, sendMessage, getAllmessages, sendImage } = require('./controllers/messengerController')
const { authMiddleware } = require('./middlewares/authMiddleware')

app.use(bodyParser.json())
app.use(cookieParser())

app.use(cors({origin:'http://localhost:3000'}))

require('dotenv').config({path:'config/config.env'})

const PORT = process.env.PORT

app.post('/login',userLogin);
app.post('/register',userRegister);
app.get('/getfriends',authMiddleware,getFriend)
app.post('/sendmessage',authMiddleware,sendMessage)
app.get('/getmessages/:id',authMiddleware,getAllmessages)
app.post('/sendimage',authMiddleware,sendImage)
app.post('/logout',authMiddleware,logOut)

databaseConnection()
app.listen(PORT , ()=>{
    console.log(`Server started at ${PORT}`);
})