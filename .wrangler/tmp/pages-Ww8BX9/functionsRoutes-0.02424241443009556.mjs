import { onRequest as __api_board___route___js_onRequest } from "/workspaces/Intellica/functions/api/board/[[route]].js"

export const routes = [
    {
      routePath: "/api/board/:route*",
      mountPath: "/api/board",
      method: "",
      middlewares: [],
      modules: [__api_board___route___js_onRequest],
    },
  ]