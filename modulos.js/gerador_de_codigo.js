import { saidas } from "../main.js"
import { erro } from "../main.js"
import { eVertice } from "./analisador-sintatico.js";

var variaveisDoCodigo = []

export function gerarCodigo(linhasDeCodigo){
    console.log(linhasDeCodigo);
    if(linhasDeCodigo[0] == "<progr>"){
        for(let i=1; i<(linhasDeCodigo.length);i++){
            traduzirAcao(linhasDeCodigo[i])
        }
        console.log(variaveisDoCodigo);
    }else{
        erro(`Necessário usar as tags de abertura do código '<php' e '?>'`)
    }
}
export function limparVariaveisGlobaisGerador(){
    variaveisDoCodigo = []
}
class Variavel{
    constructor(){
        this.nomeVariavel = '',
        this.valor = 0,
        this.tipo = ''
    }
}
function traduzirAcao(linha){
    let resultado = new Variavel()
    if(linha[1] == '<atribuição>'){
        resultado.nomeVariavel = linha[3]
        resultado.valor = verificarValorNumerico(linha, 5)
        resultado.tipo = typeof resultado.valor
        variaveisDoCodigo.push(resultado)
    }
}
function verificarValorNumerico(linha, posicaoValor){
    for(let i=posicaoValor; i<(linha.length); i++){
        let numero
        if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
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
            return valorResultante
        }else if(eNumero(linha[i])){
            numero = Number(linha[i])
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
            return numero
        }
    }
    
}
function pegarId(nomeDoId){
    let valor = 0
    variaveisDoCodigo.map(el =>{
        if(el.nomeVariavel == nomeDoId){
            valor = el.valor
        }
    })
    return valor
}
function eNumero(valor){
    let numero = /(^[0-9][.]?)/
    if(numero.test(valor) && !eId(valor)){
        return true
    }else{
        return false
    }
}
function eId(valor){
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
function proximoSimbolo(linha, posicaoAtual){
    return (linha[posicaoAtual+1] != null) ? linha[posicaoAtual+1] : linha[posicaoAtual-1]
}
function operacaoSoma(linha, posicaoAtual, primeiroValor){
    for(let i=posicaoAtual; i<(linha.length);i++){
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            primeiroValor+=numero
            if(!eVertice(proximoSimbolo(linha, i))){
                return primeiroValor
            }
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            primeiroValor+=valorResultante
            if(!eVertice(proximoSimbolo(linha,i))){
                return primeiroValor 
            }
        }
    }
}
function operacaoSub(linha, posicaoAtual, primeiroValor){
    for(let i=posicaoAtual; i<(linha.length);i++){
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            primeiroValor-=numero
            if(!eVertice(proximoSimbolo(linha, i))){
                return primeiroValor
            }
        }else if(eId(linha[i])){
            let valorResultante = pegarId(linha[i])
            primeiroValor-=valorResultante
            if(!eVertice(proximoSimbolo(linha,i))){
                return primeiroValor 
            }
        }
    }
}
function operacaoMult(linha, posicaoAtual, primeiroValor){
    if(linha[posicaoAtual] == '(<expr>)'){
        for(let i=posicaoAtual; i<(linha.length);i++){
            if(eNumero(linha[i])){
                let numero = Number(linha[i])
                if(eVertice(proximoSimbolo(linha, i))){
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        numero = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        numero = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        numero = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        numero = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor*=numero
                    return primeiroValor
                }
            }else if(eId(linha[i])){
                let valorResultante = pegarId(linha[i])
                if(eVertice(proximoSimbolo(linha, i))){
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorResultante = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorResultante = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorResultante = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorResultante = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor*=valorResultante
                    return primeiroValor
                }
            }
        }
    }else{
        for(let i=posicaoAtual; i<(linha.length);i++){
            if(eNumero(linha[i])){
                let numero = Number(linha[i])
                primeiroValor*=numero
                if(!eVertice(proximoSimbolo(linha, i))){
                    return primeiroValor
                }
            }else if(eId(linha[i])){
                let valorResultante = pegarId(linha[i])
                primeiroValor*=valorResultante
                if(!eVertice(proximoSimbolo(linha,i))){
                    return primeiroValor 
                }
            }
        }
    }
}
function operacaoDiv(linha, posicaoAtual, primeiroValor){
    if(linha[posicaoAtual] == '(<expr>)'){
        for(let i=posicaoAtual; i<(linha.length);i++){
            if(eNumero(linha[i])){
                let numero = Number(linha[i])
                if(eVertice(proximoSimbolo(linha, i))){
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        numero = operacaoSoma(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        numero = operacaoSub(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        numero = operacaoMult(linha, i+2, numero)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        numero = operacaoDiv(linha, i+2, numero)
                    }
                    primeiroValor/=numero
                    return primeiroValor
                }
            }else if(eId(linha[i])){
                let valorResultante = pegarId(linha[i])
                if(eVertice(proximoSimbolo(linha, i))){
                    if(proximoSimbolo(linha,i) == '<op_soma>'){
                        valorResultante = operacaoSoma(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_subtração>'){
                        valorResultante = operacaoSub(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_multiplica>'){
                        valorResultante = operacaoMult(linha, i+2, valorResultante)
                    }else if(proximoSimbolo(linha,i) == '<op_divide>'){
                        valorResultante = operacaoDiv(linha, i+2, valorResultante)
                    }
                    primeiroValor/=valorResultante
                    return primeiroValor
                }
            }
        }
    }else{
        for(let i=posicaoAtual; i<(linha.length);i++){
            if(eNumero(linha[i])){
                let numero = Number(linha[i])
                primeiroValor/=numero
                if(!eVertice(proximoSimbolo(linha, i))){
                    return primeiroValor
                }else{
                    
                }
            }else if(eId(linha[i])){
                let valorResultante = pegarId(linha[i])
                primeiroValor/=valorResultante
                if(!eVertice(proximoSimbolo(linha,i))){
                    return primeiroValor 
                }
            }
        }
    }
}