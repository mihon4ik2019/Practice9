const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 8080;

app.use(cors());
app.use(express.json());

const productsFilePath = path.join(__dirname, 'products.json');

// GraphQL схема
const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    price: Int
    description: String
    categories: [String]
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
    productsByCategory(category: String!): [Product]
  }

  type Mutation {
    addProduct(name: String!, price: Int!, description: String, categories: [String]): Product
    updateProduct(id: ID!, name: String, price: Int, description: String, categories: [String]): Product
    deleteProduct(id: ID!): String
  }
`);

const root = {
  products: () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
  },
  product: ({id}) => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(data);
    return products.find(p => p.id === id);
  },
  productsByCategory: ({category}) => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(data);
    return products.filter(p => p.categories.includes(category));
  },
  addProduct: ({name, price, description, categories}) => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(data);
    const newProduct = {
      id: (products.length + 1).toString(),
      name,
      price,
      description: description || '',
      categories: categories || []
    };
    products.push(newProduct);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    return newProduct;
  },
  updateProduct: ({id, name, price, description, categories}) => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(data);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const updatedProduct = {
      ...products[index],
      name: name || products[index].name,
      price: price || products[index].price,
      description: description || products[index].description,
      categories: categories || products[index].categories
    };
    products[index] = updatedProduct;
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    return updatedProduct;
  },
  deleteProduct: ({id}) => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(data);
    const newProducts = products.filter(p => p.id !== id);
    if (newProducts.length === products.length) throw new Error('Product not found');
    fs.writeFileSync(productsFilePath, JSON.stringify(newProducts, null, 2));
    return `Product ${id} deleted`;
  }
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

// Оригинальные REST endpoints (для администратора)
app.get('/products', (req, res) => {
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении файла');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/products', (req, res) => {
    const newProduct = req.body;
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении файла');
        }
        const products = JSON.parse(data);
        products.push(newProduct);
        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка при сохранении данных');
            }
            res.status(201).send('Товар добавлен');
        });
    });
});

app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении файла');
        }
        const products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).send('Товар не найден');
        }
        products[productIndex] = { ...products[productIndex], ...updatedProduct };
        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка при сохранении данных');
            }
            res.send('Товар обновлен');
        });
    });
});

app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении файла');
        }
        const products = JSON.parse(data);
        const updatedProducts = products.filter(p => p.id !== productId);
        if (updatedProducts.length === products.length) {
            return res.status(404).send('Товар не найден');
        }
        fs.writeFile(productsFilePath, JSON.stringify(updatedProducts, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка при сохранении данных');
            }
            res.send('Товар удален');
        });
    });
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});