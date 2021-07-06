const epiController = require('../Controllers/epiController');

module.exports = (app) => {
   app.get('/epi/:id', epiController.getById);
}