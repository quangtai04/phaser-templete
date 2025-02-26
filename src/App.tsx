import React, { Suspense, lazy } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "./services/store";

const Game = lazy(() => import("./components/Game"));
const GameInput = lazy(() => import("./components/game-input/GameInput"));

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<></>}>
          <Routes>
            <Route path="/game/:folder_game" element={<Game />} />
            <Route path="/dev" element={<GameInput />} />
            <Route path="/" element={<></>} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
