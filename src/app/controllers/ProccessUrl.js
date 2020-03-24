/* eslint-disable func-names */
/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

import { sleep } from '../utils/functionsUtil';

import { getStartDownload, getStartManyDownload } from '../utils/downloadUtil';

class ProccessUrl {
  async getVideoInfo(req, res) {
    try {
      const { youtubeUrl } = req.body;

      if (!youtubeUrl) {
        return res.status(200).json();
      }

      const isUrlValid = ytdl.validateURL(youtubeUrl);

      if (isUrlValid) {
        const videoId = ytdl.getVideoID(youtubeUrl);
        const videoInfo = await ytdl.getInfo(
          `https://www.youtube.com/watch?v=${videoId}`
        );

        const { title, related_videos } = videoInfo;

        const thumbnailUrl =
          videoInfo.player_response.videoDetails.thumbnail.thumbnails[0].url;

        let relatedVideoInfo = [];

        if (related_videos && related_videos.length > 0) {
          relatedVideoInfo = related_videos.map(x => {
            const relatedId = x.id;
            const relatedTitle = x.title;
            const relatedThumbnail = x.video_thumbnail;

            return { relatedId, relatedTitle, relatedThumbnail };
          });
        }

        const payload = { title, thumbnailUrl, videoId, relatedVideoInfo };

        return res.status(200).json(payload);
      }
    } catch (error) {
      return res.status(200).json({});
    }
    return res.status(200).json({});
  }

  async requestNewDownload(req, res) {
    try {
      const { youtubeUrl } = req.body;

      if (!youtubeUrl) {
        return res.status(200).json({ err: 'Nenhum link recebido' });
      }

      const isUrlValid = ytdl.validateURL(youtubeUrl);

      if (isUrlValid) {
        const videoId = ytdl.getVideoID(youtubeUrl);

        const hash = await getStartDownload(videoId);

        const pathToYoutubeFolder = path.join(
          __dirname,
          '..',
          '..',
          'audios',
          'youtube',
          hash
        );

        let fileReady = null;
        let files = null;

        let count = 0;

        while (true || count > 180) {
          files = [];

          fs.readdirSync(pathToYoutubeFolder).forEach(file => {
            files.push(file);
          });

          if (files.length === 2) {
            fileReady = files.filter(x => x !== 'finish');
            break;
          }

          await sleep(1);
          console.log('Aguardando conclusão do download');

          count += 1;
        }

        return res.download(
          path.resolve(pathToYoutubeFolder, `${fileReady[0]}`)
        );
      }
      return res.status(200).json({
        err: 'Não foi possível verificar a URL. Por favor, tente novamente',
      });
    } catch (error) {
      return res.status(200).json({ err: 'Erro ao processar solicitação' });
    }
  }

  async requestNewManyDownload(req, res) {
    try {
      const { relatedVideoInfo } = req.body;

      if (!relatedVideoInfo || relatedVideoInfo.length === 0) {
        return res.status(200).json({ err: 'Nenhum link recebido' });
      }

      const hash = await getStartManyDownload(relatedVideoInfo);

      const pathToYoutubeFolder = path.join(
        __dirname,
        '..',
        '..',
        'audios',
        'youtube',
        hash
      );

      let fileReady = null;
      let files = null;

      let count = 0;

      while (true || count > 1000) {
        files = [];

        let control = null;

        fs.readdirSync(pathToYoutubeFolder).forEach(file => {
          files.push(file);

          if (file === 'finish') {
            control = true;
          }
        });

        if (control) {
          fileReady = files.filter(x => x === 'musicas.zip');
          break;
        }

        await sleep(1);
        console.log('Aguardando conclusão do download');

        count += 1;
      }

      return res.download(path.resolve(pathToYoutubeFolder, `${fileReady[0]}`));
    } catch (error) {
      return res.status(200).json({ err: 'Erro ao processar solicitação' });
    }
  }
}

export default new ProccessUrl();
