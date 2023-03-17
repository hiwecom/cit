const { runAll } = require("./utils");

(async () => {
  let runIndex = 1;
  while (true) {
    try {
      await runAll(runIndex++);
    } catch (err) {
      console.error(err);
      await new Promise((resolve) => {
        setTimeout(() => resolve(), 2000);
      });
    }
  }
})();
