import { extractResources } from "../../../services/game/formatGameData";
import { ResourceRecord, ResourceType } from "../../common/data/ResourceMaster";
import { FuncLoadFonts, IFontLoad } from "./Util";

export const extractThenLoadResources = (
  scene: Phaser.Scene,
  resources: ResourceRecord[],
  onProgress?: (progress: number) => void,
  onComplete?: () => void
): void => {
  extractResources(resources, async (id, url) => {
    if (scene.cache.json.has(id)) {
      return [null, scene.cache.json.get(id)];
    }
    return new Promise<[string, any]>((resolve) => {
      const loader = new Phaser.Loader.LoaderPlugin(scene);
      loader.json(id, url);
      loader.on(Phaser.Loader.Events.COMPLETE, () => {
        resolve([null, scene.cache.json.get(id)]);
      });
      loader.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
        resolve([`can not load ${url}`, null]);
      });
      loader.start();
    });
  }).then(({ resources }) => {
    loadResources(scene, resources, onProgress, onComplete);
    scene.load.start();
  });
};

const loadResources = (
  scene: Phaser.Scene,
  resources: ResourceRecord[],
  onProgress?: (progress: number) => void,
  onComplete?: () => void
): void => {
  const fonts: IFontLoad[] = [];

  resources.forEach((resource) => {
    let path = resource.path;
    switch (resource.type) {
      case ResourceType.AUDIO:
        scene.load.audio(resource.id, path);
        break;

      case ResourceType.VIDEO:
        const urls =
          typeof resource.path === "string"
            ? [resource.path]
            : JSON.parse(resource.path);
        scene.load.video(resource.id, urls, resource.param1 ?? false);
        break;

      case ResourceType.IMAGE:
        scene.load.image(resource.id, path);
        break;

      case ResourceType.JSON:
        scene.load.json(resource.id, path);
        break;

      case ResourceType.SPINE:
        scene.load.setPath(path);
        scene.load.spine(resource.id, resource.param1, resource.param2);
        scene.load.setPath();
        break;

      case ResourceType.FONT:
        fonts.push({ name: resource.param1, url: path });
        break;

      case ResourceType.SPRITESHEET:
        scene.load.spritesheet(resource.id, path, {
          frameWidth: resource.param1,
          frameHeight: resource.param2,
        });
        break;
    }
  });

  const fontCount = fonts.length;
  const otherCount = scene.load.list.size;
  const totalCount = fontCount + otherCount;
  const fontPercent = fontCount / totalCount;
  const otherPercent = 1 - fontPercent;

  scene.load.on(Phaser.Loader.Events.PROGRESS, (progress) => {
    if (onProgress) {
      onProgress(progress * otherPercent);
    }
  });

  scene.load.once(
    Phaser.Loader.Events.COMPLETE,
    () => {
      FuncLoadFonts(fonts, () => {
        if (onComplete) {
          onComplete();
        }
      });
    },
    this
  );
};
