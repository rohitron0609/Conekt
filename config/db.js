const mongoose = require('mongoose');
const config = require('config');
const { compareSync } = require('bcryptjs');
const db = config.get('mongoURI');

const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser : true,
            useUnifiedTopology : true,
            useCreateIndex: true
        });

        console.log('mongoose connected');

    }
    catch(err){
        console.log(err.message);

        process.exit(1);
    }
}

module.exports = connectDB;