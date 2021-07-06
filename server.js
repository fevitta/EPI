//https://ezdevs.com.br/comecando-uma-api-rest-com-node-js/

const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan')

require('./routes/index')(app);

app.use(morgan('combined'))
app.use(cors());
app.use(express.json());
app.listen(3333);