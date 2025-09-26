const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve HTML files from the 'src/views' directory
app.use(express.static(path.join(__dirname, 'views')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Add other routes here

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
