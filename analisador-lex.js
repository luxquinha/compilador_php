// =====================Instâncias do DOM=======================================
// código ou arquivo do usuário:
var textArea = document.querySelector("#codigo")
var arquivo = document.querySelector("#arquivo")
// páginas repectivas aos menus:
const pag1 = document.querySelector("#compilador")
const pag2 = document.querySelector("#arvore")
const pag3 = document.querySelector("#tabela")
// Titulo principal:
const titulo = document.querySelector("#titulo_da_pagina")
// Possiveis saidas pro usuário:
const tokens = document.querySelector("#tabelaSimbolos")
const saidas = document.querySelector("#saidas")
const parser = document.querySelector("#parser")
const executar = document.querySelector("#btn-run")
// Variaveis responsaveis pela separação dos lexemas e guardar os lexemas:
let sequencia= ''
let qtd_aspas = 1
var string = []
let posicaoDaString = 0
var lexemas = []
var linhas = []
let termos = []

// =====================Eventos=======================================
// Mudar informações de acordo com a página:
pag1.addEventListener('click', ()=>{
    pag2.removeAttribute("id", "paginaAtual")
    pag3.removeAttribute("id", "paginaAtual")
    pag1.setAttribute("id", "paginaAtual")
    titulo.innerText = "PHP - Compilador"
    mostrarCompilador()
})
pag2.addEventListener('click', ()=>{
    titulo.innerText = "PHP - Árvore Parser"
    pag1.removeAttribute("id", "paginaAtual")
    pag3.removeAttribute("id", "paginaAtual")
    pag2.setAttribute("id", "paginaAtual")
    mostrarArvore()
})
pag3.addEventListener('click', ()=>{
    titulo.innerText = "PHP - Tabela de Símbolos"
    pag1.removeAttribute("id", "paginaAtual")
    pag2.removeAttribute("id", "paginaAtual")
    pag3.setAttribute("id", "paginaAtual")
    mostrarTabela()
})
pag1.click()
// Anular a ação do tab no DOM e gerar um espaçamento na textArea:
textArea.addEventListener('keydown', function(e) {
    if(e.keyCode === 9) { // TAB
        var posAnterior = this.selectionStart;
        var posPosterior = this.selectionEnd;

        e.target.value = e.target.value.substring(0, posAnterior)
                         + '\t'
                         + e.target.value.substring(posPosterior);

        this.selectionStart = posAnterior + 1;
        this.selectionEnd = posAnterior + 1;
 
        // não move pro próximo elemento
        e.preventDefault();
    }
}, false);
// Recebe o arquivo e envia o conteudo pra textArea:
arquivo.addEventListener('change', function(e){
    let pos = 0
    const codigo = this.files[pos]
    const leitor = new FileReader()
    leitor.addEventListener('load', ()=>{
        textArea.value = leitor.result
        leitor.result = ' '
    })
    if(codigo){
        leitor.readAsText(codigo)
    }
})
executar.addEventListener('click', ()=>{
    if(textArea.value !== ''){
        reiniciarVariaveisGlobais()
        addTabela("limparTabela")
        mostrarArvoreParse(null, 'limparArvore')
    }
    lex()
})
// Recarrega a página para as formatações originais:
function clearCode(){
    window.location.reload()
}
function reiniciarVariaveisGlobais(){
    linhas = []
    termos = []
    lexemas = []
    string = []
    posicaoDaString = 0
    qtd_aspas = 1
    sequencia = ''
    linhaAtual = 1
    linhaTemosPos = 0 
    idExpr = 1
    caminhoExpLinha = []
    arvore = ['<progr>']
}
// =====================Funções dos menus===================================
function mostrarCompilador(){
    tokens.setAttribute("class", "hide")
    parser.setAttribute("class", "hide")
    saidas.removeAttribute("class", "hide")
}
function mostrarArvore(){
    tokens.setAttribute("class", "hide")
    saidas.setAttribute("class", "hide")
    parser.removeAttribute("class", "hide")
}
function mostrarTabela(){
    saidas.setAttribute("class", "hide")
    parser.setAttribute("class", "hide")
    tokens.removeAttribute("class", "hide")
}
// =====================Analisador léxico===================================
// Cria um objeto Token que possue suas caracteristicas:
class Token{
    constructor(){
        this.lexema = ''
        this.token = ''
        this.pos = null
    }
}
// Instancia um Token, atribui os seus valores e o adiciona no array:
function criarLexema(token, simbolo){
    if(simbolo != "" && token != '<string>'){
        let lex = new Token()
        lex.lexema = simbolo
        lex.pos = lexemas.length
        lex.token = token
        lexemas.push(lex)
    }else if(token == '<string>'){
        if((qtd_aspas%2)!=0){
            let frase = new Token()
            frase.lexema = string[posicaoDaString] 
            frase.pos = lexemas.length
            frase.token = '<string>'
            lexemas.push(frase)
            qtd_aspas++
        }else{
            qtd_aspas++
            posicaoDaString++
        }
    } 

}
function pegarStrings(codigo){
    let isString = /('(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}')|("(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}")/gi
    let string = []
    string = codigo.match(isString)
    if(string != null)
        return string
}
// recebe o codigo digitado, transforma em string e guarda os lexemas do código em um array:
function lex(){
    if(textArea.value == ""){
        alert("Nenhum código encontrado. Por favor verifique seu editor!")
    }else{
        let codigo = textArea.value
        codigo = prepararString(codigo)
        saidas.innerText = codigo
        string = pegarStrings(codigo)
        codigo = tirarStings_doCodigo(codigo)
        identificarLexemas(codigo)
        separarLinhas()
        console.log(arvore)
        mostrarArvoreParse(arvore, '')
    }
}
function tirarStings_doCodigo(codigo){
    if(string != null){
        string.forEach(frase =>{
            if(frase.startsWith('"')){
                frase = frase.replaceAll('"', '')
            }else{
                frase = frase.replaceAll("'", "")
            }
            codigo = codigo.replace(frase, '')
        })
    }
    return codigo
}
// Prepara a String (retira os \n, \t) e retorna uma string única:
function prepararString(string){
    string = string.trim()
    string = JSON.stringify(string)
    string = string.replaceAll('\\n', ' ')
    string = string.replaceAll('\\t', '')
    string = JSON.parse(string)
    return string
}
// Separa os lexemas encontrados e salva em um array na sequencia correta:
function identificarLexemas(sentenca){
    // expressões regulares para identificar espaços e caracteres especiais da linguagem:
    let espaco = /\s/
    let especialChar = /[\?\(\)'\.";]/
    // Percorre todo a sentenca e separa os lexemas corretamente:
    for(let i=0; i<(sentenca.length); i++){
        // caso não seja um espaço e seja um caracter especial:
        if(!espaco.test(sentenca[i]) && especialChar.test(sentenca[i])){
            // Caso seja um numero do tipo float ele verifica se o proximo caractere é um número, se sim ele so adiciona a sequencia
            if(sentenca[i] == "." && !isNaN(sentenca[i+1])){
                sequencia= sequencia+sentenca[i]
                continue
            /* se já houver um valor em sequencia ele imprime e reseta a variavel, em seguida verifica qual o simbolo 
            (quando não houver espaços entre o lexema e um simbolo reservado da palavra)*/
            }else if(sequencia != '' && especialChar.test(sentenca[i])){
                gerarTokens(sequencia)
                sequencia = ''
            }
            gerarTokens(sentenca[i])
            //No caso de não ser nenhum dos RegExp acima a variavel sequencia é concatenada com o caractere verificado
        }else if(!espaco.test(sentenca[i]) && !especialChar.test(sentenca[i])){
            sequencia= sequencia+sentenca[i]
            // Verifica o proximo caractere para saber se é um espaço, se sim ele imprime a sequencia guardada 
            if(sequencia != '' && espaco.test(sentenca[i+1])){
                gerarTokens(sequencia)
                }
        // Caso seja um espaço a variavel sequencia é resetada e passa para o próximo caractere da sentença:
        }else{
            sequencia = ''
        }
    }
    addTabela()
}
function gerarTokens(simbolo){
    let identificadores = /\$([a-z\_\-]{1,}[0-9]?)/i
    let int_literal = /^[0-9]{1,}/
    let float_literal = /[0-9]{1,}\.[0-9]{1,}/
    let palavra = /[a-z ]{1,}/i
    switch (simbolo) {
        case '<php':
            criarLexema('<inicio_app>', simbolo)
            break
        case '?':
            criarLexema("<fim_app>", simbolo+'>')
            break
        case '=':
            criarLexema('<op_igual>', simbolo)
            break
        case '+':
            criarLexema('<op_soma>', simbolo)
            break
        case '-':
            criarLexema('<op_subtração>', simbolo)
            break
        case '/':
            criarLexema('<op_divide>', simbolo)
            break
        case '*':
            criarLexema('<op_multiplica>', simbolo)
            break
        case '(':
            criarLexema('<parantese_E>', simbolo)
            break
        case ')':
            criarLexema('<parantese_D>', simbolo)
            break
        case "'":
            criarLexema('<string>', simbolo)
            break
        case '"':
            criarLexema('<string>', simbolo)
            break
        case '.':
            criarLexema('<op_concat>', simbolo)
            break
        case ';':
            criarLexema('<ponto_e_virgula>', simbolo)
            break
        case 'echo':
            criarLexema('<op_imprimir>', simbolo)
            break
    }
    if(identificadores.test(simbolo)){
        criarLexema("<id>", simbolo)
    }else if(float_literal.test(simbolo)){
        criarLexema("<float_literal>", simbolo)
    }else if(int_literal.test(simbolo)){
        criarLexema("<int_literal>", simbolo)
    }else if(palavra.test(simbolo) && simbolo != "<php" && simbolo != "echo"){
        criarLexema("<indefinido>", simbolo)
        let erroEspecifico = `A palavra:'${simbolo}' não está definida`
        erro(erroEspecifico)
    }
}
// =====================Interações com o DOM===================================
// Adiciona linhas e colunas na pagina3 da aplicação:
function addTabela(arg){
    const table  = document.querySelector("table")
    const corpoTabela = document.querySelector("tbody")
    if(arg == "limparTabela"){
        table.removeChild(corpoTabela)
    }else{
        const tbody = document.createElement("tbody")
        tbody.id = "corpoTabela"
        lexemas.map(lexema =>{
            // Criando os elementos html:
            const tr = document.createElement("tr")
            const pos = document.createElement("td")
            const lex = document.createElement("td")
            const token = document.createElement("td")
            // Atribuindo a estilização:
            tr.className = "table-dark"
            pos.className = "table-dark"
            lex.className = "table-dark"
            token.className = "table-dark"
            // Atribuindo os valores de cada coluna:
            pos.innerText = lexema.pos
            lex.innerText = lexema.lexema
            token.innerText = lexema.token
            // Adicionando no DOM:
            tr.appendChild(pos)
            tr.appendChild(lex)
            tr.appendChild(token)
            tbody.appendChild(tr)
            table.appendChild(tbody)
        })
    }
}
// /imprime os erros do código em questão:
function erro(tipoError){
    console.log(tipoError);
    saidas.innerHTML = tipoError
}
// =====================Análise sintática:===================================
/* Gramática:
    <php ?> -> <expr>; { expr;}

    <atribuição> -> id "=" <termo>

    <imprimir> -> echo "(<imprimir>)" (<termo>) 

    <expr> -> <atribuição> 
    | <imprimir> 
    | <termo> {(+|-)<termo>} 
    | <fator> * (<expr>)

    <termo> -> <fator> {(*|/)<termo>}
    | <string>

    <fator> -> id [. <termo>]
    | (<expr>)

    <string> -> id [.<termo>]
*/
/*Funções responsáveis por saber quantas linhas e quais o conteúdos de cada linha - (inicio) */
// Retorna um objeto linha:
function addLinha(conteudoDaLinha){
    const linha = {
        linha: (linhas.length+1),
        conteudo: conteudoDaLinha,
        quantidadeTermos: conteudoDaLinha.length
    }
    return linha
}
// Retorna o token de acordo com a posição desejada:
function getToken(linha, pos){
    return linhas[linha].conteudo[pos]
}
// analisa cada linha do código, tendo o ";" como parâmetro de parada da linha: 
function separarLinhas(){
    lexemas.forEach(lex =>{
        // Primeira linha:
        if(lex.lexema == "<php"){
            linhas.push(addLinha(lex))
        }
        // Última linha:
        else if(lex.lexema == "?>"){
            linhas.push(addLinha(lex))
        }
        // Demais linhas do código:
        else{
            // Vai adicionando os termos presentes na linha até encontrar um ';' então é add no array linhas[]:
            termos.push(lex)
            if(lex.lexema == ";"){
            linhas.push(addLinha(termos))
            termos = []
            }
        }
    })
    // Verifica se o código começa e termina com as tags corretas, se sim então chamamos exp():
    if(linhas[(linhas.length-1)].conteudo.token !== "<fim_app>"){
        erro(`Esperado "?>" para finalizar o programa`)
    }else if(linhas[0].conteudo.token !== "<inicio_app>"){
        erro(`Esperado "<php" para iniciar o programa`)
    }else{
        expr()
    }
}
/*Funções responsáveis por saber quantas linhas e quais o conteúdos de cada linha - (Fim) */
let linhaAtual = 1
let linhaTemosPos = 0 
let idExpr = 1
let caminhoExpLinha = []
let arvore = ['<progr>']
// Retorna o próximo lexema símbolo presente na linha do código de acordo com a linha e posição do termo analisado:
function proximoSimbolo(termoPos, linhasPos){
    return (linhas[linhasPos].conteudo[(termoPos+1)] != null) ? linhas[linhasPos].conteudo[(termoPos+1)] : linhas[linhasPos].conteudo[(termoPos-2)]
}
// Vai analisar como a expressão se parece e fazer chamadas para as funçãos respectivas da expressão:
function expr(){
    // Cada linha é uma expressão diferente
    if(linhaTemosPos == 0){
        caminhoExpLinha.push(`<expr${idExpr}>`)
    }
    // expr -> <termo> {(+|-)<termo>}
    if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '+'
    || proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '-'){
        if(linhaTemosPos != 0){
            caminhoExpLinha.push(`<expr>`)
        }
        // chama a função termo() enviando o token analisado como parametro:
        termo(getToken(linhaAtual, linhaTemosPos))
    }
    // expr -> <atribuição>
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == "="){
        if(linhaTemosPos != 0){
            caminhoExpLinha.push(`<expr>`)
        }
        // chama a função atribuição() enviando o token analisado como parametro:
        atribuição(getToken(linhaAtual, linhaTemosPos))
    }
    // expr -> <imprimir> ou expr -> <fator> {(*|/)(expr)}
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '(' || getToken(linhaAtual, linhaTemosPos).lexema == "("){
        // Se o próximo símbolo for uma string então chama a função imprimir():
        if(proximoSimbolo(linhaTemosPos+1, linhaAtual).token == "<string>"){
            if(linhaTemosPos != 0){
                caminhoExpLinha.push(`<expr>`)
            }
            // chama a função imprimir() enviando o token analisado como parametro:
            imprimir(getToken(linhaAtual, linhaTemosPos))
        }
        // Caso seja uma (<expr>):
        else{
            // Verifica se há o fechamento do parenteses direito; Se sim ele chama a função termo():
            let tamanho = linhas[linhaAtual].quantidadeTermos
            if(linhas[linhaAtual].conteudo[(tamanho-2)].lexema == ")"){
                if(linhaTemosPos != 0){
                    caminhoExpLinha.push(`(<expr>)`)
                }
                linhaTemosPos++
                termo(getToken(linhaAtual, linhaTemosPos))
            }else{
                erro(`Esperado ")" na linha ${linhaAtual}`)
            }
        }
    } 
    // Caso seja uma multiplicação ou divisão:
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == "*"
    || proximoSimbolo(linhaTemosPos, linhaAtual).lexema == "/"){
        if(linhaTemosPos != 0){
            caminhoExpLinha.push(`<expr>`)
        }
        fator(getToken(linhaAtual, linhaTemosPos))
    }
    // Caso seja o fim da linha ele incrementa a linhaAtual e reseta a linhaTemosPos:
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == ";"){
        if(linhaTemosPos != 0){
            caminhoExpLinha.push(`<expr>`)
        }
        termo(getToken(linhaAtual, linhaTemosPos))
        proximaLinha()
    }
}
// Incrementa uma linha, reseta as posições dos termos, envia os termos da linha pra árvore e chama a próxima linha:
function proximaLinha(){
    linhaAtual++
    linhaTemosPos = 0
    if(caminhoExpLinha.length > 0){
        arvoreParse(caminhoExpLinha)
        caminhoExpLinha = []
    }
    if(linhaAtual<(linhas.length-1)){
        idExpr++
        expr()
    }
}
// Analisar a aparencia do string e chamar a função que casar com a sequencia correta ou gerar a frase terminal:
function String(token){
    // Inserções de símbolos terminais e não-terminais:
    caminhoExpLinha.push(`<string>`)
    caminhoExpLinha.push(`<Id>`)
    caminhoExpLinha.push(`${token.lexema}`)
    // Verifica se há uma concatenação de termos; chamando o próximo termo da junto da string:
    if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == "."){
        caminhoExpLinha.push(`${proximoSimbolo(linhaTemosPos, linhaAtual).token}`)
        linhaTemosPos+=2
        termo(getToken(linhaAtual, linhaTemosPos))
    }
    // Chama a próxima linha do código:
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == ")"){
        proximaLinha()
    }
}
// Analisar a aparencia do termo e chamar a função que casar com a sequencia correta:
function termo(token){
    if(token != null){
        // Exceção da string:
        if(token.token != "<string>"){
            // Caso seja uma concatenação de impressão:
            if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '.'
            ||proximoSimbolo(linhaTemosPos+1, linhaAtual).token == '<string>'){
                caminhoExpLinha.push(`(<termo>)`)
            }
            // Fator comum:
            else{
                caminhoExpLinha.push(`<termo>`)
            }
            // Chama fator que incrementa para o proximo termo:
            fator(token)
        }else{
            // Caso seja uma impressão:
            if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '.'
            ||proximoSimbolo(linhaTemosPos, linhaAtual).lexema == ')'){
                caminhoExpLinha.push(`(<termo>)`)
            }
            // Caso seja uma atribuição:
            else{
                caminhoExpLinha.push(`<termo>`)
            }
            String(token)
        }
    }
}
//Verifica o paratenses direito e chama a função termo:
function imprimir(token){
    // Inserção dos símbolos terminais e não-terminais:
    caminhoExpLinha.push(`<impressão>`)
    caminhoExpLinha.push(`<palavra_chave>`)
    caminhoExpLinha.push(`${token.lexema}`)
    caminhoExpLinha.push(`${token.token}`)
    // Se houver os dois parenteses a função continua com as chamadas recurssivas, se não para:
    if(proximoSimbolo(linhaTemosPos, linhaAtual).token == "<parantese_E>"){
        // Verificar os parenteses e chamar o termo que está dentro da função echo:
        let tamanho = linhas[linhaAtual].quantidadeTermos
        if(linhas[linhaAtual].conteudo[(tamanho-2)].lexema == ")"){
            linhaTemosPos+=2
            termo(getToken(linhaAtual, linhaTemosPos))
        }else{
            erro(`Esperado ")" na linha ${linhaAtual}`)
        }
    }
}
// Verifica o id recebido e chama o valor da expressão atribuido a ele:
function atribuição(token){
    // Inserção dos símbolos terminais e não-terminais:
    caminhoExpLinha.push(`<atribuição>`)
    caminhoExpLinha.push(`${token.token}`)
    caminhoExpLinha.push(`${token.lexema}`)
    caminhoExpLinha.push(`${proximoSimbolo(linhaTemosPos, linhaAtual).token}`)
    linhaTemosPos+=2
    expr()
}
// Analisar a aparencia do fator e chamar a função que casar com a sequencia correta ou gerar um valores terminais:
function fator(token){
    // Inserção dos símbolos terminais e não-terminais:
    caminhoExpLinha.push(`<fator>`)
    caminhoExpLinha.push(`${token.token}`)
    caminhoExpLinha.push(`${token.lexema}`)
    // imprimindo os vértices corretos e os finais de cada expressão:
    if(proximoSimbolo(linhaTemosPos, linhaAtual).token != "<parantese_D>"
    && proximoSimbolo(linhaTemosPos, linhaAtual).token != "<ponto_e_virgula>"){
        caminhoExpLinha.push(`${proximoSimbolo(linhaTemosPos, linhaAtual).token}`)
    }else if(proximoSimbolo(linhaTemosPos, linhaAtual).token == "<parantese_D>"){
        // Caso seja (A + B) * (C + D):
        if(proximoSimbolo(linhaTemosPos+1, linhaAtual).lexema != ';'){
            linhaTemosPos+=3
            expr()
        }
    }
    // Verifica se há algum símbolo diferente de ';' após o fator analisado:
    if(proximoSimbolo(linhaTemosPos,linhaAtual)!= null){
        // Caso seja uma soma de termos:
        if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema== "+"
        || proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '-'){
            linhaTemosPos+=2
            termo(getToken(linhaAtual, linhaTemosPos))
        }
        // Caso seja uma multiplicação de fatores ou fator * (<expr>):
        else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema== "*"
        || proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '/'){
            linhaTemosPos+=2
            if(getToken(linhaAtual, linhaTemosPos).lexema == "("){
                expr()
            }else{
                fator(getToken(linhaAtual, linhaTemosPos))
            }
        }
        // Se houver um concatenação com uma string:
        else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '.'){
            linhaTemosPos+=2
            termo(getToken(linhaAtual, linhaTemosPos))
        }
        // Se nenhuma das anteriores forem satisfeitas então vai para a próxima linha:
        else{
            proximaLinha()
        }
    }
}
// Recebe as combinações de cada linha das chamadas de expr() e add em arvore:
function arvoreParse(subArvore){
    if(subArvore != null){
        arvore.push(subArvore)
    }else{
        erro(`Problema na função ArvoreParse`)
    }
}
function mostrarArvoreParse(arvoreParseConteudo, arg){
    // Reinicia a árvore a cada clicar do botão RUN:
    if(arg == "limparArvore"){
        parser.removeChild(corpoArvoreParser)
        parser.removeChild(programa)
    }else{
        // Regex para achar as raizes 2° e vértices da árvore:
        let raizSegundoGrau = /<[a-z]{1,}[0-9]>/
        if(arvoreParseConteudo != null){
            // Cria elementos html para adicionar os valores respectivos:
            const divPrincipal = document.createElement('div')
            const divSecundaria = document.createElement('div')
            const spanPrincipal = document.createElement('span')
            // Adiciona classes que dizem se o conteudo é em uma coluna ou uma linha:
            spanPrincipal.id = 'programa'
            divPrincipal.id = 'corpoArvoreParser'
            divPrincipal.className = 'colum'
            divSecundaria.className = 'columPrincipal'
            // Percorre o array e cria um elemento aninhado ao anterior para impressão no DOM:
            arvoreParseConteudo.map(subArvore =>{
                // Criação de div's para inserção dos coteudos e atribuição do flex-direction:
                const divTerciaria = document.createElement('div')
                const div4 = document.createElement('div')
                const div5 = document.createElement('div')
                const div6 = document.createElement('div')
                divTerciaria.className = 'columPrincipal'
                div4.className = 'colum'
                div5.className = 'inRow'
                // Adiciona a Raíz principal da árvore:
                if(subArvore == "<progr>"){
                    spanPrincipal.innerText = subArvore
                    spanPrincipal.className = 'raiz1 caminhos'
                    parser.appendChild(spanPrincipal)
                }else{
                    // Percorre a subArvore fornecida pelo map:
                    for(let i=0; i<subArvore.length;i++){
                        // A cada iteração é criado um span que irá conter uma raíz ou galhos e folhas:
                        const span = document.createElement('span')
                        // Verifica se é uma raiz de segundo grau; Se sim, adicionamos o conteúdo no span e o span na div terciária:
                        if(raizSegundoGrau.test(subArvore[i])){
                            span.innerText = subArvore[i]
                            span.className = 'raiz2 caminhos'
                            divTerciaria.appendChild(span)
                            divSecundaria.appendChild(divTerciaria)
                        }
                        // Caso seja uma Raíz de 3° grau; adiciona o nome da raiz no span e o adiciona na div4:
                        else if(subArvore[i] == "<atribuição>" || subArvore[i] == "<impressão>"){
                            span.innerText = subArvore[i]
                            span.className = 'raiz3 caminhos'
                            div4.appendChild(span)
                            // A div5 é uma div que se encontra no interior da div4 e recebe uma div retornada por estruturaTerminal():
                            div5.appendChild(estruturaTerminal(subArvore, i+1))
                            div4.appendChild(div5)
                        }
                        // Caso seja uma Raíz de 4° grau; adiciona o nome da raiz no span e o adiciona na div6:
                        else if((subArvore[i] == "<expr>" || subArvore[i] == "(<termo>)") && eRaiz(subArvore, i)){
                            span.innerText = subArvore[i]
                            span.className = 'raiz4 caminhos'
                            div6.appendChild(span)
                            // adiciona uma div terminal em div6 no interior da div5:
                            div6.appendChild(estruturaTerminal(subArvore, i+1))
                            div5.appendChild(div6)
                            div4.appendChild(div5)
                        }
                        // Em análise - (Caso seja uma raiz de 5° grau):
                        // else if(subArvore[i] == "(<expr>)"){
                        //     span.innerText = subArvore[i]
                        //     span.className = 'raiz5 caminhos'
                        //     div5.appendChild(span)
                        //     div4.appendChild(div5)
                        // }
                        // Adiciona as div's com raizes de 3° grau na div Terciária:
                        divTerciaria.appendChild(div4)
                        // Adiciona toda div2 na divPrincipal:
                        divPrincipal.appendChild(divSecundaria)
                    }
                    // Ao fim do análise de cada subArvore é adicionada no DOM e vai para a árvore seguinte:
                    parser.appendChild(divPrincipal)
                }
            })
        }
    }
}
// Função que retorna uma estrutura terminal já formada para mostrarArvoreParser():
// recebe como parâmetros a subArvore e a posição de onde ela foi chamada:
function estruturaTerminal(subArvore, pos){
    // Cria elementos html para o LE e LD e o container que vai guardar elas duas:
    const div = document.createElement('div')
    const div2 = document.createElement('div')
    const div3 = document.createElement('div')
    div2.className = 'colum'
    div3.className = 'colum'
    div.className = 'inRow'
    let posicaoAtual = pos
    // Percorre a partir da posição em que foi chamada e vai adicionando os caminhos na div LE até achar um vértice:
    for(let i=pos; i<subArvore.length; i++){
        if(!eVertice(subArvore[i])){
            const span = document.createElement('span')
            span.className = 'caminhos'
            span.innerText = subArvore[i]
            div2.appendChild(span)
            posicaoAtual = i
        }else{
            posicaoAtual = i
            break
        }
    }
    // Adiciona no container
    div.appendChild(div2)
    // Adiciona o vértice no container:
    if(eVertice(subArvore[posicaoAtual])){
        const span = document.createElement('span')
        span.className = 'vertice caminhos'
        span.innerText = subArvore[posicaoAtual]
        div.appendChild(span)
        posicaoAtual++
    }
    // Caso seja uma atribuição simples ele ja adiciona os elemento <div> <vertice> <div>:
    if(!eRaiz(subArvore, posicaoAtual)){
        for(let i=posicaoAtual; i<subArvore.length; i++){
                const span = document.createElement('span')
                span.className = 'caminhos'
                span.innerText = subArvore[i]
                div3.appendChild(span)
        }
        div.appendChild(div3)
    }
    // retorna o container:
    return div
}
// Verifica se o valor recebido é um vértice ou não e retorna um boolean:
function eVertice(valor){
    let vertice = /((op_)[a-z]{1,})/i
    if(vertice.test(valor) && isNaN(valor))
        return true
    else
        return false
}
// Verifica se o valor passado é uma raiz e retorna um boolean. (uma raiz possue um vértice após ela):
function eRaiz(subArvore, posSubArv){
    // Procura por um vértice, se houver ela é uma raíz:
    for(let i=posSubArv; i<subArvore.length; i++){
        if(eVertice(subArvore[i])){
            return true
        }
    }
    return false
}
// function criarNode(){
//     let raiz = {
//         valor: '',
//         ladoEsquerdo: null,
//         vertice: null,
//         ladoDireito: null
//     }
// }