const shell = require("shelljs");
const fs = require("fs");
const path = require("path");

const ipareDir = "ipare/packages";

shell.exec("git clone https://github.com/ipare/ipare");
const packages = fs
  .readdirSync(ipareDir)
  .filter((pkg) => fs.statSync(path.join(ipareDir, pkg)).isDirectory())
  .map((item) => `@ipare/${item}`);

const command = `yarn add ${packages.join(" ")}`;
console.log("command", command);
shell.exec(command, (code) => {
  if (code != 0) {
    throw new Error(code.toString());
  }
});
