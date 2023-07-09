// Importação de funções para comunicação dos módulos
import { addTabela , erro } from "../main.js"
import { separarLinhas } from "./analisador-sintatico.js"
// Variaveis responsaveis pela separação dos lexemas e guardar os lexemas:
var sequencia = ''
var qtd_aspas = 1
var strings = []
var posicaoDaString = 0
var lexemas = []
// Exporta a função para ser inicializada sempre que o botão RUN for clicado:
export function limparVariaveisGlobaisLex(){
    sequencia = ''
    qtd_aspas = 1
    strings = []
    posicaoDaString = 0
    lexemas = []
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
            frase.lexema = strings[posicaoDaString]
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
// Guarda as strings do código em strings[]:
function pegarStrings(codigo){
    let isString = /('(\s?[a-z ]{2,}[+-\/*]?[à-ú]?([:!\.=,]{1,})?){1,}')|("(\s?[a-z ]{2,}[+-\/*]?[à-ú]?([:!\.=,]{1,})?){1,}")/gi
    let stringDoCodigo = []
    stringDoCodigo = codigo.match(isString)
    if(stringDoCodigo != null)
        return stringDoCodigo
}
// recebe o codigo digitado, transforma em string e guarda os lexemas do código em um array:
// Em seguida, após a análise léxica ele chama a função do analisador sintático:
export function lex(textArea){
    if(textArea == ""){
        alert("Nenhum código encontrado. Por favor verifique seu editor!")
    }else{
        let codigo = textArea
        codigo = prepararString(codigo)
        strings = pegarStrings(codigo)
        codigo = tirarStings_doCodigo(codigo)
        identificarLexemas(codigo)
        // Funções do analisador sintático:
        separarLinhas(lexemas)
    }
}
// Retira as strings do código para criar lexemas com seus valores:
function tirarStings_doCodigo(codigo){
    if(strings != null){
        strings.forEach(frase =>{
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
    addTabela('', lexemas)
}
// Cria os tokens de acordo com o caractere passado de identificarLexemas():
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
        erro(erroEspecifico, 'add')
    }
}