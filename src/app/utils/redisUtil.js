/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import redis from 'redis';

const client = redis.createClient();

client.on('error', err => {
  console.log('Erro ao iniciar Redis ', err);
});

export async function setProccessHash(hash, path) {
  try {
    client.set(hash, path, redis.print);

    return true;
  } catch (error) {
    return false;
  }
}

export async function getProccessHash(hash) {
  const info = await client.get(hash, (err, result) => {
    return result;
  });
}
