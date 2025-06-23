const express = require('express');
const router = express.Router();

// In-memory cart storage (in a real app, use a database)
let carts = {};

// Get cart
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    res.json(carts[userId] || []);
});

// Add to cart
router.post('/:userId/add', (req, res) => {
    const userId = req.params.userId;
    const item = req.body;
    
    if (!carts[userId]) {
        carts[userId] = [];
    }
    
    const existingItem = carts[userId].find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        carts[userId].push(item);
    }
    
    res.json(carts[userId]);
});

// Update cart item
router.put('/:userId/update/:itemId', (req, res) => {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    const { quantity } = req.body;
    
    if (carts[userId]) {
        const item = carts[userId].find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
        }
    }
    
    res.json(carts[userId] || []);
});

// Remove from cart
router.delete('/:userId/remove/:itemId', (req, res) => {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    
    if (carts[userId]) {
        carts[userId] = carts[userId].filter(item => item.id !== itemId);
    }
    
    res.json(carts[userId] || []);
});

module.exports = router;