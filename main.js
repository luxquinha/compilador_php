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
const parser = document.querySelector("#parser")
const executar = document.querySelector("#btn-run")
const limpar = document.querySelector("#clear")
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
    })
    if(codigo){
        leitor.readAsText(codigo)
    }
})
// Cada click do botão as variavéis são reiniciadas:
executar.addEventListener('click', ()=>{
    if(textArea.value !== ''){
        reiniciarVariaveisGlobais()
        addTabela("limparTabela", null)
        mostrarArvoreParse(null, 'limparArvore')
    }
    lex(textArea.value)
})
limpar.addEventListener('click', ()=>{
    clearCode()
})
// Recarrega a página para as formatações originais:
function clearCode(){
    window.location.reload()
}
function reiniciarVariaveisGlobais(){
    limparVariaveisGlobaisLex()
    limparVariaveisGlobaissintatico()
    limparVariaveisGlobaisGerador()
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
export function erro(tipoError){
    console.log(tipoError);
    saidas.innerHTML = tipoError
}