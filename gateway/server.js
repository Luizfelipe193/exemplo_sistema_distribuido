const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(express.json());

function loadRoutes() {
    const routesPath = path.join(__dirname, 'routes.json');
    const raw = fs.readFileSync(routesPath, 'utf-8');
    return JSON.parse(raw);
}

// Middleware de log
app.use((req, res, next) => {
    console.log(`[GATEWAY] ${req.method} ${req.url}`);
    next();
});

/*
  Função proxy CORRIGIDA
*/
async function proxyRequest(serviceName, req, res, endpointPath) {
    try {
        const routes = loadRoutes();
        const targetBaseUrl = routes[serviceName];

        if (!targetBaseUrl) {
            return res.status(404).json({ error: "Serviço não catalogado" });
        }

        const targetUrl = `${targetBaseUrl}${endpointPath}`;

        /*
          🔥 Monta corretamente o X-Forwarded-For
          - Se já existe, encadeia
          - Se não, inicia com o IP atual
        */
        const clientIp = req.socket.remoteAddress;
        const existingForwarded = req.headers['x-forwarded-for'];

        const xForwardedFor = existingForwarded
            ? `${existingForwarded}, ${clientIp}`
            : clientIp;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': xForwardedFor,
                'X-Forwarded-Host': req.headers.host,
                'X-Forwarded-Proto': req.protocol
            }
        });

        const data = await response.json();

        res.status(response.status).json({
            gateway: {
                message: 'Resposta atravessada perfeitamente pelo API Gateway',
                targetService: serviceName,
                targetUrl
            },
            serviceResponse: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erro no Gateway ao acessar o serviço'
        });
    }
}

// Rotas
app.get('/api/service-a/info', (req, res) =>
    proxyRequest('serviceA', req, res, '/info')
);

app.get('/api/service-b/info', (req, res) =>
    proxyRequest('serviceB', req, res, '/info')
);

app.get('/api/service-c/info', (req, res) =>
    proxyRequest('serviceC', req, res, '/info')
);

// Agregador
app.get('/api/all', async (req, res) => {
    try {
        const gatewayUrl = `http://localhost:${PORT}`;

        const [a, b, c] = await Promise.all([
            fetch(`${gatewayUrl}/api/service-a/info`).then(r => r.json()),
            fetch(`${gatewayUrl}/api/service-b/info`).then(r => r.json()),
            fetch(`${gatewayUrl}/api/service-c/info`).then(r => r.json())
        ]);

        res.json({
            message: 'Resposta Consolidada dos 3 serviços',
            data: {
                serviceA: a,
                serviceB: b,
                serviceC: c
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Falha ao consolidar serviços'
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
});