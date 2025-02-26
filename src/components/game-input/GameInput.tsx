import MonacoEditor, { loader } from "@monaco-editor/react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { useRef, useState } from "react";
import "./style.scss";
import { isNullOrUndefined } from "../../games/skframework/util/Util";
import { toast } from "react-toastify";
import { xlsParser } from "../../services/game/xlsParser";
import { extractResources, Result } from "../../services/game/formatGameData";

export interface GameInputProps {}
const GameInput: React.FC<GameInputProps> = (props) => {
  loader.config({
    paths: { vs: window.location.origin + "/monaco-editor/min/vs" },
  });

  const [gameData, setGameData] = useState<any>({});
  const [gameDataEditor, setGameDataEditor] = useState<any>({});
  const [isErrorDataGame, setIsErrorDataGame] = useState<boolean>(false);
  const [error_warning, setError_warning] = useState<Result>({
    resources: [],
    errors: [],
    duplicatedKeys: [],
    duplicatedPaths: [],
  });
  const ref_file = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const getResources = (newJson) => {
    extractResources(newJson.data.resource, null)
      .then((result: Result) => {
        if (result.duplicatedKeys.length > 0) {
          setError_warning(result);
          console.log(result);
          toast.error("Có một số bản ghi trùng id, vui lòng kiểm tra lại!");
          return;
        }
        if (result.duplicatedPaths.length > 0) {
          toast.warning("Có một số bản ghi trùng path, vui lòng kiểm tra lại!");
        }

        newJson.data.resource = result.resources;

        setGameData({ ...gameData, ...newJson });
        setGameDataEditor({ ...gameData, ...newJson });
        setError_warning(result);

        toast.success("Nhập excel thành công! Nhấn Cập nhật/Tạo mới để lưu.");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <>
      <div className="d-flex pt-3">
        <div className="p-2" style={{ width: "20%" }}>
          <div className="d-flex justify-content-center pb-2">
            <input
              type="file"
              id="file"
              ref={ref_file}
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                } else {
                  setFile(null);
                }
              }}
            />
            <div
              className="custom-file-upload w-100 d-flex justify-content-center pb-2"
              onClick={() => {
                ref_file?.current?.click();
              }}
            >
              {isNullOrUndefined(file) ? (
                <b>Upload File</b>
              ) : (
                <b>{file.name}</b>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                if (!isNullOrUndefined(file)) {
                  xlsParser
                    .parse([file])
                    .then((newJson) => {
                      getResources(newJson);
                    })
                    .catch((error) => {
                      toast.error(error);
                    });
                } else {
                  toast.error("Please select a file");
                }
              }}
            >
              Parse
            </button>
          </div>
        </div>
        <div className="p-2" style={{ width: "80%" }}>
          <MonacoEditor
            width={"100%"}
            height={"85vh"}
            language="json"
            theme="vs-light"
            options={{
              automaticLayout: true,
            }}
            keepCurrentModel={true}
            onChange={(e) => {
              try {
                setGameData(JSON.parse(e));
                setIsErrorDataGame(false);
              } catch (err) {
                setIsErrorDataGame(true);
              }
            }}
            onMount={(editor, monaco) => {
              setTimeout(() => {
                try {
                  prettier.format(JSON.stringify(gameData ?? "", null, 2), {
                    parser: "babel",
                    plugins: [parserBabel],
                  });
                } catch (err) {
                  console.log(err);
                }
              }, 100);
            }}
            value={JSON.stringify(gameDataEditor ?? "", null, 2)}
          />
        </div>
      </div>
    </>
  );
};
export default GameInput;
