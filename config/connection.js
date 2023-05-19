//https://www.mongodb.com/docs/mongodb-shell/connect/
const mongoose = require("mongoose");
// Connect to a Local Deployment on the Default Port
mongoose.connect(
'mongodb://127.0.0.1:27017/social-network',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

// Use this to log mongo queries being executed!
mongoose.set("debug", true);

module.exports = mongoose.connection;
