const fs = require("node:fs"),
  cp = require("node:child_process");
for (const dir of ["server", "client", "tools", "tests"])
  for (const file of fs.readdirSync(dir))
    if (/\.(cjs|js)$/.test(file))
      cp.execFileSync(process.execPath, ["--check", dir + "/" + file], {
        stdio: "inherit",
      });
const quiz = require("../server/quiz-bank.json");
if (quiz.length !== 1000) throw Error("Quiz count");
if (new Set(quiz.map((q) => q.q)).size !== 1000) throw Error("Duplicate quiz");
for (const q of quiz)
  if (
    q.a.length !== 4 ||
    new Set(q.a).size !== 4 ||
    !Number.isInteger(q.correct) ||
    q.correct < 0 ||
    q.correct > 3
  )
    throw Error("Quiz schema");
const m = require("../public/assets/manifest.json");
if (m.sources.length !== 19) throw Error("Missing source board");
for (const page of [...m.pages, m.actors.player.file, m.actors.monsters.file])
  if (!fs.existsSync("public/assets/" + page)) throw Error("Missing atlas");
console.log(
  "Syntax, 1000 quizzes and",
  Object.keys(m.frames).length,
  "asset regions passed.",
);
