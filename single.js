const { runSingle } = require("./utils");

const pkg = process.argv[2];
const times = process.argv[3];

(async () => {
  await runSingle(pkg, Number(times ?? 1));
})();
