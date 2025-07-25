// index.js (versão atualizada com play-dl)

const express = require('express');
const play = require('play-dl');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir requisições de outras origens (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.send('API de Download do YouTube está no ar! Use as rotas /info, /download, ou /mp3.');
});

// Rota para obter informações do vídeo
app.get('/info', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }

  try {
    const videoInfo = await play.video_info(youtubeUrl);
    // Enviamos apenas os detalhes que nosso front-end precisa
    res.json({ 
      videoDetails: {
        title: videoInfo.video_details.title,
        duration: videoInfo.video_details.durationInSec,
        thumbnails: videoInfo.video_details.thumbnails,
      } 
    });
  } catch (error) {
    console.error('Erro ao buscar informações do vídeo:', error.message);
    res.status(500).send({ error: 'Falha ao buscar informações do vídeo.' });
  }
});

// Rota para baixar o vídeo (MP4)
app.get('/download', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }

  try {
    const videoInfo = await play.video_info(youtubeUrl);
    const title = videoInfo.video_details.title.replace(/[<>:"/\\|?*]+/g, ''); // Remove caracteres inválidos

    const stream = await play.stream(youtubeUrl);
    
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    stream.stream.pipe(res);

  } catch (error) {
    console.error('Erro no download do vídeo:', error.message);
    res.status(500).send({ error: 'Falha ao baixar o vídeo.' });
  }
});

// Rota para baixar apenas o áudio (MP3)
app.get('/mp3', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl || !play.validate(youtubeUrl)) {
    return res.status(400).send({ error: 'URL do YouTube inválida ou não fornecida.' });
  }

  try {
    const videoInfo = await play.video_info(youtubeUrl);
    const title = videoInfo.video_details.title.replace(/[<>:"/\\|?*]+/g, ''); // Remove caracteres inválidos

    // A play-dl baixa o áudio de melhor qualidade disponível (geralmente .webm ou .m4a)
    const stream = await play.stream(youtubeUrl, {
      quality: 2 // Prioriza streams de áudio
    });

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
