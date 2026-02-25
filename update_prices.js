const fs = require('fs');

function lowerPrices(file) {
    let content = fs.readFileSync(file, 'utf8');
    // For seed.js (string format)
    content = content.replace(/price:\s*'(\d+)'/g, (match, p1) => `price: '${Math.floor(parseInt(p1) / 5)}'`);
    content = content.replace(/salePrice:\s*'(\d+)'/g, (match, p1) => `salePrice: '${Math.floor(parseInt(p1) / 5)}'`);

    // For mockProducts.js (number format)
    content = content.replace(/price:\s*(\d+)/g, (match, p1) => {
        // Avoid replacing small numbers or non-prices if any, but in this context all price: \d+ are valid.
        if (parseInt(p1) < 1000) return match;
        return `price: ${Math.floor(parseInt(p1) / 5)}`;
    });
    content = content.replace(/salePrice:\s*(\d+)/g, (match, p1) => {
        if (parseInt(p1) < 1000) return match;
        return `salePrice: ${Math.floor(parseInt(p1) / 5)}`;
    });

    fs.writeFileSync(file, content);
    console.log('Updated prices for ' + file);
}

lowerPrices('e:/Kinhtot_swd392/backend/prisma/seed.js');
lowerPrices('e:/Kinhtot_swd392/frontend/src/data/mockProducts.js');
