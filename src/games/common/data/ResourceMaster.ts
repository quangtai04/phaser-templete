import { MasterBase } from '../../skframework/dataflow/master/Master';
import IRecord from '../../skframework/dataflow/record/IRecord';

export enum ResourceCategory {
  BOOT = 'BOOT',
  BOOT_COMMON = 'BOOT_COMMON', // COMMON but loaded at boot time
  COMMON = 'COMMON',
  HOME = 'HOME',
  PLAY = 'PLAY',
  TEAM_SELECT = 'TEAM-SELECT',
  TIME_SELECT = 'TIME-SELECT',
  MODE_SELECT = 'MODE-SELECT',
}

export enum ResourceType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  JSON = 'JSON',
  SPINE = 'SPINE',
  FONT = 'FONT',
  PACKAGE = 'PACKAGE',
  SPRITESHEET = 'SPRITESHEET',
}

export class ResourceRecord implements IRecord<string> {
  readonly id: string;
  readonly category: ResourceCategory;
  readonly type: ResourceType;
  readonly path: string;
  readonly param1: any;
  readonly param2: any;

  constructor(json: object) {
    this.id = json['id'];
    this.category = json['category'] as ResourceCategory;
    this.type = json['type'] as ResourceType;
    this.path = json['path'];
    this.param1 = json['param1'];
    this.param2 = json['param2'];
  }
}

class ResourceMaster extends MasterBase<string, ResourceRecord> {
  static readonly masterName: string = 'resource';

  getByCategory(category: ResourceCategory | ResourceCategory[]): ResourceRecord[] {
    if (Array.isArray(category)) {
      return this.getAll().filter((v) => category.indexOf(v.category) >= 0);
    } else {
      return this.getAll().filter((v) => v.category === category);
    }
  }

  getByType(type: ResourceType): ResourceRecord[] {
    return this.getAll().filter((v) => v.type === type);
  }
}

export default ResourceMaster;
