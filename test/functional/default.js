const fs     = require('fs'),
      path   = require('path'),
      {test} = require('ava'),
      mock   = require('mock-fs'),
      pakku  = require('../../lib'),
      db     = require('../lib/files'),
      CWD         = process.cwd(),
      BASE_DIR    = 'src/',
      TARGET_FILE = path.join(BASE_DIR, 'index.html'),
      BUILD_DIR   = 'build';

let cache;

test.before('setting up fs', mock.bind(this, db.generateFiles(BASE_DIR)));
test.cb.before('running pakku', (t) => {
  pakku(TARGET_FILE, BUILD_DIR, {sourcemaps: true})
    .on('after_build', (c) => (cache = c, t.end()))
    .on('fatal', t.end);
});
test.beforeEach((t) => t.context.cache = cache);

test.cb('check for target build directory', (t) => {
  fs.stat(`${CWD}/${BUILD_DIR}`, t.end);
});

test('check file structure', (t) => {
  const cachedFiles = Object.values(t.context.cache);
  t.plan(cachedFiles.length);
  cachedFiles.forEach(({vname}) => {
    t.notThrows(fs.statSync.bind(this, `${BUILD_DIR}/${vname}`));
  });
});

test.after('cleaning up fs', mock.restore);
