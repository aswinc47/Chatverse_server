const mongoose = require('mongoose')

const databaseConnection = () => {
    mongoose.connect(process.env.DATABASE_URL).then(()=>{
        console.log('Mongo db connected successfully');
    }).catch(error=>{
        console.log(error);
    })
}

module.exports = databaseConnection