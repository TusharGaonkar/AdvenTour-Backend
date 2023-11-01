import mongoose from 'mongoose';
import app from './index';

const password = process.env.DB_PASSWORD;
const URI = process.env.DB_URI.replace('<password>', password);

mongoose
  .connect(URI)
  .then(() => {
    console.log('Mongo-AtlasDB connection successful..👍🏻');
  })
  .catch((error) => console.log(error));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port} 🚀`));
