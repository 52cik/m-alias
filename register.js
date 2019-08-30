const Module = require('module');
const moduleAliasParse = require('.');

const workdir = module.parent.paths[0].replace(/\/node_modules$/, '');
moduleAliasParse.setWorkdir(workdir);
moduleAliasParse.parseAliasPaths();

/* eslint no-underscore-dangle: off */
const { _resolveLookupPaths } = Module;
Module._resolveLookupPaths = (request, parent, newReturn) => {
  const [newRequest, aliasPaths] = moduleAliasParse(request);
  const paths = _resolveLookupPaths(newRequest, parent, newReturn);
  return aliasPaths.concat(paths);
};

const { _findPath } = Module;
Module._findPath = (request, paths, isMain) => {
  const [newRequest] = moduleAliasParse(request);
  return _findPath(newRequest, paths, isMain);
};
