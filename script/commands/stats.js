const fs = require("fs");
const os = require("os");

module.exports.config = {
  name: "الإحصائيات",
  version: "1.0.0",
  permission: 0,
  credits: "Jonell Magallanes",
  description: "عرض حالة البوت",
  prefix: false,
  premium: false,
  category: "النظام",
  usages: "stats",
  cooldowns: 9
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const botID = await api.getCurrentUserID();
  const startTime = Date.now();

  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const uptime = `${hours} ساعة، ${minutes} دقيقة، ${seconds} ثانية`;

  const osDetails = `${os.type()} ${os.release()} (${os.arch()})`;

  const latencyMessage = await api.sendMessage("⏳ | جارٍ تحميل البيانات...", threadID, messageID);
  const latency = Date.now() - startTime;

  const data = `👥 **المستخدمون:** ${global.data.allUserID.length}\n💬 **المجموعات:** ${global.data.allThreadID.get(botID).length}\n⏱️ **مدة التشغيل:** ${uptime}\n🖥️ **نظام التشغيل:** ${osDetails}\n⚡ **زمن الاستجابة:** ${latency} مللي ثانية`;

  api.editMessage(`📊 **حالة البوت**\n${global.line}\n${data}`, latencyMessage.messageID, threadID);
};