// Importamos o "express" para criar o servidor facilmente 
const express = require('express'); 
// Importamos o "os", uma biblioteca que fornece métodos utilitários para
const os = require('os'); 
// Iniciamos o nosso aplicativo express criando o "app" 
const app = express(); 
// Definimos a "porta". A porta é como se fosse o "guichê" no computador 

const PORT = 3002; // O SERVIÇO A FICA NO GUICHÊ 3002! 
// Avisamos ao servidor que ele deve entender os dados que chegam no formato Json
app.use(express.json()); 
/*  
Esta função é uma "mágica". Ela investiga as placas de rede do seu comp
utador 
e descobre o seu atual IP de rede local do laboratório (ex: 192.168.0.
x). 
  Isso é usado para a gente provar visualmente de qual serviço a resposta
 veio. 
*/ 
function getLocalIP() { 
    // Busca todas as interfaces de rede do computador 
    const interfaces = os.networkInterfaces(); 
     
    // Vasculha cada uma das redes e pega os protocolos (aliases) 
    for (const interfaceName in interfaces) { 
        const iface = interfaces[interfaceName]; 
        for (const alias of iface) { 
            // Se for IPv4 (tipo comum de IP) e não for um IP interno (como localhost)
            if (alias.family === 'IPv4' && !alias.internal) { 
                return alias.address; // Retorna o IP encontrado! 
            } 
        } 
    } 
    return 'IP não encontrado'; 
} 
 
/* 
  Criamos uma "rota" chamada /info. 
  Sempre que alguém na internet ou no computador acessar "http://localhos
t:3001/info",  
  a resposta (res) abaixo será enviada no formato de um JSON perfeito. 
*/ 
app.get('/info', (req, res) => { 
    res.json({ 
        service: 'SERVICE_B', 
        message: 'Resposta do Serviço B', 
        machineHostname: os.hostname(),  
        ip: getLocalIP(),              
        timestamp: new Date().toISOString() 
    }); 
}); 
 
/* 
  A rota Health Check ("Verificador de Saúde").  
  Usado em empresas reais para computadores vigias checarem a cada 5 segu
ndos  
  se este serviço ainda está "vivo" ou se a máquina travou e precisa rece
ber choque elétrico! 
*/ 
app.get('/health', (req, res) => { 
    res.json({ 
        service: 'SERVICE_B', 
status: 'UP' 
}); 
}); 
// A ordem final: Ligar o servidor! Ordenamos que ele fique ouvindo (listen) 
app.listen(PORT, '0.0.0.0', () => { 
console.log(`SERVICE_B rodando na porta ${PORT}`); 
});