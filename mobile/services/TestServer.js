import express from 'express';

export const startTestServer = () => {
  const app = express();
  app.use(express.json());

  app.get('/api/test-endpoint', (req, res) => {
    res.status(200).json({ message: 'success' });
  });

  app.post('/api/create', (req, res) => {
    res.status(201).json({ message: 'created' });
  });

  app.put('/api/update', (req, res) => {
    res.status(200).json({ message: 'updated' });
  });

  app.delete('/api/delete', (req, res) => {
    res.status(200).json({ message: 'deleted' });
  });

  return app.listen(8000);
};
