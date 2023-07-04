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
        case '\\':
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
            criarLexema('<concat_variavel>', simbolo)
            break
        case ';':
            criarLexema('<ponto_e_virgula>', simbolo)
            break
        case 'echo':
            criarLexema('<imprimir>', simbolo)
            break
    }
    if(identificadores.test(simbolo)){
        criarLexema("<identificador>", simbolo)
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

    <atribuição> -> id "=" <expr>

    <imprimir> -> echo "("<expr>");" 

    <expr> -> <atribuição>";" 
    | <imprimir> 
    | <termo> {(+|-)<termo>} 
    | <string>

    <termo> -> <fator> {(*|/)<termo>}

    <fator> -> id 
    | num_literal

    <string> -> id [.<expr>]
*/
/*Funções responsáveis por saber quantas linhas e quais o conteúdos de cada linha - (inicio) */
function addLinha(conteudoDaLinha){
    const linha = {
        linha: (linhas.length+1),
        conteudo: conteudoDaLinha
    }
    return linha
}
// Retorna o lexema de acordo com a posição desejada:
function getLexema(pos){
    return lexemas[pos]
}
// analisa cada linha do código, tendo o ";" como parâmetro de parada da linha: 
function separarLinhas(){
    lexemas.forEach(lex =>{
        if(lex.lexema == "<php"){
            linhas.push(addLinha(lex))
        }else if(lex.lexema == "?>"){
            linhas.push(addLinha(lex))
        }
        else{
            termos.push(lex)
            if(lex.lexema == ";"){
            linhas.push(addLinha(termos))
            termos = []
            }
        }
    })
    if(linhas[(linhas.length-1)].conteudo.token !== "<fim_app>"){
        erro(`Esperado "?>" para finalizar o programa`)
    }else if(linhas[0].conteudo.token !== "<inicio_app>"){
        erro(`Esperado "<php" para iniciar o programa`)
    }
    console.log(linhas)
}
/*Funções responsáveis por saber quantas linhas e quais o conteúdos de cada linha - (Fim) */
// Vai analisar como a expressão se parece e fazer chamadas para as funçãos respectivas da expressão:
function expr(){

}
// Analisar a aparencia do termo e chamar a função que casar com a sequencia correta:
function termo(){

}
// Analisar a aparencia do fator e chamar a função que casar com a sequencia correta ou gerar um valores terminais:
function fator(){

}
// Analisar a aparencia do string e chamar a função que casar com a sequencia correta ou gerar a frase terminal:
function string(){

}
