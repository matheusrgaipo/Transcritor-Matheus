import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const pastaVideos = '/Users/matheusgaipo/Documents/Drive Turbo'; // Pasta de entrada
const pastaVideosProcessados = path.join(pastaVideos, 'Videos Processados'); // Pasta para vídeos processados
const pastaAudios = path.join(pastaVideos, 'Audios'); // Pasta para áudios gerados

// Garante que as pastas de saída existam
[pastaVideosProcessados, pastaAudios].forEach(pasta => {
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);
});

// Lista apenas arquivos de vídeo na pasta principal
const extensoesVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.ogg','.m4a', '.aac', '.wav','.mp3']; // Tipos de vídeo permitidos
const arquivosVideos = fs.readdirSync(pastaVideos)
  .filter(arquivo => {
    const caminhoCompleto = path.join(pastaVideos, arquivo);
    return fs.statSync(caminhoCompleto).isFile() && extensoesVideo.includes(path.extname(arquivo).toLowerCase());
  });

if (arquivosVideos.length === 0) {
  console.log('Nenhum vídeo encontrado para processar.');
  process.exit(0);
}

console.log(`🎬 Encontrados ${arquivosVideos.length} vídeos para processar.`);

// Processa cada vídeo encontrado
arquivosVideos.forEach(video => {
  // Gerar session ID único para cada vídeo
  const sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);

  const caminhoOriginal = path.join(pastaVideos, video);
  const caminhoAudio = path.join(pastaAudios, `${path.parse(video).name}_${sessionId}_audio.flac`);
  const caminhoProcessado = path.join(pastaVideosProcessados, video);

  console.log(`🎬 Processando: ${video}`);

  ffmpeg(caminhoOriginal)
    .output(caminhoAudio)
    .audioCodec('flac') // Usando FLAC (lossless)
    .audioChannels(1) // Mono para melhor reconhecimento
    .audioFrequency(16000) // Taxa de amostragem de 16kHz
    .audioBitrate('192k') // Alta qualidade para FLAC
    .outputOptions([
      '-ar 16000', // Taxa de amostragem fixa em 16kHz
      '-ac 1', // Canal mono
      '-sample_fmt s16', // Formato de amostra LINEAR16
      '-compression_level 0' // Máxima qualidade de compressão FLAC
    ])
    .on('start', (commandLine) => {
      console.log('🔄 Comando FFmpeg:', commandLine);
    })
    .on('progress', (progress) => {
      console.log(`⏳ Progresso: ${Math.round(progress.percent)}%`);
    })
    .on('end', () => {
      console.log(`✅ Áudio gerado: ${caminhoAudio}`);
    
      // Move o vídeo processado para a pasta de vídeos processados
      fs.renameSync(caminhoOriginal, caminhoProcessado);
      console.log(`📂 Vídeo movido para: ${caminhoProcessado}`);
    
      // Verifica se ainda há vídeos na pasta principal (apenas para log)
      const videosRestantes = fs.readdirSync(pastaVideos)
        .filter(arquivo => {
          const caminhoCompleto = path.join(pastaVideos, arquivo);
          return fs.statSync(caminhoCompleto).isFile() && extensoesVideo.includes(path.extname(arquivo).toLowerCase());
        });
    
      if (videosRestantes.length === 0) {
        console.log('🎉 Todos os vídeos foram processados!');
      }
    })
    .on('error', (err) => {
      console.error('❌ Erro ao processar o áudio:', err);
      console.error('Detalhes do erro:', err.message);
    })
    .run();
})