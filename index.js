const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const { router: authRouter } = require('./routes/auth');
const categoriasRouter = require('./routes/categorias');
const gastosRouter = require('./routes/gastos');
const receitasRouter = require('./routes/receitas');
const metasRouter = require('./routes/metas');
const relatoriosRouter = require('./routes/relatorios');

app.use('/api/auth', authRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/gastos', gastosRouter);
app.use('/api/receitas', receitasRouter);
app.use('/api/metas', metasRouter);
app.use('/api/relatorios', relatoriosRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API de Controle Financeiro Pessoal',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      categorias: '/api/categorias',
      gastos: '/api/gastos',
      receitas: '/api/receitas',
      metas: '/api/metas',
      relatorios: '/api/relatorios',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Documentação disponível em http://localhost:${port}/api-docs`);
});

module.exports = app;
