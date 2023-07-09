// Comunicação entre a main e os módulos:
import { lex, limparVariaveisGlobaisLex } from "./modulos.js/analisador-lex.js"
import {mostrarArvoreParse , limparVariaveisGlobaissintatico} from "./modulos.js/analisador-sintatico.js"
import { limparVariaveisGlobaisGerador } from "./modulos.js/gerador_de_codigo.js"
// =====================Instâncias do DOM=======================================
// código ou arquivo do usuário:
const textArea = document.querySelector("#codigo")
var arquivo = document.querySelector("#arquivo")
// páginas repectivas aos menus:
const pag1 = document.querySelector("#compilador")
const pag2 = document.querySelector("#arvore")
const pag3 = document.querySelector("#tabela")
// Titulo principal:
const titulo = document.querySelector("#titulo_da_pagina")
// Possiveis saidas pro usuário:
const tokens = document.querySelector("#tabelaSimbolos")
export const saidas = document.querySelector("#saidas")
export const parser = document.querySelector("#parser")
// Instanciando os botões do DOM:
const executar = document.querySelector("#btn-run")
const limpar = document.querySelector("#clear")
// Array que guarda todos os erros da compilação:
var erroCompilacao = []
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
// Para a página já começar com o terminal ativo:
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
    })
    if(codigo){
        leitor.readAsText(codigo)
    }
})
// Cada click do botão as variavéis são reiniciadas e é chamada a analise léxica do código:
executar.addEventListener('click', ()=>{
    if(textArea.value !== ''){
        reiniciarVariaveisGlobais()
        // Reinicia a tabela e a árvore parser:
        addTabela("limparTabela", null)
        mostrarArvoreParse(null, 'limparArvore')
    }
    // Chama lex enviando o código bruto como parâmetro:
    lex(textArea.value)
})
// Ao clicar no botão é chamada a função clearCode():
limpar.addEventListener('click', ()=>{
    clearCode()
})
// Recarrega a página para as formatações originais:
function clearCode(){
    window.location.reload()
}
// Chama as funções limpar de cada página e reinicia os seus valores:
function reiniciarVariaveisGlobais(){
    limparVariaveisGlobaisLex()
    limparVariaveisGlobaissintatico()
    limparVariaveisGlobaisGerador()
    erroCompilacao = []
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
// =====================Interações com o DOM===================================
// Adiciona linhas e colunas na pagina3 da aplicação:
export function addTabela(arg, lexemas){
    const table  = document.querySelector("table")
    const corpoTabela = document.querySelector("tbody")
    if(arg == "limparTabela"){
        table.removeChild(corpoTabela)
    }else{
        const tbody = document.createElement("tbody")
        tbody.id = "corpoTabela"
        // Percorre todos os lexemas e adiciona uma linha para cada com suas informações respectivas:
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
export function erro(tipoError, arg){
    if(arg == 'add'){
        let mensagem = tipoError
        erroCompilacao.push(mensagem)
    }else if(arg == 'mostrar'){
        if(erroCompilacao.length > 0){
            erroCompilacao.map(erro =>{
                saidas.appendChild(addError(erro))
            })
            return true
        }
        else{
            saidas.appendChild(addError(''))
            return false
        }
    }else{
        return (erroCompilacao.length>0) ? true : false
    }
}
// Cria uma mensagem de sucesso ou de error e retorna pro DOM:
function addError(erro){
    const divPrincipal = document.createElement('div')
    const divIcone = document.createElement('div')
    const mensagem = document.createElement('span')
    const negrito = document.createElement('strong')
    if(erro != ''){
        divIcone.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
        </svg>`
        negrito.innerText = 'Error'
        divIcone.appendChild(negrito)
        divIcone.className = 'error'
        mensagem.innerText = erro
        divPrincipal.className = 'erroMensagem'
    }else{
        divIcone.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>`
        negrito.innerText = 'Sucesso'
        divIcone.appendChild(negrito)
        divIcone.className = 'sucesso'
        mensagem.innerText = 'Seu código foi compilado com sucesso!'
        divPrincipal.className = 'sucessoMensagem'
    }
    divPrincipal.appendChild(divIcone)
    divPrincipal.appendChild(mensagem)
    return divPrincipal
}