const shell = require("shelljs");
const fs = require("fs");
const path = require("path");

let index = 0;
const registryArg = "--registry=https://registry.npmjs.org";

exports.run = async () => {
  const cwd = process.cwd();
  index++;
  const tmpDir = path.join(__dirname, `${index}_${getNow()}`);
  fs.mkdirSync(tmpDir);
  process.chdir(tmpDir);

  try {
    const deps1 = await install(tmpDir, require("./packages.json"));
    const deps2 = await install(tmpDir, ["@ipare/cli", "create-ipare"]);

    return [deps1, deps2];
  } finally {
    process.chdir(cwd);
    await fs.promises.rm(tmpDir, {
      recursive: true,
      force: true,
    });
  }
};

async function install(tmpDir, pkgs) {
  if (!(await exec(`npm init -y`))) {
    return;
  }

  const yarnTmpDir = path.join(tmpDir, "yarn");
  const args = `--cache-folder ${yarnTmpDir} ${registryArg}`;
  await exec(`npx yarn add ${pkgs.join(" ")} ${args}`);

  const pkgText = fs.readFileSync("package.json", "utf-8");
  const deps = JSON.parse(pkgText).dependencies;

  await fs.promises.rm("package.json");
  await fs.promises.rm("node_modules", {
    recursive: true,
    force: true,
  });

  return deps;
}

function exec(command) {
  console.log("exec", command);
  return new Promise((resolve) => {
    shell.exec(command, (code) => {
      resolve(code == 0);
    });
  });
}

function getNow() {
  const date = new Date();

  const year = date.getFullYear().toString().padStart(4, "0"),
    month = (date.getMonth() + 1).toString().padStart(2, "0"),
    day = date.getDate().toString().padStart(2, "0"),
    hour = date.getHours().toString().padStart(2, "0"),
    min = date.getMinutes().toString().padStart(2, "0"),
    sec = date.getSeconds().toString().padStart(2, "0");
  return year + month + day + "_" + hour + min + sec;
}
