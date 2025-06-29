const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para garantir autenticação
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.post('/search', ensureAuth, async (req, res) => {
  const term = req.body.term;

  // Debug
  console.log('Termo de pesquisa:', term);
  console.log('Chave Weather:', process.env.API_KEY_WEATHER);
  console.log('Chave News:', process.env.API_KEY_NEWS);

  try {
    const [weatherRes, newsRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: term,
          appid: process.env.API_KEY_WEATHER,
          units: 'metric'
        }
      }),
      axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: term,
          apiKey: process.env.API_KEY_NEWS
        }
      })
    ]);

    // Guardar histórico do utilizador
    req.user.history.push(term);
    await req.user.save();

    res.render('api/results', {
      user: req.user,
      term: term,
      weather: weatherRes.data,
      news: newsRes.data.articles.slice(0, 5)
    });

  } catch (err) {
    console.error('Erro nas APIs:', err.response?.data || err.message);
    res.send('Erro ao obter dados das APIs.');
  }
});

module.exports = router;


