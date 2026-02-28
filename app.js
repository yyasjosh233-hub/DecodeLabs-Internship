const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const postsRoutes = require('./routes/posts');
const contactRoutes = require('./routes/contact');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));