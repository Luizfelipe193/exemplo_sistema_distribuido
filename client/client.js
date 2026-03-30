const readline = require('readline'); // Ferramenta poderosa nativa para capturar teclados  
 
// O CONCEITO MÁXIMO DA DESVINCULAÇÃO ARQUITETURAL:  
// O Cliente SÓ ENXERGA E SÓ SABE DISCUTIR E VISITAR a porta divina: 4000 (O Gateway).  
// Ele jamais viu sequer as portas 3001, 3002 ou 3003 em sua vida. 
const GATEWAY_BASE_URL = 'http://localhost:4000'; 
 
const rl = readline.createInterface({ 
    input: process.stdin,  // Lê o seu teclado na tela preta 
    output: process.stdout // Printa para você como output 
}); 
 
/* 
  Ao chamar a função, ela fará a solicitação para a URL do Gateway batend
o lá, 
  esperará a resposta chegar do longo caminho, e pintará "pretty" (boniti
nho) na nossa tela. 
*/ 
async function callApi(path) { 
    try { 
        // Envia o chamado para "http://localhost:4000" + "/api/service-a/info"  
        const response = await fetch(`${GATEWAY_BASE_URL}${path}`);  
        const data = await response.json(); 
 
        console.log('\n=============================== RESPOSTA FINAL =========================\n'); 
        // O 2 no final abaixo faz indentação de espaços para não imprimir uma linha morta embolada de informações. 
        console.log(JSON.stringify(data, null, 2));  
        console.log('\n==============================================================================\n'); 
    } catch (error) { 
        console.error('\nErro ao bater na porta. Você ligou O GATEWAY no terminal e ele explodiu? O Node 18+ está ativo?\n'); 
    } 
} 
 
// O nosso painel de controle verde de missões (Menu Interativo) 
function showMenu() { 
    console.log('--- LABORATÓRIO API GATEWAY ---'); 
    console.log('Escolha uma opcao apertando seu numero correspondente:'); 
    console.log('1 - Realizar Pedido Avulso ao Servico A (Via Gateway)'); 
    console.log('2 - Realizar Pedido Avulso ao Servico B (Via Gateway)'); 
    console.log('3 - Realizar Pedido Avulso ao Servico C (Via Gateway)'); 
    console.log('4 - Executar o Megazord (Agregador Simultâneo de Três Serviços)'); 
    console.log('0 - Desligar Terminal do Cliente'); 
 
    // Função rl.question paralisa as engrenagens esperando você colocar os dedinhos e apertar número+enter 
    rl.question('\nQual a sua vontade (número): ', async (option) => { 
        // Switch case é o analista de opções que engatilha o código adequado baseando-se no que digitou. 
        switch (option) { 
            case '1': await callApi('/api/service-a/info'); break; // Caso seja 1, chama o caminho A 
            case '2': await callApi('/api/service-b/info'); break; // Chama o caminho B 
            case '3': await callApi('/api/service-c/info'); break; // Chama o caminho C 
            case '4': await callApi('/api/all'); break; // Chama a Agregação Master 
            case '0': 
                console.log('Encerrando programa de terminal. Bons estudos!'); 
                rl.close(); 
                return; // O único que não gera loop. O return encerra tudo. 
            default: 
                console.log('Aí já não dá... Número inválido, espertinho.\n'); 
        } 
        showMenu(); // Roda a nossa própria função recursivamente de volta criando um laço eterno 
    }); 
} 
 
console.log('🚀 Cliente iniciado sob blindagem visual ao Gateway!'); 
showMenu(); 
