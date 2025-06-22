const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Iniciar autenticação com Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',        // força sempre a tela de escolha de conta
  accessType: 'offline',
  includeGrantedScopes: true
}));


// Callback do Google após o login
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    const user = req.user;

    if (!user) {
      return res.redirect('/auth/failure');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Redirecionar para o frontend (ajusta para o teu URL real se necessário)
    res.redirect(`http://localhost:3001/?token=${token}`);
  }
);

// Falha de autenticação
router.get('/failure', (req, res) => {
  res.status(401).send('❌ Falha na autenticação com Google.');
});

// Endpoint opcional para verificar token atual (útil para debug)
router.get('/token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado.' });
  }
  res.json({ token });
});

module.exports = router;
