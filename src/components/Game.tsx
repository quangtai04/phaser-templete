import "phaser";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Game: React.FC<any> = () => {
  const params = useParams();
  const { folder_game } = params as any;

  const [phaserGame, setPhaserGame] = useState<Phaser.Game>(null);

  const lazyLoadGame = async () => {
    console.log("folder_game", folder_game);
    const { default: GameComponent } = await import(`../games/${folder_game}`);
    let gameComponent: Phaser.Game = new GameComponent();
    setPhaserGame(gameComponent);
  };

  if (!phaserGame) {
    lazyLoadGame();
  }
  return <div id="board-game" />;
};

export default Game;
