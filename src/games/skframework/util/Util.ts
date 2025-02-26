import { isNumber } from "lodash";
import FontLoader from "./FontLoader";

export interface IPoint {
  x?: number;
  y?: number;
}

export function getValue(object: object, key: string, defaultValue: any) {
  if (!object) {
    return defaultValue;
  }
  const value = object[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

export function valueOrDefault(value: any, defaultValue: any) {
  return value !== undefined ? value : defaultValue;
}

export function convertColor(
  color: string,
  radix: number = 16,
  replaceChar?: string
) {
  return parseInt(
    color.replaceAll(valueOrDefault(replaceChar, "#"), ""),
    radix
  );
}

export function deepCopy(obj: any): any {
  if (obj == null || "object" != typeof obj) {
    return obj;
  }

  if (obj instanceof Date) {
    const copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  if (obj instanceof Array) {
    const copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  if (obj instanceof Object) {
    const copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepCopy(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

export function formatString(str: string, ...replacements: any[]): string {
  if (!str) {
    return str;
  }
  return str.replace(/{(\d+)}/g, function (match, number) {
    return typeof replacements[number] != "undefined"
      ? replacements[number]
      : match;
  });
}

export function getPositionFromScene(object: any): { x: number; y: number } {
  const view_parent = object.parentContainer;
  if (view_parent) {
    return {
      x: getPositionFromScene(view_parent).x + (object.x ?? 0),
      y: getPositionFromScene(view_parent).y + (object.y ?? 0),
    };
  } else {
    return {
      x: object.x ?? 0,
      y: object.y ?? 0,
    };
  }
}

export function is_same_black(
  color: Phaser.Display.Color | { red: number; green: number; blue: number }
): boolean {
  const luma = 0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue;
  return luma < 40;
}
/**
 *
 * @param fontSize đơn vị px
 * @returns number
 */
export function parseIntFontSize(fontSize: number | string): number {
  if (isNumber(fontSize)) return fontSize as number;
  return parseInt(fontSize.toString().replaceAll("px", ""));
}

/**
 *
 * @param time đơn vị giây
 * @returns string 'mm:ss'
 */
export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

export interface IFontLoad {
  name: string;
  url: string;
}

export function FuncLoadFonts(fonts: Array<IFontLoad>, callBack?: () => void) {
  const fontLoader = new FontLoader(5);
  fonts.forEach((item, i) => {
    fontLoader.add(item.name, item.url);
  });
  fontLoader.start().subscribe({
    next: (value) => {
      console.log("load font: ", value);
    },
    complete: () => {
      console.log("load font complete");
      callBack?.();
    },
    error: (err) => {
      console.log("load font error: ", err);
      callBack?.();
    },
  });
}
