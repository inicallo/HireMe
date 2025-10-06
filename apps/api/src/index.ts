import App from './app';
import { connectDB } from './utils/connectDB';

const main = async () => {
  await connectDB(); 

  const app = new App();
  app.start();
};

main();