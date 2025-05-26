const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

const clients = {
    customers: [],
    admins: []
};

wss.on('connection', (ws) => {
    console.log('Новое подключение');
    
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        // Определяем тип пользователя (админ или покупатель)
        if (parsedMessage.sender === 'Администратор') {
            // Отправляем сообщение всем покупателям
            clients.customers.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } else {
            // Отправляем сообщение всем администраторам
            clients.admins.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        }
    });

    // Простая логика определения типа пользователя
    // В реальном приложении нужно использовать аутентификацию
    ws.on('close', () => {
        clients.customers = clients.customers.filter(client => client !== ws);
        clients.admins = clients.admins.filter(client => client !== ws);
    });

    // По умолчанию считаем всех новыми пользователями покупателями
    // Администраторы должны отправить специальное сообщение при подключении
    clients.customers.push(ws);
});

console.log('WebSocket сервер запущен на ws://localhost:8081');