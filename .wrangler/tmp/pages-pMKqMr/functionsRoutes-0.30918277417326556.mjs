import { onRequest as __api_board___route___js_onRequest } from "/workspaces/Intellica/functions/api/board/[[route]].js"
import { onRequest as __api_cert___route___js_onRequest } from "/workspaces/Intellica/functions/api/cert/[[route]].js"
import { onRequest as __api_pay___route___js_onRequest } from "/workspaces/Intellica/functions/api/pay/[[route]].js"

export const routes = [
    {
      routePath: "/api/board/:route*",
      mountPath: "/api/board",
      method: "",
      middlewares: [],
      modules: [__api_board___route___js_onRequest],
    },
  {
      routePath: "/api/cert/:route*",
      mountPath: "/api/cert",
      method: "",
      middlewares: [],
      modules: [__api_cert___route___js_onRequest],
    },
  {
      routePath: "/api/pay/:route*",
      mountPath: "/api/pay",
      method: "",
      middlewares: [],
      modules: [__api_pay___route___js_onRequest],
    },
  ]