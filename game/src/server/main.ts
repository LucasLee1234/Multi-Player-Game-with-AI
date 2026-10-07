import { createApplication } from './app.js';
const app = await createApplication({ host: process.env.HOST ?? '127.0.0.1', port: Number(process.env.PORT ?? 3000), origin: process.env.APP_ORIGIN });
console.log(`Signal Rescue SYS-01 listening at ${app.origin}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => process.exit(0)); });
