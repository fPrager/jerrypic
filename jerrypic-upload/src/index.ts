import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (_req, res) => {
  res.send('Hello from jerrypic-upload!\n');
});

app.listen(port, () => {
  console.log(`jerrypic-upload listening on :${port}`);
});
