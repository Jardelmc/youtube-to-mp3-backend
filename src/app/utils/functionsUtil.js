/* eslint-disable import/prefer-default-export */
import path from 'path';
/**
 *
 * @param {Number} time: Segundos
 */
export async function sleep(time) {
  if (!Number(time)) {
    return false;
  }
  time *= 1000;

  return new Promise(resolve => setTimeout(resolve, time));
}

export function getFolderPath(hash) {
  const pathToYoutubeFolder = path.join(
    __dirname,
    '..',
    '..',
    'audios',
    'youtube',
    hash
  );

  return pathToYoutubeFolder;
}
