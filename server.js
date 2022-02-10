//https://ezdevs.com.br/comecando-uma-api-rest-com-node-js/ teste

// Precisei ajustar manualmente a opcao de download e para permitir conteudo nao seguro
// chrome://settings/content/siteDetails?site=http%3A%2F%2Fcaepi.mte.gov.br
// Mesmo definindo no Chromium ele perde o perfil ao abrir o site, preciso fazer carregar o perfil manualmente
// chrome://version/

const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');

app.use(morgan('combined'))

require('./routes/index')(app);

app.use(cors());
app.use(express.json());
app.listen(3333);