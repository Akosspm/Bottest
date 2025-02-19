module.exports.config = {
  name: "مساعدة",
  version: "1.0.2",
  permission: 0,
  credits: "ryuko",
  description: "دليل المبتدئين",
  prefix: true,
  premium: false,
  category: "دليل",
  usages: "[عرض الأوامر]",
  cooldowns: 5
};

module.exports.languages = {
  arabic: {
    moduleInfo:
      "📌 الأمر: %1\n📖 الوصف: %2\n\n⚙️ الاستخدام: %3\n📂 الفئة: %4\n⏳ وقت الانتظار: %5 ثانية\n🔑 الصلاحية: %6\n\n💡 الكود من قبل: %7.",
    helpList:
      `📌 هناك %1 أمرًا في %2 فئة.`,
    user: "👤 مستخدم عادي",
    adminGroup: "👑 مشرف المجموعة",
    adminBot: "🤖 مسؤول البوت",
  }
};

module.exports.handleEvent = function ({ api, event, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;  

  if (!body || typeof body == "undefined" || body.indexOf("مساعدة") != 0)
    return;
  const splitBody = body.slice(body.indexOf("مساعدة")).trim().split(/\s+/);
  if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;

  const command = commands.get(splitBody[1].toLowerCase());
  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${
        command.config.usages ? command.config.usages : ""
      }`,
      command.config.category,
      command.config.cooldowns,
      command.config.permission === 0
        ? getText("user")
        : command.config.permission === 1
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};

module.exports.run = async function ({ api, event, args, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const autoUnsend  = true;
  const delayUnsend = 60;

  if (!command) {
    const commandList = Array.from(commands.values());
    const categories = new Set(commandList.map((cmd) => cmd.config.category.toLowerCase()));
    const categoryCount = categories.size;
    const categoryNames = Array.from(categories);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

    let currentPage = 1;
    if (args[0]) {
      const parsedPage = parseInt(args[0]);
      if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
        currentPage = parsedPage;
      } else {
        return api.sendMessage(
          `⚠️ رقم الصفحة غير صالح. يرجى اختيار صفحة بين 1 و ${totalPages}.`,
          threadID,
          messageID
        );
      }
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const visibleCategories = categoryNames.slice(startIdx, endIdx);

    let msg = "";
    for (let i = 0; i < visibleCategories.length; i++) {
      const category = visibleCategories[i];
      const categoryCommands = commandList.filter(
        (cmd) => cmd.config.category.toLowerCase() === category
      );
      const commandNames = categoryCommands.map((cmd) => cmd.config.name);
      msg += `📂 ${category.charAt(0).toUpperCase() + category.slice(1).toUpperCase()} 📂\n${commandNames.join(", ")}\n\n`;
    }

    msg += `📑 الصفحة ${currentPage} من ${totalPages}\n\n`;
    msg += getText("helpList", commands.size, categoryCount, prefix);

    const msgg = {
      body: `📖 قائمة أوامر ${botname.toUpperCase()} 🤖\n\n` + msg
    };

    await api.sendMessage(msgg, threadID, async (error, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        return api.unsendMessage(info.messageID);
      }
    }, messageID);
  } else {
    return api.sendMessage(
      getText(
        "moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${
          command.config.usages ? command.config.usages : ""
        }`,
        command.config.category,
        command.config.cooldowns,
        command.config.permission === 0
          ? getText("user")
          : command.config.permission === 1
          ? getText("adminGroup")
          : getText("adminBot"),
        command.config.credits
      ),
      threadID, async (error, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        return api.unsendMessage(info.messageID);
      }
    }, messageID);
  }
};