// Importando funções de outros módulos:
import { erro, parser } from "../main.js"
import { gerarCodigo, eNumero } from "./gerador_de_codigo.js"
// Variaveis globais do analisador sintático:
var linhaAtual = 1
var linhaTemosPos = 0 
var idExpr = 1
var caminhoExpLinha = []
var arvore = ['<progr>']
var linhas = []
var termos = []
let proximaExp = 0
let expDupla = 2
// Exporta a função para ser inicializada sempre que o botão RUN for clicado:
export function limparVariaveisGlobaissintatico(){
    linhaAtual = 1
    linhaTemosPos = 0 
    idExpr = 1
    caminhoExpLinha = []
    arvore = ['<progr>']
    linhas = []
    termos = []
    proximaExp = 0
    expDupla = 2
}
// =====================Análise sintática:===================================
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
export function separarLinhas(lexemasDoCodigo){
    lexemasDoCodigo.forEach(lex =>{
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
        erro(`Esperado "?>" para finalizar o programa`, 'add')
    }else if(linhas[0].conteudo.token !== "<inicio_app>"){
        erro(`Esperado "<php" para iniciar o programa`, 'add')
    }
    expr()
    gerarCodigo(arvore)
}
/*Funções responsáveis por saber quantas linhas e quais o conteúdos de cada linha - (Fim) */
// Retorna o próximo lexema símbolo presente na linha do código de acordo com a linha e posição do termo analisado:
function proximoSimbolo(termoPos, linhasPos){
    if(linhas[linhasPos] != null){
        return (linhas[linhasPos].conteudo[(termoPos+1)] != null) ? linhas[linhasPos].conteudo[(termoPos+1)] : linhas[linhasPos].conteudo[(termoPos-2)]
    }else{
        return null
    }
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
    // expr -> <imprimir> ou expr -> <fator> {(*|/)(expr)} ou expr -> (expr)(+|-|*|/)(expr)
    else if(proximoSimbolo(linhaTemosPos, linhaAtual).lexema == '(' || getToken(linhaAtual, linhaTemosPos).lexema == "("){
        // Se o próximo símbolo for uma string então chama a função imprimir():
        if(proximoSimbolo(linhaTemosPos+1, linhaAtual).token == "<string>"
        || (proximoSimbolo(linhaTemosPos+1, linhaAtual).token == "<id>")){
            if(linhaTemosPos != 0){
                caminhoExpLinha.push(`<expr>`)
            }
            // chama a função imprimir() enviando o token analisado como parametro:
            imprimir(getToken(linhaAtual, linhaTemosPos))
        }else if(getToken(linhaAtual, linhaTemosPos).lexema == "(" && expDupla == linhaTemosPos){
            caminhoExpLinha.push(`<expr>`)
            expDupla++
            expr()
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
                erro(`Esperado ")" na linha ${linhaAtual+1}`, 'add')
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
    expDupla = 2
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
        if(proximoSimbolo(linhaTemosPos+1, linhaAtual).lexema == "("){
            linhaTemosPos+=2
            expr()
        }else{
            linhaTemosPos+=2
            termo(getToken(linhaAtual, linhaTemosPos))
        }
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
            ||proximoSimbolo(linhaTemosPos+1, linhaAtual).token == '<string>'
            ||proximoSimbolo(linhaTemosPos+1, linhaAtual).lexema == ')'){
                caminhoExpLinha.push(`(<termo>)`)
                fator(token)
            }else if(proximoSimbolo(linhaTemosPos, linhaAtual).token == '<op_multiplica>'
            || proximoSimbolo(linhaTemosPos, linhaAtual).token == '<op_divide>'){
                fator(token)
            }
            // Fator comum:
            else{
                caminhoExpLinha.push(`<termo>`)
                fator(token)
            }
            // Chama fator que incrementa para o proximo termo:
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
    if(proximoSimbolo(linhaTemosPos, linhaAtual).token == "<string>"
    || proximoSimbolo(linhaTemosPos, linhaAtual).token == "<id>"){
        erro(`Esperado "(" na linha ${linhaAtual+1}`, 'add')
        // Verificar os parenteses e chamar o termo que está dentro da função echo:
    }else if(proximoSimbolo(linhaTemosPos, linhaAtual).token == "<parantese_E>"){
        let tamanho = linhas[linhaAtual].quantidadeTermos
        if(linhas[linhaAtual].conteudo[(tamanho-2)].lexema == ")"){
            linhaTemosPos+=2
            termo(getToken(linhaAtual, linhaTemosPos))
        }else{
            erro(`Esperado ")" na linha ${linhaAtual+1}`, 'add')
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
            if(proximoSimbolo(linhaTemosPos+1, linhaAtual).lexema != ")"){
                caminhoExpLinha.push(proximoSimbolo(linhaTemosPos+1, linhaAtual).token)
            }
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
            if(getToken(linhaAtual, linhaTemosPos).lexema != "("){
                termo(getToken(linhaAtual, linhaTemosPos))
            }else{
                expr()
            }
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
        erro(`Problema na função ArvoreParse`, 'add')
    }
}
// Verifica se a linha possui mais de uma (<expr>):
function eDuplaExp(subArvore){
    let cont = 0 
    subArvore.map(termo =>{
        if(termo == '(<expr>)'){
            cont++
        }
    })
    if(cont>1){
        proximaExp++
    }
}
// Insere elementos no DOM formando a árvore parser:
export function mostrarArvoreParse(arvoreParseConteudo, arg){
    // Reinicia a árvore a cada clicar do botão RUN:
    if(arg == "limparArvore" && erro('', '')){
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
                const div7 = document.createElement('div')
                const div8 = document.createElement('div')
                const div9 = document.createElement('div')
                divTerciaria.className = 'columPrincipal'
                div4.className = 'colum'
                div7.className = 'inRow'
                div5.className = 'inRow'
                div6.className = 'colum'
                // Adiciona a Raíz principal da árvore:
                if(subArvore == "<progr>"){
                    spanPrincipal.innerText = subArvore
                    spanPrincipal.className = 'raiz1 caminhos'
                    parser.appendChild(spanPrincipal)
                }else{
                    eDuplaExp(subArvore)
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
                            if(subArvore[i+1] == '<termo>' || subArvore[i+1] == '<fator>' || subArvore[i+1] == '<string>'){
                                div7.appendChild(estruturaTerminal(subArvore, i+1))
                                div6.appendChild(div7)
                                div5.appendChild(div6)
                                div4.appendChild(div5)
                            }
                        }
                        // Em análise - (Caso seja uma raiz de 5° grau):
                        // Verificar se na linha existem duas (<expr>), se sim rodar o if para add o vertice principal:
                        else if(subArvore[i] == "(<expr>)"){
                            if(proximaExp== 0 || proximaExp == 1){
                                span.innerText = subArvore[i]
                                span.className = 'raiz5 caminhos'
                                div9.appendChild(span)
                                div9.appendChild(estruturaTerminal(subArvore, i+1))
                                if(proximaExp>0){
                                    proximaExp++
                                }
                                div7.appendChild(div9)
                            }else if(proximaExp == 2){
                                if(eVertice(subArvore[i-1])){
                                    const vertice = document.createElement('span')
                                    vertice.innerText = subArvore[i-1]
                                    vertice.className = 'vertice caminhos'
                                    div7.appendChild(vertice)
                                }
                                span.innerText = subArvore[i]
                                span.className = 'raiz5 caminhos'
                                div8.appendChild(span)
                                div8.appendChild(estruturaTerminal(subArvore, i+1))
                            }
                            // div9.appendChild(div10)
                            // div8.appendChild(div9)
                            div7.appendChild(div8)
                            div6.appendChild(div7)
                            div5.appendChild(div6)
                            div4.appendChild(div5)
                        }
                        // Adiciona as div's com raizes de 3° grau na div Terciária:
                        divTerciaria.appendChild(div4)
                        // Adiciona toda div2 na divPrincipal:
                        divPrincipal.appendChild(divSecundaria)
                    }
                    // Ao fim do análise de cada subArvore é adicionada no DOM e vai para a árvore seguinte:
                    parser.appendChild(divPrincipal)
                }
                if(proximaExp != 0){
                    proximaExp = 0
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
            let identificadores = /(\$[a-z\_\-]{1,}[0-9]?)/i
            for(let i=posicaoAtual; i<subArvore.length; i++){
                    if(eVertice(proximoSimbolo(linhaTemosPos, linhaAtual))){
                        break
                    }else{
                        const span = document.createElement('span')
                        span.className = 'caminhos'
                        span.innerText = subArvore[i]
                        div3.appendChild(span)
                        if(eNumero(subArvore[i]) || identificadores.test(subArvore[i])){
                            break
                        }
                    }
            }
            div.appendChild(div3)
        }
        // retorna o container:
        return div
}
// Verifica se o valor recebido é um vértice ou não e retorna um boolean:
export function eVertice(valor){
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
            if(subArvore[i+1] == '(<expr>)' && proximaExp > 0){
                return false
            }else{
                return true
            }
        }
    }
    return false
}