const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT_SRV || 3000;


app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));


require('./router')(app);

app.listen(port, () => console.log(`Listening on port ${port}`));