import { extractResources } from "../../../../services/game/formatGameData";
import MasterFactory from "../../../skframework/dataflow/master/MasterFactory";
import ISceneParam from "../../../skframework/scene/ISceneParam";
import { SceneWithParam } from "../../../skframework/scene/Scene";
import FontLoader from "../../../skframework/util/FontLoader";
import LayoutFactory from "../../../skframework/view/LayoutFactory";
import View from "../../../skframework/view/View";
import ResourceMaster, {
  ResourceCategory,
  ResourceRecord,
  ResourceType,
} from "../../data/ResourceMaster";
import ProgressBar from "./view/ProgressBar";

export class BootSceneBaseParam implements ISceneParam {
  readonly loadingResources: Array<ResourceRecord>;

  constructor(loadingResources: Array<ResourceRecord>) {
    this.loadingResources = loadingResources;
  }
}

export default abstract class BootSceneBase<
  P extends BootSceneBaseParam
> extends SceneWithParam<P> {
  static readonly identifier: string = "BootScene";

  protected readonly layout: string = "common/scene/boot/layout/boot.json";
  protected readonly preloadCategories = [
    ResourceCategory.BOOT,
    ResourceCategory.BOOT_COMMON,
  ];

  protected bootView: View;
  protected dots = new Array<Phaser.GameObjects.Image>();
  protected progressBar: ProgressBar;

  constructor() {
    super({ key: BootSceneBase.identifier });
  }

  preload(): void {
    // const resources = MasterFactory.get(ResourceMaster).getByCategory(this.preloadCategories);
    // this.loadResources(resources);
  }

  create(param: P): void {
    const resources = MasterFactory.get(ResourceMaster).getByCategory(
      this.preloadCategories
    );
    this._extractThenLoadResources(
      resources,
      (progress) => {},
      () => {
        this.createProgressBar();
        this._extractThenLoadResources(
          param.loadingResources,
          (progress) => this.progressBar?.setProgress(progress),
          () => this.progressBar?.setProgress(1)
        );
      }
    );
  }

  protected createProgressBar(): void {
    this.bootView = LayoutFactory.createView(this, this.layout);
    this.add.existing(this.bootView);
    this.setupProgressBar();
  }

  destroy(): void {
    const resources = MasterFactory.get(ResourceMaster).getByCategory(
      ResourceCategory.BOOT
    );
    resources.forEach((resource) => {
      switch (resource.type) {
        case ResourceType.AUDIO:
          this.cache.audio.remove(resource.id);
          break;

        case ResourceType.IMAGE:
          this.textures.remove(resource.id);
          break;

        case ResourceType.JSON:
          this.cache.json.remove(resource.id);
          break;
      }
    });

    super.destroy();
  }

  protected loadResources(
    resources: ResourceRecord[],
    onProgress?: (progress: number) => void,
    onComplete?: () => void
  ): void {
    const fontLoader = new FontLoader(5);

    resources.forEach((resource) => {
      const path = resource.path;
      switch (resource.type) {
        case ResourceType.AUDIO:
          this.load.audio(resource.id, path);
          break;

        case ResourceType.VIDEO:
          const urls =
            typeof resource.path === "string"
              ? [resource.path]
              : JSON.parse(resource.path);
          this.load.video(resource.id, urls, resource.param1 ?? false);
          break;

        case ResourceType.IMAGE:
          this.load.image(resource.id, path);
          break;

        case ResourceType.JSON:
          this.load.json(resource.id, path);
          break;

        case ResourceType.SPINE:
          this.load.setPath(path);
          this.load.spine(resource.id, resource.param1, resource.param2);
          this.load.setPath();
          break;

        case ResourceType.FONT:
          fontLoader.add(resource.param1, path);
          break;

        case ResourceType.SPRITESHEET:
          this.load.spritesheet(resource.id, path, {
            frameWidth: resource.param1,
            frameHeight: resource.param2,
          });
          break;
      }
    });

    const fontCount = fontLoader.count;
    const otherCount = this.load.list.size;
    const totalCount = fontCount + otherCount;
    const fontPercent = fontCount / totalCount;
    const otherPercent = 1 - fontPercent;

    this.load.on(Phaser.Loader.Events.PROGRESS, (progress) => {
      if (onProgress) {
        onProgress(progress * otherPercent);
      }
    });

    this.load.once(
      Phaser.Loader.Events.COMPLETE,
      () => {
        fontLoader
          .start()
          .subscribe(
            (progress) => {
              if (onProgress) {
                onProgress(otherPercent + progress * fontPercent);
              }
            },
            (err) => console.error(err),
            () => {
              if (onComplete) {
                onComplete();
              }
            }
          )
          .addTo(this);
      },
      this
    );
  }

  private _extractThenLoadResources(
    resources: ResourceRecord[],
    onProgress?: (progress: number) => void,
    onComplete?: () => void
  ): void {
    extractResources(resources, async (id, url) => {
      if (this.cache.json.has(id)) {
        return [null, this.cache.json.get(id)];
      }
      return new Promise<[string, any]>((resolve) => {
        const loader = new Phaser.Loader.LoaderPlugin(this);
        loader.json(id, url);
        loader.on(Phaser.Loader.Events.COMPLETE, () => {
          resolve([null, this.cache.json.get(id)]);
        });
        loader.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
          resolve([`can not load ${url}`, null]);
        });
        loader.start();
      });
    }).then(({ resources }) => {
      this.loadResources(resources, onProgress, onComplete);
      this.load.start();
    });
  }

  protected setupProgressBar(): void {
    this.progressBar = this.bootView.getByName("progress_bar");
    this.progressBar
      .setProgress(0)
      .onProgressAsObservable()
      .subscribe((progress) => {
        if (progress >= 1) {
          this.gotoNextScene();
        }
      })
      .addTo(this);
  }

  abstract gotoNextScene(): void;
}
