import _ from 'lodash';
import { ResourceCategory, ResourceRecord, ResourceType } from '../../games/common/data/ResourceMaster';

export interface Result {
  resources: ResourceRecord[];
  errors: { file: string; statusText: string }[];
  duplicatedKeys: { file: string; key: string }[];
  duplicatedPaths: { file: string; path: string }[];
}

export const extractResources = async (
  resources: ResourceRecord[],
  customFetch: (id: string, url: string) => Promise<[string, any]>,
): Promise<Result> => {
  const result: Result = {
    resources: resources,
    errors: [],
    duplicatedKeys: [],
    duplicatedPaths: [],
  };

  if (resources === null) {
    return result;
  }

  if (!customFetch) {
    customFetch = async (_id: string, url: string) => {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        return [null, json];
      }
      return [response.statusText, null];
    };
  }

  let i = 0;
  while (i < result.resources.length) {
    const resource = resources[i];
    i++;

    const { id, type, category, path, param1 } = resource;

    if (type === ResourceType.PACKAGE) {
      const { resources: newResources, error: newError } = await extractPackageResource(id, path, customFetch);
      if (newError) {
        result.errors.push(newError);
        continue;
      }

      newResources.forEach((newResource) => {
        const existKeyResource = result.resources.find((x) => x.id === newResource.id);
        if (existKeyResource) {
          if (existKeyResource.path !== newResource.path) {
            result.duplicatedKeys.push({ file: path, key: newResource.id });
            console.log('duplicated key', newResource.id);
            return;
          }
          if (existKeyResource.category !== newResource.category) {
            if (
              existKeyResource.category === ResourceCategory.BOOT_COMMON ||
              newResource.category === ResourceCategory.BOOT_COMMON
            ) {
              (existKeyResource as any).category = ResourceCategory.BOOT_COMMON;
            } else {
              (existKeyResource as any).category = ResourceCategory.COMMON;
            }
          }
        }

        const existPathResource = result.resources.find((x) => x.path === newResource.path);
        if (existPathResource) {
          if (existPathResource.id === newResource.id) {
            return;
          }
          result.duplicatedPaths.push({ file: path, path: newResource.path });
        }

        result.resources.push(newResource);
      });
    } else if (type === ResourceType.JSON && param1 === true) {
      const { resources: newResources, error: newError } = await extractLayoutResource(id, path, category, customFetch);
      if (newError) {
        result.errors.push(newError);
        continue;
      }

      newResources.forEach((newResource) => {
        const existKeyResource = result.resources.find((x) => x.id === newResource.id);
        if (existKeyResource) {
          if (existKeyResource.category !== newResource.category) {
            if (
              existKeyResource.category === ResourceCategory.BOOT_COMMON ||
              newResource.category === ResourceCategory.BOOT_COMMON
            ) {
              (existKeyResource as any).category = ResourceCategory.BOOT_COMMON;
            } else {
              (existKeyResource as any).category = ResourceCategory.COMMON;
            }
          }
        } else {
          result.resources.push(newResource);
        }
      });
    }
  }

  return result;
};

const extractPackageResource = async (
  id: string,
  path: string,
  customFetch: (id: string, url: string) => Promise<[string, any]>,
): Promise<{ resources: ResourceRecord[]; error: { file: string; statusText: string } }> => {
  const [error, json] = await customFetch(id, path);
  if (error) {
    return { resources: [], error: { file: path, statusText: error } };
  }
  return { resources: json, error: null };
};

const extractLayoutResource = async (
  id: string,
  path: string,
  category: ResourceCategory,
  customFetch: (id: string, url: string) => Promise<[string, any]>,
): Promise<{ resources: ResourceRecord[]; error: { file: string; statusText: string } }> => {
  const [error, json] = await customFetch(id, path);
  if (error) {
    return { resources: [], error: { file: path, statusText: error } };
  }

  const resources = new Array<ResourceRecord>();
  extractJson(json, category, resources);
  return { resources: resources, error: null };
};

const audioTypes = ['se', 'ses'];
const fontTypes = ['fontFamily'];
const imageTypes = [
  'key',
  'avatarTextureNone',
  'avatarTextures',
  'selectedAvatarTextures',
  'avatarBgTextures',
  'bgTextures',
  'bulletTextures',
  'boxLayout',
  'bubbleLayout',
  'coverTextures',
  'fgTextures',
  'iconTextures',
  'maskTextures',
  'nameBgTextures',
  'rankTextures',
  'starTextures',
  'tagTextures',
  'highlightTagTextures',
  'betEffectTextures',
  'betStarTextures',
  'effectTexture',
  'textures',
  'soundTextures',
  'playTextures',
  'checkTextures',
  'nextTextures',
  'normalTextures',
  'hoverTextures',
  'disabledTextures',
  'titleTextures',
];
const jsonTypes = [
  'key',
  'infoLayouts',
  'questionLayouts',
  'itemLayout',
  'itemLayouts',
  'optionLayout',
  'optionLayouts',
  'textLayout',
  'effectLayout',
];
const spineTypes = ['spine', 'spines'];
const allTypes = new Set([...audioTypes, ...fontTypes, ...imageTypes, ...jsonTypes, ...spineTypes]);

function extractJson(json: any, category: ResourceCategory, resources: ResourceRecord[]): void {
  if (!json) {
    return;
  }

  _.keysIn(json).forEach((key) => {
    const value = json[key];
    if (allTypes.has(key)) {
      if (_.isPlainObject(value)) {
        extractJson(value, category, resources);
      } else {
        const strs: string[] = _.isArray(value) ? value : [value];
        strs.forEach((str) => {
          if (_.isPlainObject(str)) {
            extractJson(str, category, resources);
          } else if (fontTypes.indexOf(key) >= 0) {
            console.log('font', str);
            const path = `/games/internal/common/font/${str}.ttf`;
            resources.push({
              id: str,
              path: path,
              category: category,
              type: ResourceType.FONT,
              param1: str,
            } as ResourceRecord);
          } else if (spineTypes.indexOf(key) >= 0) {
            const lastIndex = str.lastIndexOf('/');
            const basePath = str.substring(0, lastIndex);
            const filename = str.substring(lastIndex + 1);
            const path = `/games/internal/${basePath}`;
            const json = `${filename}.json`;
            const atlas = `${filename}.atlas`;
            resources.push({
              id: str,
              path: path,
              category: category,
              type: ResourceType.SPINE,
              param1: json,
              param2: atlas,
            } as ResourceRecord);
          } else {
            const path = `/games/internal/${str}`;
            if (/^.*\.(png|jpg|jpeg)$/.test(str)) {
              resources.push({
                id: str,
                path: path,
                category: category,
                type: ResourceType.IMAGE,
              } as ResourceRecord);
            } else if (/^.*\.(json)$/.test(str)) {
              resources.push({
                id: str,
                path: path,
                category: category,
                type: ResourceType.JSON,
                param1: true,
              } as ResourceRecord);
            } else if (/^.*\.(mp3)$/.test(str)) {
              resources.push({
                id: str,
                path: path,
                category: category,
                type: ResourceType.AUDIO,
              } as ResourceRecord);
            }
          }
        });
      }
    } else {
      const arr = _.isArray(value) ? value : [value];
      arr.forEach((it) => {
        if (_.isPlainObject(it)) {
          extractJson(it, category, resources);
        }
      });
    }
  });
}
