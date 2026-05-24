var mongoose = require('mongoose');

function connectDb() {
  var mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not set. MongoDB connection was skipped.');
    return;
  }

  mongoose.connect(mongoUri)
    .then(function() {
      console.log('MongoDB connected.');
    })
    .catch(function(error) {
      console.error('MongoDB connection error:', error.message);
    });
}

module.exports = connectDb;