/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
const { exec } = require('child_process');

export default async function runCommand(cmds, cb) {
  const next = cmds.shift();
  if (!next) return cb();
  await exec(
    next,
    {
      cwd: __dirname,
    },

    (err, stdout, stderr) => {
      console.log(stdout);
      if (err && !next.match(/\-s$/)) {
        console.log(`O commando "${next}" falhou.`, err);
        cb(err);
      } else runCommand(cmds, cb);
    }
  );

  return true;
}
