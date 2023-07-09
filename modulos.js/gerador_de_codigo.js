// Comunicação dos módulos e com o main.js:
import { saidas, erro, parser } from "../main.js"
import { eVertice, mostrarArvoreParse } from "./analisador-sintatico.js";
// Variavéis gloais usadas para a geração do código:
var variaveisDoCodigo = []
var saidasDoCodigo = []
let contador = 1
// Exporta a função para ser inicializada sempre que o botão RUN for clicado:
export function limparVariaveisGlobaisGerador(){
    variaveisDoCodigo = []
    contador = 1
    saidasDoCodigo = []
    saidas.innerHTML = ''
}
// Envia cada linha para traduzirAcao() e execuca o código de acordo com as ações:
export function gerarCodigo(linhasDeCodigo){
    if(linhasDeCodigo[0] == "<progr>"){
        for(let i=1; i<(linhasDeCodigo.length);i++){
            traduzirAcao(linhasDeCodigo[i])
        }
        execCodigo(linhasDeCodigo)
    }else{
        erro(`Necessário usar as tags de abertura do código '<php' e '?>'`, 'add')
    }
}
// Classe Variavel para separar as variveis do código e seus valores:
class Variavel{
    constructor(){
        this.nomeVariavel = '',
        this.valor = '',
        this.tipo = ''
    }
}
// Classe para as funcionalidades do código:
class Funcao{
    constructor(){
        this.palavraChave = '',
        this.conteudo = '',
        this.tipo = ''
    }
}
// Verifica se existe uma string na linha analisada:
function possuiString(linha){
    let isString = /^('(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}')|^("(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}")/gi
    let cont =0
    linha.map(termo =>{
        if(isString.test(termo)){
            cont++
        }
    })
    return (cont>0) ? true : false
}
// Verifica qual a ação e chama as funções respectivas adicionando os valores nos arrays:
function traduzirAcao(linha){
    // Caso seja uma atribuição de valores numéricos:
    if(linha[1] == '<atribuição>' && !possuiString(linha)){
        let resultado = new Variavel()
        resultado.nomeVariavel = linha[3]
        resultado.valor = verificarValorNumerico(linha, 5)
        resultado.tipo = typeof resultado.valor
        variaveisDoCodigo.push(resultado)
        contador++
    // Caso seja uma impressão de valores:
    }else if(linha[1] == '<impressão>'){
        let funcao = new Funcao()
        funcao.palavraChave = linha[3]
        funcao.conteudo = verificarConteudoFuncao(linha, 5)
        funcao.tipo = linha[1]
        saidasDoCodigo.push(funcao)
        contador++
    // Caso seja uma atribuição de uma string:
    }else if( linha[1] == '<atribuição>' && possuiString(linha)){
        let resultado = new Variavel()
        resultado.nomeVariavel = linha[3]
        resultado.valor = verificarConteudoFuncao(linha, 5)
        resultado.tipo = typeof resultado.valor
        variaveisDoCodigo.push(resultado)
        contador++
    }
}
// Prepara a string para impressão, retirando as aspas do elemento:
function stringParaImpressao(frase){
    if(frase.startsWith('"')){
        frase = frase.replaceAll('"', '')
    }else{
        frase = frase.replaceAll("'", "")
    }
    return frase
}
// Função recurssiva que retorna o conteudo da impressão:
function verificarConteudoFuncao(linha, posicaoValor){
    // RegExp para strings e id's:
    let isString = /('(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}')|("(\s?[a-z ]{3,}[à-ú]?([:!\.,]{1,})?){1,}")/gi
    let identificadores = /(\$[a-z\_\-]{1,}[0-9]?)/i
    // Valor que vai ser retornado:
    let stringImpressa = ''
    // percorre a linhas a partir de posicaoValor:
    for(let i=posicaoValor; i<(linha.length); i++){
        // Caso seja uma string
        if(isString.test(linha[i])){
            stringImpressa = linha[i]
            stringImpressa = stringParaImpressao(stringImpressa)
            // Se não houver um vertice após o conteudo:
            if(!eVertice(proximoSimbolo(linha, i))){
                return stringImpressa
            // Verifica qual o vertice concatena com o próximo valor:
            }else{
                let valorExpressao
                if(proximoSimbolo(linha,i) == '<op_concat>'){
                    valorExpressao = verificarValorNumerico(linha, i+1)
                    stringImpressa = stringImpressa+ ' '+ valorExpressao
                }
                return stringImpressa
            }
        // Caso seja um identificador:
        }else if(identificadores.test(linha[i])){
            // Recebe o valor do id da posição:
            stringImpressa = pegarId(linha[i])
            // Se não houver um vértice ele retorna o valor recebido:
            if(!eVertice(proximoSimbolo(linha, i))){
                return stringImpressa
            // Se houver um vertice ele concatena com o proximo valor:
            }else{
                let valorExpressao
                if(proximoSimbolo(linha,i) == '<op_concat>'){
                    valorExpressao = verificarConteudoFuncao(linha, i+1)
                    stringImpressa = stringImpressa + ' ' + valorExpressao
                    stringImpressa = stringParaImpressao(stringImpressa)
                }
                return stringImpressa
            }
        }
    }
}
// Função recurssiva que retorna o valor das expressões de atribuição:
function verificarValorNumerico(linha, posicaoValor){
    // Percorre a linha a partir da posicaoValor:
    for(let i=posicaoValor; i<(linha.length); i++){
        let numero
        // Caso seja uma id:
        if(eId(linha[i])){
            // Instancia o valor respectivo do ID para valorResultante:
            let valorResultante = pegarId(linha[i])
            // Se houver um vértice ele chama a operação respectiva ao vértice:
            if(eVertice(proximoSimbolo(linha,i))){
                if(proximoSimbolo(linha , i) == '<op_soma>'){
                    valorResultante = operacaoSoma(linha, i+2, valorResultante)
                }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                    valorResultante = operacaoSub(linha, i+2, valorResultante)
                }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                    valorResultante = operacaoMult(linha, i+2, valorResultante)
                }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                    valorResultante = operacaoDiv(linha, i+2, valorResultante)
                }
            }
            // Retorna o valor final da função:
            return valorResultante
        // Caso seja um valor numérico:
        }else if(eNumero(linha[i])){
            // Converte o de string para numero pra poder efetuar as operações:
            numero = Number(linha[i])
            // Se houver um vértice ele chama a operação respectiva ao vértice:
            if(eVertice(proximoSimbolo(linha,i))){
                if(proximoSimbolo(linha,i) == '<op_soma>'){
                    numero = operacaoSoma(linha, i+2, numero)
                }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                    numero = operacaoSub(linha, i+2, numero)
                }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                    numero = operacaoMult(linha, i+2, numero)
                }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                    numero = operacaoDiv(linha, i+2, numero)
                }
            }
            // Retorna o valor final da função:
            return numero
        }
    }
}
// Retorna o valor da variavél chamada na função:
function pegarId(nomeDoId){
    let valor = ''
    variaveisDoCodigo.map(el =>{
        if(el.nomeVariavel == nomeDoId){
            valor = el.valor
        }
    })
    return valor
}
// Verifica se o valor é um número:
export function eNumero(valor){
    let numero = /(^[0-9][.]?)/
    if(numero.test(valor) && !eId(valor)){
        return true
    }else{
        return false
    }
}
// Verifica se o valor é um identificador:
export function eId(valor){
    let identificadores = /(\$[a-z\_\-]{1,}[0-9]?)/i
    let existe = false
    if(identificadores.test(valor)){
        variaveisDoCodigo.map(Element =>{
            if(Element.nomeVariavel == valor){
                existe = true
            }
        })
    }
    return existe
}
// Retorna o próximo termo da linha a partir da posicao atual:
function proximoSimbolo(linha, posicaoAtual){
    return (linha[posicaoAtual+1] != null) ? linha[posicaoAtual+1] : linha[posicaoAtual-1]
}
//Verifica se existem duas (<expr>):
function duplaExp(linha){
    let qtdExp = 0
    linha.map(termos =>{
        if(termos == "(<expr>)"){
            qtdExp++
        }
    })
    return (qtdExp > 1) ? true : false
}
// Verifica se está na primeira expressão ou não:
function ePrimeiraExp(linha, pos){
    let qtdExp = 0
    for(let i=pos; i>=0; i--){
        if(linha[i]=='(<expr>)'){
            qtdExp++
        }
    }
    return (qtdExp==1) ? true : false
}
// Operação soma recurssiva que retorna um valor final da expressão
function operacaoSoma(linha, posicaoAtual, primeiroValor){
    // Precorre a linha a partir da posicaoAtual:
    for(let i=posicaoAtual; i<(linha.length);i++){
        // Caso seja um número:
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            // Se não houver um vertice após o valor ele retorna o primeiro valor somado a numero:
            if(!eVertice(proximoSimbolo(linha, i)) && proximoSimbolo(linha, i+1) != "(<expr>)"){
                primeiroValor+=numero
                return primeiroValor
            // Se houver um vertice apos o numero:
            }else{
                // Se for uma expressão dupla ele faz uma chamada recurssiva para retornar o valor final:
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    numero+=primeiroValor
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, numero)
                    }
                    return valorExpressao2
                // Se não for uma expressão dupla:
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor+=valorExpressao
                    return primeiroValor
                }
            }
        // Caso seja um identificador, ele faz as mesmas coisa porém para id's:
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            if(!eVertice(proximoSimbolo(linha,i)) && proximoSimbolo(linha, i+1) != "(<expr>)"){
                primeiroValor+=valorResultante
                return primeiroValor 
            }else{
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    valorResultante+=primeiroValor
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, valorResultante)
                    }
                    return valorExpressao2
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor+=valorExpressao
                    return primeiroValor
                }
            }
        }
    }
}
// Operação subtração recurssiva que retorna um valor final da expressão
function operacaoSub(linha, posicaoAtual, primeiroValor){
    // Precorre a linha a partir da posicaoAtual:
    for(let i=posicaoAtual; i<(linha.length);i++){
        // Caso seja um número:
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            // Se não houver um vertice após o valor ele retorna o primeiro valor subtraido a numero:
            if(!eVertice(proximoSimbolo(linha, i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor-=numero
                return primeiroValor
            // Se houver um vertice apos o numero:
            }else{
                // Se for uma expressão dupla ele faz uma chamada recurssiva para retornar o valor final:
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    numero = primeiroValor - numero
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, numero)
                    }
                    return valorExpressao2
                // Se não for uma expressão dupla:
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor-=valorExpressao
                    return primeiroValor
                }
            }
        // Caso seja um identificador, ele faz as mesmas coisa porém para id's:
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            if(!eVertice(proximoSimbolo(linha,i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor-=valorResultante
                return primeiroValor 
            }else{
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    valorResultante = primeiroValor - valorResultante
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, valorResultante)
                    }
                    return valorExpressao2
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor-=valorExpressao
                    return primeiroValor
                }
            }
        }
    }
}
// Operação multiplicação recurssiva que retorna um valor final da expressão
function operacaoMult(linha, posicaoAtual, primeiroValor){
    // Precorre a linha a partir da posicaoAtual:
    for(let i=posicaoAtual; i<(linha.length);i++){
        // Caso seja um número:
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            // Se não houver um vertice após o valor ele retorna o primeiro valor multiplicado a numero:
            if(!eVertice(proximoSimbolo(linha, i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor*=numero
                return primeiroValor
            // Se houver um vertice apos o numero:
            }else{
                // Se for uma expressão dupla ele faz uma chamada recurssiva para retornar o valor final:
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    numero *= primeiroValor
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, numero)
                    }
                    return valorExpressao2
                // Se não for uma expressão dupla:
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor*=valorExpressao
                    return primeiroValor
                }
            }
        // Caso seja um identificador, ele faz as mesmas coisa porém para id's:
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            if(!eVertice(proximoSimbolo(linha,i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor*=valorResultante
                return primeiroValor 
            }else{
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    valorResultante *= primeiroValor
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, valorResultante)
                    }
                    return valorExpressao2
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor*=valorExpressao
                    return primeiroValor
                }
            }
        
        }
    }
}
// Operação divisão recurssiva que retorna um valor final da expressão
function operacaoDiv(linha, posicaoAtual, primeiroValor){
    // Precorre a linha a partir da posicaoAtual:
    for(let i=posicaoAtual; i<(linha.length);i++){
        // Caso seja um número:
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            // Se não houver um vertice após o valor ele retorna o primeiro valor dividido por numero:
            if(!eVertice(proximoSimbolo(linha, i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor/=numero
                return primeiroValor
            // Se houver um vertice apos o numero:
            }else{
                // Se for uma expressão dupla ele faz uma chamada recurssiva para retornar o valor final:
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    numero = primeiroValor/numero
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, numero)
                    }
                    return valorExpressao2
                // Se não for uma expressão dupla:
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor/=valorExpressao
                    return primeiroValor
                }
            }
        // Caso seja um identificador, ele faz as mesmas coisa porém para id's:
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            if(!eVertice(proximoSimbolo(linha, i)) && proximoSimbolo(linha, i) != "(<expr>)"){
                primeiroValor/=valorResultante
                return primeiroValor
            }else{
                if(duplaExp(linha) && ePrimeiraExp(linha, i)){
                    valorResultante = primeiroValor/valorResultante
                    let valorExpressao2
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao2 = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao2 = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao2 = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao2 = operacaoDiv(linha, i+2, valorResultante)
                    }
                    return valorExpressao2
                }else{
                    let valorExpressao
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorExpressao = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorExpressao = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorExpressao = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorExpressao = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor/=valorExpressao
                    return primeiroValor
                }
            }
        }
    }
}
// Função que executa as funções do código e imprime o valores no terminal:
function execCodigo(arvore){
    // Se parser estiver preenchido então ele limpa o DOM e inseri a arvore correta:
    if(parser != ''){
        parser.innerHTML = ''
    }
    // Se não houver erros ele executa o programa;
    if(!erro('', 'mostrar')){
        // Imprime a árvore parser:
        mostrarArvoreParse(arvore, '')
        // Para cada valor de saida é criado um elemento HTML para ser inserido em saidas:
        saidasDoCodigo.map(saida=>{
            const p = document.createElement('h6')
            p.innerText = saida.conteudo
            saidas.appendChild(p)
        })
    }
}