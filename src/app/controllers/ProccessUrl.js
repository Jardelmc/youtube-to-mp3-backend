/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
import ytdl from 'ytdl-core';
import randomstring from 'randomstring';
import client from '../../lib/redis';

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

        const hash = randomstring.generate(8);

        getStartDownload(videoId, hash);

        return res.status(200).json({ hash });
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
      const hash = randomstring.generate(8);

      getStartManyDownload(relatedVideoInfo, hash);

      return res.status(200).json({ hash });
    } catch (error) {
      return res.status(200).json({ err: 'Erro ao processar solicitação' });
    }
  }

  async getFileStatus(req, res) {
    const { hash } = req.body;

    if (hash) {
      client.get(hash, (err, result) => {
        if (err) {
          return res
            .status(200)
            .json({ err: 'Não foi possível processar sua solicitação' });
        }

        if (result && result === 'erro') {
          return res
            .status(200)
            .json({ err: 'Não foi possível processar sua solicitação' });
        }
        // Se resultado veio como string e não é igual a erro
        if (result) {
          return res.status(200).json({ isReady: true });
        }

        if (!result) {
          client.get(`${hash}Temp`, (errTemp, resultTemp) => {
            if (resultTemp) {
              return res
                .status(200)
                .json({ isReady: false, tempDownloaded: resultTemp });
            }
            return res.status(200).json({ isReady: false });
          });
        }
      });
    } else {
      return res.status(200).json({});
    }
  }

  async getFile(req, res) {
    const { hash } = req.body;

    client.get(hash, (err, result) => {
      if (err) {
        return res.status(200).json({ err: 'Erro ao baixar arquivo' });
      }
      if (result) {
        return res.download(result);
      }
      return res.status(200).json({ err: 'Erro ao baixar arquivo' });
    });
  }
}

export default new ProccessUrl();
