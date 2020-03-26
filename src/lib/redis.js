import redis from 'redis';

const client = redis.createClient();

client.on('error', err => {
  console.log('Erro ao iniciar Redis ', err);
});

export default client;
