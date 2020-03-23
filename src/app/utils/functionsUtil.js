/* eslint-disable import/prefer-default-export */
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
