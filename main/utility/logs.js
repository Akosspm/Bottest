const chalk = require('chalk');
const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");
const configLog = JSON.parse(readFileSync('./main/utility/config.json'));

module.exports = async (log, type) => {
  switch (type) {
    case "load": 
      console.log(`${chalk.hex("#00FFFF").bold(configLog.load)} - ${chalk.whiteBright(log)}`);
      break;
    case "err":
      console.log(`${chalk.hex("#FF0000").bold(configLog.error)} - ${chalk.whiteBright(log)}`);
      break;
    case "warn":
      console.warn(`${chalk.hex("#FFD700").bold(configLog.warn)} - ${chalk.whiteBright(log)}`);
      break;
    case "login":
      console.log(`${chalk.hex("#00FF00").bold(configLog.login)} - ${chalk.whiteBright(log)}`);
      break;
    case "cmd":
      console.log(`${chalk.hex("#FF00FF").bold(configLog.cmd)} - ${chalk.whiteBright(log)}`);
      break;
    case "evnts":
      console.log(`${chalk.hex("#1E90FF").bold(configLog.evnts)} - ${chalk.whiteBright(log)}`);
      break;
    case "error":
      console.log(`${chalk.hex("#FF0000").bold(configLog.error)} - ${chalk.whiteBright(log)}`);
      break;
    default:
      console.log(`${chalk.hex("#00FFFF").bold(configLog.load)} - ${chalk.whiteBright(log)}`);
      break;
  }
}

module.exports.commands = async (log) => {
  console.log(`${chalk.hex("#8A2BE2").bold(configLog.cmd)} - ${chalk.whiteBright(log)}`);
}

module.exports.events = async (log) => {
  console.log(`${chalk.hex("#FF4500").bold(configLog.evnts)} - ${chalk.whiteBright(log)}`);
}

module.exports.login = async (log) => {
  console.log(`${chalk.hex("#32CD32").bold(configLog.login)} - ${chalk.whiteBright(log)}`);
}

module.exports.error = async (log) => {
  console.log(`${chalk.hex("#DC143C").bold(configLog.error)} - ${chalk.whiteBright(log)}`);
}

module.exports.database = async (log) => {
  console.log(`${chalk.hex("#4682B4").bold(`DATABASE`)} - ${chalk.whiteBright(log)}`);
}
module.exports.update = async (log) => {
  console.log(`${chalk.hex("#FF8C00").bold(`UPDATE`)} - ${chalk.whiteBright(log)}`);
}
module.exports.backup = async (log) => {
  console.log(`${chalk.hex("#00CED1").bold(`BACKUP`)} - ${chalk.whiteBright(log)}`);
}
module.exports.download = async (log) => {
  console.log(`${chalk.hex("#9932CC").bold(`DOWNLOAD`)} - ${chalk.whiteBright(log)}`);
}
module.exports.install = async (log) => {
  console.log(`${chalk.hex("#FFD700").bold(`INSTALL`)} - ${chalk.whiteBright(log)}`);
}