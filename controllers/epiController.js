const puppeteer = require('puppeteer');

exports.getById = (req, res, next) => {
    let id = new String(req.params.id);
    let apenasNumeros = /^\d+$/.test(id);
    let inicioProcessamento = new Date();
    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

    if (id.length > 6) {
        res.status(300).send('Código CA inválido');
        process.exit;
    } else if (apenasNumeros == false) {
        res.status(300).send('Código CA deve conter apenas números');          
    } else {

    (async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  const navigationPromise = page.waitForNavigation()
  console.log('IP: '+ ip + ' Acessando http://caepi.mte.gov.br/internet/ConsultaCAInternet.aspx')
  await page.goto('http://caepi.mte.gov.br/internet/ConsultaCAInternet.aspx')

  console.log("Consultando CA: "+ id)
  
  await page.setViewport({ width: 1920, height: 880 })
  
  await navigationPromise
  
  await page.waitForSelector('#PlaceHolderConteudo_tbPesquisa #txtNumeroCA')
  await page.click('#PlaceHolderConteudo_tbPesquisa #txtNumeroCA')
  await page.type('#PlaceHolderConteudo_tbPesquisa #txtNumeroCA', id)
  
  await page.waitForSelector('#PlaceHolderConteudo_tbPesquisa #btnConsultar')
  await page.click('#PlaceHolderConteudo_tbPesquisa #btnConsultar')
  
  await page.waitForSelector('#PlaceHolderConteudo_grdListaResultado #PlaceHolderConteudo_grdListaResultado_btnDetalhar_0',{waitUntil: 'load', timeout: 5000})
  //await page.click('#PlaceHolderConteudo_grdListaResultado #PlaceHolderConteudo_grdListaResultado_btnDetalhar_0')
  await page.screenshot({ path: 'teste.png' });

  //*[@id="PlaceHolderConteudo_grdListaResultado_lblNrCA_0"]
  //#PlaceHolderConteudo_grdListaResultado_lblNrCA_0

  let caValue = await page.$$eval('#PlaceHolderConteudo_grdListaResultado_lblNrCA_0', el => el[0].innerText)
  let cnpjValue = await page.$$eval('#PlaceHolderConteudo_grdListaResultado_lblNrCNPJ_0', el => el[0].innerText)
  let fabricanteValue = await page.$$eval('#PlaceHolderConteudo_grdListaResultado_lblNomeLaboratorio_0', el => el[0].innerText)

  await page.waitForSelector('#PlaceHolderConteudo_grdListaResultado #PlaceHolderConteudo_grdListaResultado_btnDetalhar_0')
  await page.click('#PlaceHolderConteudo_grdListaResultado #PlaceHolderConteudo_grdListaResultado_btnDetalhar_0')

  await page.waitForSelector('#PlaceHolderConteudo_lblNRRegistroCA')
  
  let situacaoValue = await page.$$eval('#PlaceHolderConteudo_lblSituacao', el => el[0].innerText)
  let validadeValue = await page.$$eval('#PlaceHolderConteudo_lblDTValidade', el => el[0].innerText)
  let processoValue = await page.$$eval('#PlaceHolderConteudo_lblNRProcesso', el => el[0].innerText)
  let equipamentoValue = await page.$$eval('#PlaceHolderConteudo_lblNOEquipamento', el => el[0].innerText)

  let fimProcessamento = new Date();
  let tempoProcessamento = (fimProcessamento-inicioProcessamento)/1000+' Segundos';

  let dadosCA = {caValue,cnpjValue,fabricanteValue,situacaoValue,validadeValue,processoValue,equipamentoValue,tempoProcessamento};
  console.log(dadosCA);
  
  await browser.close()

  res.status(200).send(dadosCA);
  
  })()
  }
};