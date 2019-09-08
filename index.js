const fs = require('fs');
const path = require('path');

let workdir = module.parent.paths[0].replace(/\/node_modules$/, '');
const configPaths = ['jsconfig.json', 'tsconfig.json'];
const aliasPaths = {
  // '@/': ['/Users/test/Workspace/test/src/', '/Users/test/Workspace/test/tools/'],
  // add: ['/Users/test/Workspace/test/src/utils/add.js'],
};

/**
 * file exists
 * @param {string} file
 */
function stat(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * parse jsonc
 * @param {string} file
 */
function parseJsonc(file) {
  const jsonc = fs.readFileSync(file, 'utf8');
  try {
    return Function(`return (${jsonc})`)(); // eslint-disable-line
  } catch (err) {
    return {};
  }
}

/**
 * get config from jsconfig.json or tsconfig.json
 */
function getConfig() {
  for (let i = 0; i < configPaths.length; i += 1) {
    const file = path.join(workdir, configPaths[i]);
    // console.log(stat(file), workdir, file);
    if (stat(file)) {
      return parseJsonc(file);
    }
  }
  return {};
}

/**
 * parse alias
 */
function parseAliasPaths() {
  const { compilerOptions = {} } = getConfig();
  const { baseUrl, paths = {} } = compilerOptions;
  const alias = Object.keys(paths);
  alias.forEach((name) => {
    const arr = paths[name]
      .map((it) => it.replace(/\/\*$/, '')) // remove /*
      .map((it) => it.replace(/\.ts$/, '')) // remove .ts
      .map((it) => path.resolve(workdir, baseUrl || './', it));
    aliasPaths[name.replace(/\*$/, '')] = arr;
  });
}

/**
 * alias parse for node module
 * @param {string} request module path
 */
function moduleAliasParse(request = '') {
  const first = request[0];
  if (first === '.' || first === '/') {
    return [request, []];
  }
  const alias = Object.keys(aliasPaths);
  for (let i = 0; i <= alias.length; i += 1) {
    const name = alias[i];
    const re = new RegExp(`^${name}`);
    if (re.test(request)) {
      if (name.indexOf('/') === -1) {
        // "alias": ["path/file.js"]
        return [aliasPaths[name][0], []];
      }
      // "alias/*": ["path/*"]
      return [request.replace(re, './'), aliasPaths[name]];
    }
  }
  return [request, []];
}

moduleAliasParse.parseAliasPaths = parseAliasPaths;
moduleAliasParse.setWorkdir = (dir) => {
  workdir = dir;
};
module.exports = moduleAliasParse;
