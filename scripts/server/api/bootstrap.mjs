import path from "node:path";
import { indexesRoot, readJson, taxonomyRoot } from "../../lib.mjs";

export function bootstrapData() {
  return {
    categories: readJson(path.join(taxonomyRoot, "categories.json")).categories,
    formats: readJson(path.join(taxonomyRoot, "formats.json")).formats,
    difficulties: readJson(path.join(taxonomyRoot, "difficulties.json")).difficulties,
    moods: readJson(path.join(taxonomyRoot, "moods.json")).moods,
    occasions: readJson(path.join(taxonomyRoot, "occasions.json")).occasions,
    stats: readJson(path.join(indexesRoot, "stats.json"))
  };
}
