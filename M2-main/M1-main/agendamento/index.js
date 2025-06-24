require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { sequelize } = require('./models');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const { User } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.emails[0].value } });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        google_id: profile.id,
        role: 'user',
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Swagger - carregar YAMLs
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Agendamento de Consultas',
    version: '1.0.0',
    description: 'Documentação da API para gestão de pacientes, médicos e consultas',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
};

const usersDocs = yaml.load('./docs/users.yaml');
const doctorsDocs = yaml.load('./docs/doctors.yaml');
const appointmentsDocs = yaml.load('./docs/appointments.yaml');
const specialtiesDocs = yaml.load('./docs/specialties.yaml');
const prefixPaths = (paths, prefix) =>
  Object.fromEntries(
    Object.entries(paths).map(([key, value]) => [`${prefix}${key}`, value])
  );

const swaggerDocument = {
  ...swaggerDefinition,
  paths: {
    ...prefixPaths(usersDocs.paths, '/api'),
    ...prefixPaths(doctorsDocs.paths, '/api'),
    ...prefixPaths(appointmentsDocs.paths, '/api'),
    ...prefixPaths(specialtiesDocs.paths, '/api'),
  },
};

// Servir arquivos públicos (ex: Swagger JSON gerado ou assets)
app.use(express.static(path.join(__dirname, 'public')));

// Rota Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de entrada para login Google
app.get('/login', (req, res) => {
  res.send('<a href="/auth/google">Clique aqui para fazer login com Google</a>');
});

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas principais da API
app.use('/api', routes);

// Inicialização do servidor
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Base de dados sincronizada');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
    console.log(`📚 Swagger disponível em http://localhost:${PORT}/api-docs`);
    console.log(`🔐 Login Google em http://localhost:${PORT}/login`);
  });
});
