import SceneManager from '../scene/SceneManager';
import Log from '../util/Log';

const EPSILON = 0.0001;

export default class SoundManager {
  private static _instance: SoundManager;

  static getInstance<T extends typeof SoundManager>(): InstanceType<T> {
    return this._instance as InstanceType<T>;
  }

  static createInstance<T extends typeof SoundManager>(klass: T): InstanceType<T> {
    if (!this._instance) {
      this._instance = new klass();
    }
    return this._instance as InstanceType<T>;
  }

  static destroyInstance(): void {
    this._instance.destroy();
    this._instance = null;
  }

  static stopAllSfx(): void {
    this._instance.stopAllSfx();
  }

  static get isBGMMute(): boolean {
    return this._instance.isBGMMute;
  }

  static get isSFXMute(): boolean {
    return this._instance.isSFXMute;
  }

  static get bgmVolume(): number {
    return this._instance.bgmVolume;
  }

  static set bgmVolume(value: number) {
    this._instance.bgmVolume = value;
  }

  static get sfxVolume(): number {
    return this._instance.sfxVolume;
  }

  static set sfxVolume(value: number) {
    this._instance.sfxVolume = value;
  }

  static bgm(key: string): void {
    this._instance.bgm(key);
  }

  static sfx(key: string, onComplete?: () => void, config?: Phaser.Types.Sound.SoundConfig): void {
    this._instance.sfx(key, onComplete, config);
  }

  static async sfxAsync(key: string): Promise<void> {
    await this._instance.sfxAsync(key);
  }

  static stopSfx(key: string): void {
    this._instance.stopSfx(key);
  }
  static pauseSfx(key: string): void {
    this._instance.pauseSfx(key);
  }
  static resumeSfx(key: string): void {
    this._instance.resumeSfx(key);
  }

  protected _bgmVolume: number = 1;
  protected _sfxVolume: number = 1;

  protected _bgm: Phaser.Sound.BaseSound;

  protected readonly _sfxs = new Map<string, Phaser.Sound.BaseSound[]>();

  protected readonly _log = Log.getLog('SoundManager', Log.ERROR);

  get isBGMMute(): boolean {
    return this._bgmVolume <= EPSILON;
  }

  get isSFXMute(): boolean {
    return this._sfxVolume <= EPSILON;
  }

  get bgmVolume(): number {
    return this._bgmVolume;
  }

  set bgmVolume(value: number) {
    this._bgmVolume = value;

    if (this._bgm) {
      (this._bgm as any).setVolume(value);
    }
  }

  get sfxVolume(): number {
    return this._sfxVolume;
  }

  set sfxVolume(value: number) {
    this._sfxVolume = value;

    this._sfxs.forEach((sfxs) => {
      sfxs.forEach((sfx) => (sfx as any).setVolume(value));
    });
  }

  bgm(key: string): void {
    if (this.isBGMMute) {
      return;
    }

    const scene = SceneManager.getCurrentScene();

    if (this._bgm) {
      this._bgm.destroy();
    }
    if (scene.cache.audio.exists(key)) {
      this._bgm = scene.sound.add(key);
      this._bgm.play({ loop: true, volume: this._bgmVolume });
    } else {
      this._log.e(`BGM not found! ${key}`);
    }
  }

  sfx(key: string, onComplete?: () => void, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!key) {
      this._log.e(`SFX not found! ${key}`);
      onComplete?.();
      return;
    }

    if (this.isSFXMute) {
      onComplete?.();
      return;
    }

    let sfxs = this._sfxs.get(key);
    if (sfxs && sfxs.length >= 8) {
      onComplete?.();
      return;
    }

    const scene = SceneManager.getCurrentScene();

    if (scene.cache.audio.exists(key)) {
      const sfx = scene.sound.add(key, config);

      if (!sfxs) {
        sfxs = [];
        this._sfxs.set(key, sfxs);
      }
      sfxs.push(sfx);

      sfx.once(Phaser.Sound.Events.COMPLETE, (sfx: Phaser.Sound.BaseSound) => {
        onComplete?.();
        sfx.destroy();
      });
      sfx.once(Phaser.Sound.Events.DESTROY, (sfx: Phaser.Sound.BaseSound) => {
        const sfxs = this._sfxs.get(key);
        sfxs?.splice(sfxs?.indexOf(sfx), 1);
      });
      sfx.play({ loop: false, volume: this._sfxVolume });
    } else {
      this._log.e(`SFX not found! ${key}`);
      onComplete?.();
    }
  }

  async sfxAsync(key: string): Promise<void> {
    return new Promise((resolve) => this.sfx(key, () => resolve()));
  }

  stopSfx(key: string): void {
    if (!key) {
      return;
    }
    if (this.isSFXMute) {
      return;
    }

    if (this._sfxs.has(key)) {
      const sfxs = this._sfxs.get(key);
      sfxs?.forEach((sfx) => sfx?.stop());
      this._sfxs?.delete(key);
    }
  }
  stopAllSfx(): void {
    this._sfxs.forEach((sfxs) => {
      sfxs.forEach((sfx) => sfx.stop());
    });
    this._sfxs.clear();
  }

  pauseSfx(key: string): void {
    if (!key) {
      return;
    }
    if (this.isSFXMute) {
      return;
    }
    if (this._sfxs.has(key)) {
      const sfxs = this._sfxs.get(key);
      sfxs.forEach((sfx) => sfx.pause());
    }
  }

  resumeSfx(key: string): void {
    if (!key) {
      return;
    }
    if (this.isSFXMute) {
      return;
    }
    if (this._sfxs.has(key)) {
      const sfxs = this._sfxs.get(key);
      sfxs.forEach((sfx) => sfx.resume());
    }
  }

  destroy(): void {
    if (this._bgm) {
      this._bgm.destroy();
      this._bgm = null;
    }
    this._sfxs.forEach((sfxs) => {
      sfxs.forEach((sfx) => sfx.destroy());
    });
    this._sfxs.clear();
  }
}
