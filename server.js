const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;
const productsFilePath = path.join(__dirname, 'products.json');

app.get('/products', (req, res) => {
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении файла');
        }
        res.json(JSON.parse(data));
    });
});

// Слушаем запросы на порт 3000 для фронтенда
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});
