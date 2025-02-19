module.exports.config = {
  name: "كل_المجموعات",
  version: "2.0.0",
  permission: 2,
  credits: "ryuko",
  description: "عرض جميع المجموعات التي يتواجد فيها البوت",
  prefix: true,
  premium: false,
  category: "الإدارة",
  usages: "كل_المجموعات",
  cooldowns: 5,
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply }) {
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  var arg = event.body.split(" ");
  var idالمجموعة = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {
    case "reply":
      {
        if (arg[0].toLowerCase() === "حظر") {
          const data = (await Threads.getData(idالمجموعة)).data || {};
          data.banned = 1;
          await Threads.setData(idالمجموعة, { data });
          global.data.threadBanned.set(parseInt(idالمجموعة), 1);
          api.sendMessage(`✅ تم حظر المجموعة بنجاح.\n📌 معرف المجموعة: ${idالمجموعة}`, event.threadID, event.messageID);
          break;
        }

        if (arg[0].toLowerCase() === "مغادرة") {
          api.removeUserFromGroup(`${api.getCurrentUserID()}`, idالمجموعة);
          api.sendMessage(`🚪 غادر البوت المجموعة بنجاح.\n📌 معرف المجموعة: ${idالمجموعة}\n📛 اسم المجموعة: ${(await Threads.getData(idالمجموعة)).name}`, event.threadID, event.messageID);
          break;
        }
      }
  }
};

module.exports.run = async function({ api, event, client, botid }) {
  var المحادثات = await api.getThreadList(100, null, ['INBOX']);
  let المجموعات = [...المحادثات].filter(group => group.isSubscribed && group.isGroup);

  var قائمة_المجموعات = [];

  for (var معلومات_المجموعة of المجموعات) {
    let بيانات = (await api.getThreadInfo(معلومات_المجموعة.threadID));

    قائمة_المجموعات.push({
      id: معلومات_المجموعة.threadID,
      name: معلومات_المجموعة.name,
      عدد_الأعضاء: بيانات.userInfo.length,
    });
  }

  var المجموعات_مرتبة = قائمة_المجموعات.sort((a, b) => b.عدد_الأعضاء - a.عدد_الأعضاء);

  let رسالة = `📋 **قائمة المجموعات التي يتواجد بها البوت:**\n\n`;
  var معرفات_المجموعات = [];
  let i = 1;

  for (var مجموعة of المجموعات_مرتبة) {
    رسالة += `🔹 ${i++}. **${مجموعة.name}**\n📌 **معرف المجموعة:** ${مجموعة.id}\n👥 **عدد الأعضاء:** ${مجموعة.عدد_الأعضاء}\n\n`;
    معرفات_المجموعات.push(مجموعة.id);
  }

  api.sendMessage(رسالة + '🔹 **للتحكم في مجموعة، قم بالرد على هذه الرسالة بـ:**\n📌 `"حظر [رقم]"` لحظر مجموعة.\n📌 `"مغادرة [رقم]"` لمغادرة مجموعة.', event.threadID, (e, data) =>
    global.client.handleReply.get(botid).push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid: معرفات_المجموعات,
      type: 'reply'
    })
  );
};