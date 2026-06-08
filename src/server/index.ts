import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();
app.use(cors());
app.use('/api', routes);

app.listen(3001, () => {
  console.log('API running on http://localhost:3001');
});
