/* eslint-disable no-console */
import app from './app';

app.listen(process.env.PORT || 3900, () => {
  console.log(`Listening on port: ${process.env.PORT || '3900'}`);
});
