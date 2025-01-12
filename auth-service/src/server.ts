import app from './app';

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost'; // Default to 'localhost' if HOST is not set

app.listen(port, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
