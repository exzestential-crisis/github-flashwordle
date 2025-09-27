import fs from "fs";
import { Octokit } from "octokit";
await import("./dailyWord.js"); // ensure daily word is current

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const stateFile = "./data/state.json";
const repoOwner = "exzestential-crisis";
const repoName = "github-flashwordle";

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = eventPath
    ? JSON.parse(fs.readFileSync(eventPath, "utf-8"))
    : {};
  const guess =
    event.comment?.body?.trim().toUpperCase() ||
    event.issue?.title?.trim().toUpperCase();

  if (!guess || guess.length !== 5) return console.log("Invalid guess");

  const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
  const WORD = state.currentWord;

  if (state.guesses.includes(guess)) return console.log("Already guessed");

  // ✅ Add guess
  state.guesses.push(guess);
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

  // ✅ Regenerate board with colors
  await import("./generateBoard.js");

  // Comment back
  const issue_number =
    event.issue?.number || event.comment?.issue_url?.split("/").pop();

  // Generate feedback with colors for that guess
  const colors = guess
    .split("")
    .map((l, i) => {
      if (l === WORD[i]) return "🟩";
      if (WORD.includes(l)) return "🟨";
      return "⬛";
    })
    .join("");

  await octokit.rest.issues.createComment({
    owner: repoOwner,
    repo: repoName,
    issue_number,
    body: `Your guess: **${guess}**\n${colors}`,
  });

  console.log("Guess processed:", guess);
}

main();
