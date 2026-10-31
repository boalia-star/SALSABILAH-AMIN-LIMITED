const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors());
// express.json() Built-in middleware (body-parser এর আধুনিক বিকল্প)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Data Directory Setup
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper Functions for Safe File I/O
const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return [];
    }
};

const writeData = (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        return false;
    }
};

// 1. Root & System Status Endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'success', 
        entity: 'Salsabilah Amin Empires Ltd & S.R. Electronics Park',
        message: 'POS & Automated Ledger Backend Gateway Active',
        timestamp: new Date().toISOString()
    });
});

// 2. Fetch All Products Endpoint
app.get('/api/products', (req, res) => {
    const products = readData('products.json');
    res.json({ status: 'success', count: products.length, products });
});

// 3. Add New Product Endpoint
app.post('/api/products', (req, res) => {
    const products = readData('products.json');
    const newProduct = { 
        id: `PROD-${Date.now()}`, 
        createdAt: new Date().toISOString(),
        ...req.body 
    };
    products.push(newProduct);
    
    if (writeData('products.json', products)) {
        res.status(201).json({ status: 'success', message: 'Product added successfully', product: newProduct });
    } else {
        res.status(500).json({ status: 'error', message: 'Failed to write product data' });
    }
});

// 4. Record New Sale & Update Ledger Endpoint
app.post('/api/sales', (req, res) => {
    const sales = readData('sales.json');
    const saleRecord = { 
        id: `SALE-${Date.now()}`, 
        timestamp: new Date().toISOString(), 
        ...req.body 
    };
    sales.push(saleRecord);
    
    if (writeData('sales.json', sales)) {
        res.status(201).json({ status: 'success', message: 'Sale recorded successfully', sale: saleRecord });
    } else {
        res.status(500).json({ status: 'error', message: 'Failed to record sale' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`[SALSABILAH CORE] Server running on port ${PORT}`);
});
