// index.js (versão atualizada com headers)

const express = require('express');
const play = require('play-dl');
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: Adicione o user-agent do YouTube
// Isso ajuda a "camuflar" a requisição
play.setToken({
  youtube : {
    cookie : process.env.YOUTUBE_COOKIE // Carrega o cookie de uma variável de ambiente
  }
})

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.send('API de Download do YouTube está no ar!');
});

// A rota /info permanece a mesma
app.get('/info', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }
  try {
    const videoInfo = await play.video_info(youtubeUrl);
    res.json({ 
      videoDetails: {
        title: videoInfo.video_details.title,
        duration: videoInfo.video_details.durationInSec,
        thumbnails: videoInfo.video_details.thumbnails,
      } 
    });
  } catch (error) {
    console.error('Erro ao buscar informações do vídeo:', error.message);
    res.status(500).send({ error: 'Falha ao buscar informações do vídeo. O YouTube pode ter bloqueado esta requisição.' });
  }
});

// A rota /download permanece a mesma
app.get('/download', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }
  try {
    const videoInfo = await play.video_info(youtubeUrl);
    const title = videoInfo.video_details.title.replace(/[<>:"/\\|?*]+/g, '');
    const stream = await play.stream(youtubeUrl);
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    stream.stream.pipe(res);
  } catch (error) {
    console.error('Erro no download do vídeo:', error.message);
    res.status(500).send({ error: 'Falha ao baixar o vídeo.' });
  }
});

// A rota /mp3 permanece a mesma
app.get('/mp3', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }
  try {
    const videoInfo = await play.video_info(youtubeUrl);
    const title = videoInfo.video_details.title.replace(/[<>:"/\\|?*]+/g, '');
    const stream = await play.stream(youtubeUrl, { quality: 2 });
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    stream.stream.pipe(res);
  } catch (error) {
    console.error('Erro no download do áudio:', error.message);
    res.status(500).send({ error: 'Falha ao baixar o áudio.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
