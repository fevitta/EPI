const puppeteer = require('puppeteer');

exports.getById = (req, res, next) => {
    let id = new String(req.params.id);
    let apenasNumeros = /^\d+$/.test(id);
    let inicioProcessamento = new Date();
    let erroCA = 0;
    let erroMsg = {"status":400,"erro":''};
    let conteudoMensagem;
    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

    if (id.length > 6) {
        erroMsg.erro = 'Código CA deve conter até 6 números. CA: '+id;
        res.status(400).send(erroMsg);
        process.exit;
    } else if (apenasNumeros == false) {
        erroMsg.erro = 'Código CA deve conter apenas números. CA: '+id;
        res.status(400).send(erroMsg);          
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
  
  //fazer
  //considerar inverter o waitForSelector ao invés do 1o registro do retorno para a msg de erro que deve ser mais rapido.
  //deixar timeout menor para o erro e maior para esperar a busca
  //2a opcar, migrar para esperar mais de um selector
  //await page.waitFor(() =>  document.querySelectorAll('Selector1, Selector2, Selector3').length);

  try {
    await page.waitForSelector('#PlaceHolderConteudo_grdListaResultado #PlaceHolderConteudo_grdListaResultado_btnDetalhar_0',{waitUntil: 'load', timeout: 30000})
  } catch(error) {
    try {
        conteudoMensagem = await page.$$eval('.conteudoMensagem', el => el[0].innerText)
        erroMsg.erro = 'CA não encontrado. CA: '+id+' - '+conteudoMensagem;
        res.status(400).send(erroMsg);
        erroCA = 1;
    } catch (error) {
        erroMsg.erro = 'Tempo limite excedido. CA: '+id;  
        res.status(400).send(erroMsg);
        erroCA = 1; 
    }
  }
  
  if (erroCA == 0) {
      
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

  }
  
  })()
  }
};