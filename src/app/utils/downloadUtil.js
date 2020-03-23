/* eslint-disable no-console */
/* eslint-disable consistent-return */
import shelljs from 'shelljs';
import path from 'path';
import randomstring from 'randomstring';
import ytdl from 'ytdl-core';
import filenamify from 'filenamify';
import runCommand from '../../audios/_index';

const functions = {
  getRandomHash() {
    const hash = randomstring.generate(8);

    return hash;
  },

  async getName(url) {
    const name = await ytdl
      .getBasicInfo(url)
      .then(success => {
        const { title } = success;
        return title;
      })
      .catch(error => {
        console.log(error);
        return false;
      });

    return name;
  },

  getStringCommand(hash, urlToDownload, fileName) {
    const str = `cd youtube && ytdl ${urlToDownload} | ffmpeg -i pipe:0 -b:a 128K -vn ${hash}.mp3 &&  cp ${hash}.mp3 ./${hash}/"${fileName}.mp3" && touch ./${hash}/finish && rm ${hash}.mp3`; //

    return [str];
  },

  /**
   *
   * @param {*} hash
   * @param {*} arrayOfUrl : {relatedId, relatedTitle}
   */
  getManyStrings(hash, arrayOfUrl) {
    let str = 'cd youtube';
    arrayOfUrl.forEach(commandShell => {
      str += ' && ';
      str += `ytdl https://www.youtube.com/watch?v=${
        commandShell.relatedId
      } | ffmpeg -i pipe:0 -b:a 128K -vn ${hash}.mp3 &&  cp ${hash}.mp3 ./${hash}/"${filenamify(
        commandShell.relatedTitle
      )}.mp3" && rm ${hash}.mp3`; //
    });

    str += `&& cd ${hash} && zip -r musicas.zip ./ && cd ..`;

    str += `&& touch ./${hash}/finish`;

    return [str];
  },
};

export async function getStartDownload(url) {
  url = `https://www.youtube.com/watch?v=${url}`;

  const hash = functions.getRandomHash();

  let fileName = await functions.getName(url);

  const dir = path.join(__dirname, '..', '..', 'audios', 'youtube', hash);
  shelljs.mkdir('-p', dir);

  fileName = filenamify(fileName);

  if (fileName) {
    const commands = functions.getStringCommand(hash, url, fileName);

    await runCommand(commands, (success, err) => {
      if (success) {
        console.log('Script corrido');

        return 'Sucesso';
      }

      if (err) {
        console.log('Erro ao rodar srcript');
        console.log(err);

        return 'Erro';
      }
    });

    return hash;
  }
  return ['Erro ao obter informações do vídeo'];
}

export async function getStartManyDownload(arrayOfVideos) {
  const hash = functions.getRandomHash();

  const dir = path.join(__dirname, '..', '..', 'audios', 'youtube', hash);
  shelljs.mkdir('-p', dir);

  if (arrayOfVideos && arrayOfVideos.length > 0) {
    const commands = functions.getManyStrings(hash, arrayOfVideos);

    await runCommand(commands, (success, err) => {
      if (success) {
        console.log('Script corrido');

        return 'Sucesso';
      }

      if (err) {
        console.log('Erro ao rodar srcript');
        console.log(err);

        return 'Erro';
      }
    });

    return hash;
  }
  return ['Erro ao obter informações do vídeo'];
}
