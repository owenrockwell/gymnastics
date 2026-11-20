import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { HomePage, RootLayout } from "./route-components";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createRouter({
  routeTree,
  ...(basepath ? { basepath } : {}),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
