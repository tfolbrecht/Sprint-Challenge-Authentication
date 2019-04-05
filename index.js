require('dotenv').config('./.env'); // load .env variables

const server = require('./api/server.js');

const port = process.env.PORT || 9999;
server.listen(port, () => {
  console.log(`\n=== Server listening on port ${port}\n`);
});
