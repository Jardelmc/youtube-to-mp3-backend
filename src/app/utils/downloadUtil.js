/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';
import randomstring from 'randomstring';
import ytdl from 'ytdl-core';
import filenamify from 'filenamify';
import runCommand from '../../audios/_index';
import { getFolderPath, sleep } from './functionsUtil';
import { setProccessHash } from './redisUtil';

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

export async function getStartDownload(url, hash) {
  url = `https://www.youtube.com/watch?v=${url}`;

  let fileName = await functions.getName(url);

  const dir = getFolderPath(hash);

  shelljs.mkdir('-p', dir);

  fileName = filenamify(fileName);

  if (fileName) {
    const commands = functions.getStringCommand(hash, url, fileName);

    runCommand(commands, (success, err) => {
      if (success) {
        return 'Sucesso';
      }

      if (err) {
        console.log('Erro ao rodar srcript');
        console.log(err);

        return 'Erro';
      }
    });

    const filePath = path.join(dir, `${fileName}.mp3`);

    let files = null;

    let count = 0;

    let control = false;
    while (true || count < 280) {
      files = [];

      fs.readdirSync(dir).forEach(file => {
        files.push(file);
      });

      if (files.length === 2) {
        files.forEach(element => {
          if (element === 'finish') {
            control = true;
          }
        });

        if (control) {
          await setProccessHash(hash, filePath);
          console.log('Script corrido e salvo no redis');
          break;
        }
      }

      await sleep(2);
      console.log('Aguardando conclusão do download');

      count += 1;
    }

    if (!control) {
      await setProccessHash(hash, 'erro');
    }

    return hash;
  }
  return 'Erro ao obter informações do vídeo';
}

export async function getStartManyDownload(arrayOfVideos, hash) {
  const dir = getFolderPath(hash);

  if (arrayOfVideos && arrayOfVideos.length > 0) {
    shelljs.mkdir('-p', dir);

    const commands = functions.getManyStrings(hash, arrayOfVideos);

    runCommand(commands, async (success, err) => {
      if (success) {
        return 'Sucesso';
      }

      if (err) {
        console.log('Erro ao rodar srcript');
        console.log(err);

        return 'Erro';
      }
    });

    const filePath = path.join(dir, `musicas.zip`);

    let files = null;

    let count = 0;

    let control = false;

    while (true || count < 980) {
      files = [];

      fs.readdirSync(dir).forEach(file => {
        files.push(file);
      });

      if (files.length >= 1) {
        for (const readFile of files) {
          if (readFile === 'finish') {
            control = true;
          }
        }

        if (control) {
          setProccessHash(hash, filePath);
          console.log('Script corrido e salvo no redis - zip');
          break;
        }

        setProccessHash(`${hash}Temp`, files.length);
      }

      await sleep(2);
      console.log('Aguardando conclusão do download - zip');

      count += 1;
    }

    if (!control) {
      console.log('Erro ao concluir arquivo zip');
      await setProccessHash(hash, 'erro');
    }

    return hash;
  }
  return 'Erro ao obter informações do vídeo';
}
