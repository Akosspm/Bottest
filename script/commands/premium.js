module.exports.config = {
  name: "بريميوم",
  version: "2.0.0",
  permission: 0,
  credits: "ryuko",
  description: "إعداد أوامر البريميوم",
  prefix: false,
  category: "الإدارة",
  premium: false,
  usages: "بريميوم [الكل/أضف/إزالة] [معرف المجموعة أو المستخدم]",
  cooldowns: 5,
};

module.exports.languages = {
    "arabic": {
        "listAdmin": '📜 | قائمة المستخدمين المميزين:\n\n%1',
        "notHavePermssion": '🚫 | ليس لديك الإذن لاستخدام "%1"',
        "addedNewAdmin": '✅ | تمت إضافة مستخدم مميز جديد:\n\n%2',
        "removedAdmin": '❌ | تمت إزالة %1 مستخدم من قائمة المستخدمين المميزين:\n\n%2'
    }
};

module.exports.run = async function ({ api, event, args, Threads, Users, permssion, getText }) {
    const content = args.slice(1, args.length);
    const { threadID, messageID, mentions } = event;
    const haspremiumcmd = global.config.haspremiumcmd;

    const configPath = '../../config.json';
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);
    delete require.cache[require.resolve('../../config.json')];
    var config = require('../../config.json');

    switch (args[0]) {
        case "قائمة":
        case "الكل": {
            const listAdmin = haspremiumcmd || config.haspremiumcmd || [];
            var msg = [];

            for (const idAdmin of listAdmin) {
                if (parseInt(idAdmin)) {
                  let boxname;
                  try {
                      const groupName = await global.data.threadInfo.get(idAdmin).threadName || "الاسم غير متوفر";
                      boxname = `📌 | اسم المجموعة: ${groupName}\n🆔 | معرف المجموعة: ${idAdmin}`;
                  } catch (error) {
                      const userName = await Users.getNameUser(idAdmin);
                      boxname = `👤 | اسم المستخدم: ${userName}\n🆔 | معرف المستخدم: ${idAdmin}`;
                  }
                  msg.push(`\n${boxname}`);
                }
            }

            return api.sendMessage(getText("listAdmin", msg.join('\n')), threadID, messageID);
        }

        case "أضف": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "أضف"), threadID, messageID);

            if (mention.length != 0 && isNaN(content[0])) {
                var listAdd = [];

                for (const id of mention) {
                    haspremiumcmd.push(id);
                    config.haspremiumcmd.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                }

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            } else if (content.length != 0 && !isNaN(content[0])) {
                haspremiumcmd.push(content[0]);
                config.haspremiumcmd.push(content[0]);

                let boxname;
                try {
                    const groupname = await global.data.threadInfo.get(content[0]).threadName || "الاسم غير متوفر";
                    boxname = `📌 | اسم المجموعة: ${groupname}\n🆔 | معرف المجموعة: ${content[0]}`;
                } catch (error) {
                    const username = await Users.getNameUser(content[0]);
                    boxname = `👤 | اسم المستخدم: ${username}\n🆔 | معرف المستخدم: ${content[0]}`;
                }

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage('✅ | تمت إضافتك إلى قائمة المستخدمين المميزين، يمكنك الآن استخدام أوامر البريميوم.', content[0], () => {
                    return api.sendMessage(getText("addedNewAdmin", 1, `${boxname}`), threadID, messageID);
                });
            } else {
                return global.utils.throwError(this.config.name, threadID, messageID);
            }
        }

        case "إزالة":
        case "حذف": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "إزالة"), threadID, messageID);

            if (mentions.length != 0 && isNaN(content[0])) {
                var listRemove = [];

                for (const id of mention) {
                    const index = config.haspremiumcmd.findIndex(item => item == id);
                    haspremiumcmd.splice(index, 1);
                    config.haspremiumcmd.splice(index, 1);
                    listRemove.push(`${id} - ${event.mentions[id]}`);
                }

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listRemove.join("\n").replace(/\@/g, "")), threadID, messageID);
            } else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.haspremiumcmd.findIndex(item => item.toString() == content[0]);
                haspremiumcmd.splice(index, 1);
                config.haspremiumcmd.splice(index, 1);

                let boxname;
                try {
                    const groupname = await global.data.threadInfo.get(content[0]).threadName || "الاسم غير متوفر";
                    boxname = `📌 | اسم المجموعة: ${groupname}\n🆔 | معرف المجموعة: ${content[0]}`;
                } catch (error) {
                    const username = await Users.getNameUser(content[0]);
                    boxname = `👤 | اسم المستخدم: ${username}\n🆔 | معرف المستخدم: ${content[0]}`;
                }

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage('❌ | تمت إزالتك من قائمة المستخدمين المميزين', content[0], () => {
                    return api.sendMessage(getText("removedAdmin", 1, `${boxname}`), threadID, messageID);
                });
            } else {
                return global.utils.throwError(this.config.name, threadID, messageID);
            }
        }

        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
};