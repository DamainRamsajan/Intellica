import { handle } from '../../../worker/board-api.js';
import { PROOF } from '../../../worker/proof.js';
export const onRequest = (ctx) => handle({ request: ctx.request, env: { ...ctx.env, BOARD_PROOF: PROOF } });
