import { handle } from '../../../worker/pay-api.js';
import { SECRETS } from '../../../worker/secrets.js';
export const onRequest = (ctx) => handle({ request: ctx.request, env: { ...ctx.env, SECRETS } });
