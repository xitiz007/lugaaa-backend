const mongoose = require('mongoose');

async function connectDB(cb)
{
    try
    {
        await mongoose.connect(process.env.MONOGO_DB_URL);
        console.log('mongodb connected');
        cb();
    }
    catch(err)
    {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;