const next = require('next');

const config = require('./config');
const expressServer = require('./express-server');
const clientRoutes = require('./routes');
const serverRoutes = require('./routes/user');
const db = require('./db');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = clientRoutes.getRequestHandler(app);
const PORT = config.get('server.port');

const server = expressServer();

app.prepare()
  .then(() => {

    /** Back-end */
    server.use('/api/user', serverRoutes);

    /** Front end */
    server.get('*', (req, res) => {
      return handler(req, res);
    });

    db.connect()
      .then(() => {
        server.listen(PORT, (err) => {
          if (err) throw err;
          console.log(`> Server running at http://${config.get('server.host')}:${PORT}/`);
        });
      });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

module.exports = server;

