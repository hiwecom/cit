const { run } = require("./utils");

(async () => {
  while (true) {
    try {
      await run();
    } catch (err) {
      console.error(err);
      await new Promise((resolve) => {
        setTimeout(() => resolve(), 2000);
      });
    }
  }
})();
