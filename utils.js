const shell = require("shelljs");
const fs = require("fs");
const path = require("path");

const registryArg = "--registry=https://registry.npmjs.org";

exports.run = async (runIndex) => {
  const cwd = process.cwd();
  const tmpDir = path.join(__dirname, runIndex.toString());
  fs.mkdirSync(tmpDir);
  process.chdir(tmpDir);

  try {
    const installIndex = 1;
    const tasks = []
    const packages = require("./packages.json")
    for (const pkg in packages) {
      for (let i = 0; i < packages[pkg]; i++) {
        tasks.push(install(tmpDir, [pkg], installIndex++))
      }
    }
    await Promise.all(tasks)
  } finally {
    process.chdir(cwd);
    await fs.promises.rm(tmpDir, {
      recursive: true,
      force: true,
    });
  }
};

async function install(tmpDir, pkgs, installIndex) {
  if (!(await exec(`npm init -y`))) {
    return;
  }

  const yarnTmpDir = path.join(tmpDir, installIndex.toString());
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
