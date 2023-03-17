const shell = require("shelljs");
const fs = require("fs");
const path = require("path");
const packages = require("./packages.json")

const registryArg = "--registry=https://registry.npmjs.org";

exports.runAll = async (runIndex) => {
  return await run(packages, runIndex)
};

exports.runSingle = async (pkg, times) => {
  const obj = {}
  obj[pkg] = times;
  return await run(obj, 0)
}

async function run(pkgs, runIndex) {
  const cwd = process.cwd();
  const tmpDir = path.join(__dirname, runIndex.toString());
  fs.mkdirSync(tmpDir);
  process.chdir(tmpDir);

  try {
    let installIndex = 1;
    const weightPkgs = {}
    for (const pkg in pkgs) {
      const weight = pkgs[pkg];
      const weightStr = weight.toString();
      weightPkgs[weightStr] = weightPkgs[weightStr] ?? []
      weightPkgs[weightStr].push(pkg)
    }
    for (const weightStr in weightPkgs) {
      const weight = Number(weightStr);
      for (let i = 0; i < weight; i++) {
        await install(tmpDir, weightPkgs[weightStr], installIndex++);
      }
    }
  } finally {
    process.chdir(cwd);
    await fs.promises.rm(tmpDir, {
      recursive: true,
      force: true,
    });
  }
}

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
