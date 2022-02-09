//https://ezdevs.com.br/comecando-uma-api-rest-com-node-js/ teste

const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');

app.use(morgan('combined'))

require('./routes/index')(app);

app.use(cors());
app.use(express.json());
app.listen(3333);