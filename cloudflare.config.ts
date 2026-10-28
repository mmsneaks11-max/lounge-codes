import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    // Keep staging isolated until the Google Cloud backend is verified and DNS cutover is approved.
    name: "lounge-codes-staging",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-28",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
  }),
});
