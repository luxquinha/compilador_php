# Introdução:
Seja bem-vindo ao nosso pequeno projeto de um compilador PHP, esse projeto foi criado para 
a disciplina de Paradigmas de linguagens de programação, como trabalho de conclusão da matéria,
a seguir estão as instruções para o uso desse compilador:
_Para uma melhor leitura do README.md acesse [github] (https://github.com/luxquinha/compilador.git)_

## Estrutura da página:
A aplicação começa no menu _Terminal_, no qual está com o fundo diferente, para mostrar em qual 
menu você está navegando, de acordo com o clique em outros menus (_Árvora Parser_, _Tabela da Símbolos_)
a página mostra o conteúdo respectivo ao menu e muda o título da página, assim como o fundo do menu ativo,
para facilitar a navegação do usuário na página.

Nossa página possui três botões diferentes, são eles:
- _RUN - (Executa o código inserido no editor de código)_
- _Clear - (Limpa todo o conteudo da página, tabela, árvore parser e terminal)_
- _File - (Faz um upload de arquivos .txt para o editor de códigos)_

## Gramática Utilizada:
    <progr> -> <expr>; { <expr>;}

    <expr> -> <atribuição> 
    | <imprimir> 
    | <termo> {(+|-)<termo>} 
    | <fator> * (<expr>)

    <atribuição> -> id "=" <expr>

    <imprimir> -> echo (<termo>) 

    <termo> -> <fator> {(*|/) <fator>}
    | <string>

    <fator> -> id [. <termo>]
    | num_literal
    | (<expr>)

    <string> -> id [.<termo>]
    
__Legenda dos caracteres:__

< > - Simbolos não-Terminais

[ ] - 0 ou uma vez

{ } - 0 ou mais vezes


# Mãos na massa:

### Pré-requisitos:
- Abrir o código na IDE do Visual Studio Code;
- Baixar as extensões necessárias para rodar um arquivo.js;
- Possuir acesso a internet para que as bibliotecas de estilização sejam carregadas no código;
- Baixar a extenssão **Live Server (Five Server)** para execução do código;
- Após fazer o download da extenssão anterior, clique em _Go Live_ no canto inferior direito da IDE;

_Aproveite o Uso._

### Primeiros Passos:
- Para você começar o seu código é necessários haver as tags de inicialização do código __(<php ?>)__, se não constará 
um erro de compilação;
- Introduza o seu código entre as tags de inicialização **<php _(codigo)_ ?>**;
- Se você possuir algum **_arquivo.txt_** com um código php em seu interior, ou desejar ultilizar algum dos arquivos
disponibilizados, basta clicar em __File - Choose a file__ e selecioná-los e o seu código será inserido no editor de códigos;
- O editor de códigos do projeto aceita tabulações (\t) e quebra de linhas (\n);
- Para a Execução do código basta clicar no botão ***RUN*** que seu código será compilado.
- Você pode sobrescrever o código escolhendo outro arquivo.txt

_OBS: Em caso de erro ao compilar, mesmo com o código dentro dos padrões descritos abaixo, clique em **Clear** e insira seu
código novamente_


# Funções aceitas pelo interpretador:

### Declaração e Atribuição de variáveis:
De acordo com os padrões da linguagem PHP, todas as variavéis ao serem declaradas é necessário usar o seguinte padrão:

    _$nomeVariavel_
    
**Sempre usar espaçamento entre termos do código** e finalizar as linhas com ponto e virgula, como mostrado abaixo:

    _$nomeVariavel = valorDaVariavel;_
    
_OBS: O interpretador aceita **expressões**, **strings** ou **variavéis já instanciadas** anteriormente no lugar de 'valorDaVariavel'_
#### Exemplos de expressões aceitas pelo interpretador durante a atribuição:

    $exp1 = valor1 * (valor2 + valor3);

    $exp2 = valor1 + valor2;

    $exp3 = (valor1 * valor2) + (valor3 * valor4);

_OBS: Não somente nessas ordens de operações, os simbolos das operações matemáticas podem trocar de posições_

### Impressão de Valores no Terminal:
De acordo com os padrões da linguagem PHP, para a impressão de valores no terminal é necessário usar o seguinte padrão:

    _echo(conteudo);_

_OBS: Sempre que for imprimir alguma variavél é necessário que ela já esteja declarada anteriormento_
#### Exemplos de _'conteudos'_ aceitos na função _echo_:
- Estilos das aspas aceitas, sempre em pares: 

        _echo("String"); ou echo('String');_

- Uma string concatenada com uma variavél:

        _echo("String".$variavel); ou echo('String'.$variavel);_

_Obs: Note que **não é necessário um espaçamento dentro da string** pois a função **echo** já faz isso sozinha e sempre que for concatenar uma variavél é necessário usar o cifrão ($)_

- Uma string concatenada com uma expressão:

        _echo("String".($variavel + valorNumerico)); ou echo('String'.($variavel * valorNumerico));_

- Uma variavél concatenada com uma string:

        _echo($variavel."String"); ou echo($variavel.'String');_

- Uma variavél sozinha:
    
        _echo($variavel);_
