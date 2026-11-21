import { handle } from '../../../worker/cert-api.js';
import { SECRETS } from '../../../worker/secrets.js';
import { PROOF } from '../../../worker/proof.js';
export const onRequest = (ctx) => handle({ request: ctx.request, env: { ...ctx.env, BOARD_PROOF: PROOF, SECRETS } });
