/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import redis from 'redis';

import client from '../../lib/redis';

export async function setProccessHash(hash, path) {
  try {
    client.set(hash, path, redis.print);

    return true;
  } catch (error) {
    return false;
  }
}
