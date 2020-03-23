/* eslint-disable no-console */
import app from './app';

const localPort = 3072;
app.listen(process.env.PORT || localPort, () => {
  console.log(`Listening on port: ${process.env.PORT || localPort}`);
});
