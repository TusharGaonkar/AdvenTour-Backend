import mongoose from 'mongoose';

process.on('uncaughtException', (err: Error) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION ⛔! , Shutting down the server!');
  process.exit(1);
});

import app from './index';

const password = process.env.DB_PASSWORD;
const URI = process.env.DB_URI.replace('<password>', password);

mongoose
  .connect(URI)
  .then(() => {
    console.log('Mongo-AtlasDB connection successful..👍🏻');
  })
  .catch((error) => console.log(error));

const port = process.env.PORT || 2000;

app.listen(port, () => console.log(`Server is running on port ${port} 🚀`));

process.on('unhandledRejection', (err: Error) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION ⛔! , Shutting down the server!');
  process.exit(1);
});
