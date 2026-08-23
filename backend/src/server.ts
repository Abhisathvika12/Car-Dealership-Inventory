import dotenv from 'dotenv';

import { createApp } from './app';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // Keep startup logging minimal and explicit for local development.
  console.log(`Backend listening on port ${port}`);
});
