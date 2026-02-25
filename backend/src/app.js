const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 200, message: 'OK' }));

module.exports = app;
