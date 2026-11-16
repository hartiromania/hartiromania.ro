import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

// Config pentru comenzile CLI Sanity (ex: deploy GraphQL, migrări). Opțional.
export default defineCliConfig({
  api: { projectId, dataset },
  // autoUpdates: false — cu auto-updates activat, deploy-ul pică ("Unzip: unexpected end of file").
  deployment: { autoUpdates: false, appId: "p9dbjx729jbwaezuw9loh7no" },
  // Hostname-ul editorului găzduit -> https://harti-romania.sanity.studio
  studioHost: "harti-romania",
});
