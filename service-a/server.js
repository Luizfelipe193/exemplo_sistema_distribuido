const express = require('express');
const os = require('os');

const app = express();
const PORT = 3001;

app.use(express.json());

/*
  Função correta para pegar o IP do cliente real.
  - Prioriza X-Forwarded-For (quando vem do Gateway)
  - Cai para remoteAddress se for acesso direto
*/
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];

    if (forwarded) {
        // Pode vir uma lista: "cliente, proxy, gateway"
        return forwarded.split(',')[0].trim();
    }

    return req.socket.remoteAddress;
}

/*
  (Opcional) Se ainda quiser mostrar o IP da máquina também
*/
function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return 'IP não encontrado';
}

app.get('/info', (req, res) => {
    res.json({
        service: 'SERVICE_A',
        message: 'Resposta do Serviço A',

        // 🔥 IP REAL do cliente
        clientIp: getClientIP(req),

        // 🔎 IP da máquina (debug)
        serverIp: getLocalIP(),

        machineHostname: os.hostname(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        service: 'SERVICE_A',
        status: 'UP'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVICE_A rodando na porta ${PORT}`);
});

console.log("🔥 NOVA VERSÃO DO SERVICE A ATIVA");