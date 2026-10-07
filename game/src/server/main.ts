import { createApplication } from './app.js';
import { Store } from './store.js';
import { firstConnectionFree, differentDangers } from '../content/missions.js';
const mode = process.env.GAME_MODE ?? 'foundry';
if (!['foundry', 'J1'].includes(mode)) throw new Error('GAME_MODE must be foundry or J1.');
const app = await createApplication({ store: new Store(undefined, {}, mode === 'foundry' ? firstConnectionFree : differentDangers),
  host: process.env.HOST ?? '127.0.0.1', port: Number(process.env.PORT ?? 3000), origin: process.env.APP_ORIGIN });
console.log(`Signal Rescue ${app.store.releaseId} listening at ${app.origin}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => process.exit(0)); });
