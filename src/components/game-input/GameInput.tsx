import MonacoEditor, { loader } from "@monaco-editor/react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { useRef, useState } from "react";
import "./style.scss";
import { isNullOrUndefined } from "../../games/skframework/util/Util";

export interface GameInputProps {}
const GameInput: React.FC<GameInputProps> = (props) => {
  loader.config({
    paths: { vs: window.location.origin + "/monaco-editor/min/vs" },
  });

  const [gameData, setGameData] = useState<any>({});
  const [isErrorDataGame, setIsErrorDataGame] = useState<boolean>(false);
  const ref_file = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

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
            <button className="btn btn-outline-primary">Save</button>
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
            value={JSON.stringify("", null, 2)}
          />
        </div>
      </div>
    </>
  );
};
export default GameInput;
