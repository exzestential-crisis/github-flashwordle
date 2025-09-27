import fs from "fs";
import { createCanvas } from "canvas";

const state = JSON.parse(fs.readFileSync("./data/state.json", "utf-8"));
const guesses = state.guesses;
const WORD = state.currentWord;

const COLS = 5;
const ROWS = 6;
const SIZE = 50;
const GAP = 5;

const canvas = createCanvas(
  COLS * SIZE + GAP * (COLS - 1),
  ROWS * SIZE + GAP * (ROWS - 1)
);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw grid
for (let i = 0; i < ROWS; i++) {
  const row = guesses[i] || "";
  for (let j = 0; j < COLS; j++) {
    const letter = row[j] || "";

    let color = "#d1d5db"; // default gray
    if (letter) {
      if (letter === WORD[j]) color = "#0ea5e9"; // blue/green
      else if (WORD.includes(letter)) color = "#facc15"; // yellow
      else color = "#6b7280"; // dark gray
    }

    ctx.fillStyle = color;
    ctx.fillRect(j * (SIZE + GAP), i * (SIZE + GAP), SIZE, SIZE);

    if (letter) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        letter,
        j * (SIZE + GAP) + SIZE / 2,
        i * (SIZE + GAP) + SIZE / 2
      );
    }
  }
}

const out = fs.createWriteStream("./data/board.png");
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on("finish", () => console.log("Board image updated!"));
