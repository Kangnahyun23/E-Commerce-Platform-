const express = require('express');
const app = express();
const PORT = 5000; // Bạn có thể đổi cổng tùy ý

app.get('/', (req, res) => {
    res.json({ message: "Chào mừng bạn đến với dự án SWD Backend!" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});