import redis from 'redis';

const client = redis.createClient();

if (process.env.NODE_ENV === 'production') {
  client.AUTH(process.env.REDIS_AUTH);
}

client.on('error', err => {
  console.log('Erro ao iniciar Redis ', err);
});

export default client;
