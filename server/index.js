const next = require('next');

const expressServer = require('./server');
const clientRoutes = require('./routes/client/index');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = clientRoutes.getRequestHandler(app);

app.prepare()
  .then(() => {
    expressServer(handler);
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });



