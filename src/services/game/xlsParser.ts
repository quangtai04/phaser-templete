import { WorkSheet, read } from "xlsx";

export const xlsParser = {
  parse,
};

const INFO_SHEETS = "info";
const DATA_IGNORE_SHEETS = [INFO_SHEETS, "def"];

interface JsonData {
  game_type?: string;
  title?: string;
  data: { [key: string]: any };
}

async function parse(files: File[]) {
  const json: JsonData = { data: {} };
  for (let i = 0; i < files.length; i++) {
    await parseOne(files[i], json);
  }
  return json;
}

function parseOne(file: File, json: JsonData): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const error = parseOneSync(file.name, evt.target.result, json);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    reader.readAsBinaryString(file);
  });
}

function parseOneSync(
  fileName: string,
  buffer: string | ArrayBuffer,
  json: JsonData
): string {
  const xlsx = read(buffer, { type: "binary" });
  const sheetNames = xlsx.SheetNames;

  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const sheet = xlsx.Sheets[sheetName];

    if (DATA_IGNORE_SHEETS.indexOf(sheetName) >= 0) {
      if (INFO_SHEETS === sheetName) {
        const startRow = 1;
        const endRow = getMaxRow(sheet, "A", startRow);
        for (let r = startRow; r < endRow; r++) {
          const key = sheet[`A${r}`];
          const value = sheet[`B${r}`];
          if (key && value) {
            json[key.v] = value.v;
          }
        }
      }
      continue;
    }

    const tableName = sheet["B1"].v;
    const startRow = sheet["B4"].v;
    const startCol = sheet["B3"].v;

    const endRow = getMaxRow(sheet, startCol, startRow);
    const endCol = getMaxCol(sheet, startRow, startCol);

    const table = json.data[tableName] ? json.data[tableName] : [];

    for (let r = startRow + 1; r < endRow; r++) {
      const cell = sheet[`${prevChar(startCol)}${r}`];
      if (cell && cell.v === "#") {
        continue;
      }

      const row = {};
      for (let c = startCol; is_column(c, endCol); c = nextChar(c)) {
        const key = sheet[`${c}${startRow}`].v;
        let value = null;
        const cell = sheet[`${c}${r}`];
        if (cell != null) {
          value = cell.v;
          if (cell.t === "s") {
            value = value.replace("\\n", "\n");
          }
        }
        row[key] = value;
      }

      for (let i = 0; i < table.length; i++) {
        const key = sheet[`${startCol}${startRow}`].v;
        if (row[key] === table[i][key]) {
          return `Duplicated key!! file=${fileName} sheet=${sheetName}, table=${tableName}, ${key}=${row[key]}`;
        }
      }

      table.push(row);
    }

    json.data[tableName] = table;
  }

  return null;
}

function getMaxRow(sheet: WorkSheet, col: string, startRow: integer) {
  let maxRow = startRow;
  while (sheet[`${col}${maxRow}`] != null) {
    maxRow++;
  }
  return maxRow;
}

function getMaxCol(sheet: WorkSheet, row: integer, startCol: string) {
  let maxCol = startCol;
  while (sheet[`${maxCol}${row}`] != null) {
    maxCol = nextChar(maxCol);
  }
  return maxCol;
}

// function prevChar(c: string) {
//   return String.fromCharCode(c.charCodeAt(0) - 1);
// }

// function nextChar(c: string) {
//   return String.fromCharCode(c.charCodeAt(0) + 1);
// }

function prevChar(c) {
  if (c.length === 1) return String.fromCharCode(c.charCodeAt(0) - 1);
  if (c.length === 2) {
    if (c === "AA") return "Z";
    return `${c[0]}${String.fromCharCode(c.charCodeAt(1) - 1)}`;
  }
}

function nextChar(c) {
  if (c === "Z") return "AA";
  if (c.length === 1) return String.fromCharCode(c.charCodeAt(0) + 1);
  if (c.length === 2)
    return `${c[0]}${String.fromCharCode(c.charCodeAt(1) + 1)}`;
}

function is_column(c: string, endCol: string): boolean {
  if (c.length < endCol.length) return true;
  if (c < endCol) return true;
  return false;
}
