const express = require('express'); 
const fs = require('fs'); // Biblioteca "File System" do Node que permite ler os arquivos

const path = require('path'); 
 
const app = express(); 
// O Gateway roda na porta 4000. O chefe tem sua própria porta nobre! 
const PORT = 4000; 
 
app.use(express.json()); 
 
/*  
  A Função loadRoutes() usa o comando fs.readFileSync para ler fisicament
e 
  do HD o mapa "routes.json" que criamos e extrair o texto para o código. 
*/ 
function loadRoutes() { 
    const routesPath = path.join(__dirname, 'routes.json'); 
    const raw = fs.readFileSync(routesPath, 'utf-8'); 
    return JSON.parse(raw); // Traduz o texto em um objeto Javascript pro
cessável 
} 
 
// "Middleware": Um vigia silencioso. Tudo que chega no gateway passa por aqui 
// Ele apenas "printa" no terminal do gateway ("Olha chefe, chegou pedido de GET para /api...") e deixa passar! 
 
app.use((req, res, next) => { 
    console.log(`[GATEWAY] Encaminhando pedido para: ${req.url}`); 
    next();  
}); 
 
/* 
  A "Mágica do Caminho" (O Proxy / Atravessador)! 
  Esta função é quem de certa forma hackeia o sistema para ser o atravess
ador perfeito. 
*/ 
async function proxyRequest(serviceName, req, res, endpointPath) { 
    try { 
        const routes = loadRoutes(); // Puxa o GPS do disco 
        const targetBaseUrl = routes[serviceName]; // Pega a URL do endereço (ex: localhost:3001) 
 
        // Se o estagiário digitou errado... 
        if (!targetBaseUrl) { 
            return res.status(404).json({ error: "Serviço não catalogado no GPS" }); 
        } 
 
        // Soma o endereco (localhost:3001) com a rota pedida (/info) 
        const targetUrl = `${targetBaseUrl}${endpointPath}`; 
         
        /* 
           O poder: "fetch" avisa para o Node.js atuar como um navegador 
invisível,  
           indo até as portas ocultas puxar o arquivo pela rede.  
           O "await" fala para o código: aguarde educadamente aqui a resp
osta antes de prosseguir! 
        */ 
        const response = await fetch(targetUrl, { method: req.method }); 
        const data = await response.json(); 
 
        // Gateway agora envelopa a resposta verdadeira com sua "capa timbrada" do gateway 
        res.status(response.status).json({ 
            gateway: { 
                message: 'Resposta atravessada perfeitamente pelo API Gateway', 
                targetService: serviceName, 
                targetUrl 
            }, 
            serviceResponse: data // Resposta das origens aqui dentro 
        }); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro mortal! Falha do Gateway ao acessar o servico' }); 
    } 
} 
 
// Rotas Oficiais: A vitrine do Shopping. Quando o cliente chama o Gateway nestas rotas prontas,  
// o gateway grita a proxyRequest para a função fazer o trabalho sujo de ir buscar. 
app.get('/api/service-a/info', (req, res) => proxyRequest('serviceA', req
    , res, '/info')); 
app.get('/api/service-b/info', (req, res) => proxyRequest('serviceB', req
, res, '/info')); 
app.get('/api/service-c/info', (req, res) => proxyRequest('serviceC', req
, res, '/info')); 
 
/* 
  A Rota Suprema: O poder de fazer 3 em 1 (Agregação de chamadas simultân
eas). 
  Com Promise.all(), o Gateway vira o "Flash" correndo nos três serviços 
ao mesmo tempo 
  ao invés de fazer fila. Ele custura tudo num JSON Gigante aos mesmos mi
lissegundos. 
*/ 
app.get('/api/all', async (req, res) => { 
    try { 
        const gatewayUrl = `http://localhost:${PORT}`; 
        const [a, b, c] = await Promise.all([ 
            fetch(`${gatewayUrl}/api/service-a/info`).then(r => r.json
()), 
            fetch(`${gatewayUrl}/api/service-b/info`).then(r => r.json
()), 
            fetch(`${gatewayUrl}/api/service-c/info`).then(r => r.json()) 
        ]); 
         
        res.json({ 
            message: 'Resposta Consolidada Fabulosa dos 3 Cantos.', 
            data: { serviceA: a, serviceB: b, serviceC: c } 
        }); 
    } catch (error) { 
        res.status(500).json({ error: 'Falha do Gateway ao consolidar conexões' }); 
    } 
}); 
 
// Finaliza o Gateway: Ligar e vigiar a porta 4000 
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`API Gateway ON e reinando porta ${PORT}`); 
});