import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  ApparatusPage,
  ElementDetailPage,
  HomePage,
  RoutineBuilderPage,
  RootLayout,
} from "./route-components";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const apparatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apparatus/$apparatus",
  component: ApparatusPage,
});

const routineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apparatus/$apparatus/routine",
  component: RoutineBuilderPage,
});

const elementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apparatus/$apparatus/elements/$elementId",
  component: ElementDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  apparatusRoute,
  routineRoute,
  elementRoute,
]);

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
