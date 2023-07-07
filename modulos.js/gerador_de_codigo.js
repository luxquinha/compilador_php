import { saidas } from "../main.js"
import { erro } from "../main.js"
import { eVertice } from "./analisador-sintatico.js";

var resumoLinha = []

export function gerarCodigo(linhasDeCodigo){
    console.log(linhasDeCodigo);
    if(linhasDeCodigo[0] == "<progr>"){
        for(let i=1; i<(linhasDeCodigo.length);i++){
            traduzirAcao(linhasDeCodigo[i])
        }
        console.log(resumoLinha);
    }else{
        erro(`Necessário usar as tags de abertura do código '<php' e '?>'`)
    }
}
export function limparVariaveisGlobaisGerador(){
    resumoLinha = []
}
class Acao{
    constructor(){
        this.tipo = '',
        this.nomeVariavel = '',
        this.valor = ''
    }
}
function traduzirAcao(linha){
    let resultado = new Acao()
    if(linha[1] == '<atribuição>'){
        resultado.tipo = linha[1]
        resultado.nome = linha[3]
        resultado.valor = verificarValorNumerico(linha, 5)
        resumoLinha.push(resultado)
    }
}
function eNumero(valor){
    let numero = /(^[0-9][.]?)/
    if(numero.test(valor)){
        return true
    }else{
        return false
    }

}
function proximoSimbolo(linha, posicaoAtual){
    return (linha[posicaoAtual+1] != null) ? linha[posicaoAtual+1] : linha[posicaoAtual-1]
}
function verificarValorNumerico(linha, posicaoValor){
    for(let i=posicaoValor; i<(linha.length);i++){
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
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
function operacaoSoma(linha, posicaoAtual, primeiroValor){
    for(let i=posicaoAtual; i<(linha.length);i++){
        if(eNumero(linha[i])){
            let numero = Number(linha[i])
            primeiroValor+=numero
            if(!eVertice(proximoSimbolo(linha, i))){
                return primeiroValor
            }else{
                
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
            }else{
                
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
            }
        }
    }
}