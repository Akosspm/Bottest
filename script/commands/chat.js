module.exports.config = {
  name: "chatcontrol", // تغيير اسم الأمر
  version: "1.1.1",
  permission: 1,
  credits: "Jonell Magallanes (تحسينات وتعريب: ChatGPT)",
  description: "إزالة الأعضاء غير الإداريين تلقائيًا عند الدردشة",
  prefix: true,
  premium: false,
  category: "الإدارة",
  usages: "[on/off]",
  cooldowns: 30
};

const fs = require("fs");
const path = __dirname + "/cache/chat.json";
let chat = {};

// 🔹 تحميل بيانات الدردشة عند تشغيل البوت
module.exports.onLoad = function () {
  if (fs.existsSync(path)) {
    try {
      chat = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch (error) {
      console.error("❌ خطأ أثناء قراءة ملف chat.json:", error);
      chat = {};
    }
  } else {
    fs.writeFileSync(path, JSON.stringify({}), "utf-8");
  }
};

// 🔹 دالة لجلب اسم المستخدم
async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "مستخدم غير معروف";
  } catch (error) {
    console.error("❌ خطأ أثناء جلب اسم المستخدم:", error);
    return "مستخدم غير معروف";
  }
}

// 🔹 التعامل مع الأحداث (إزالة غير الإداريين عند تفعيل "chatcontrol off")
module.exports.handleEvent = async function({ api, event }) {
  const threadID = String(event.threadID);
  if (!chat[threadID]) return; // إذا لم يكن "chatcontrol off" مفعلًا، لا تفعل شيئًا

  const botID = api.getCurrentUserID();
  if (event.senderID === botID) return; // تجاهل رسائل البوت نفسه

  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
    const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);

    if (!isAdmin && isBotAdmin) {
      api.removeUserFromGroup(event.senderID, event.threadID);
      api.sendMessage(`🚫 ${await getUserName(api, event.senderID)} تم طرده من المجموعة بسبب تفعيل "chatcontrol off" من قِبل المسؤول.`, event.threadID);
    }
  } catch (error) {
    console.error("❌ خطأ أثناء معالجة الحدث:", error);
  }
};

// 🔹 تفعيل أو تعطيل "chatcontrol off"
module.exports.run = async function({ api, event, args }) {
  const threadID = String(event.threadID);
  if (!(threadID in chat)) chat[threadID] = false; // تعيين الحالة الافتراضية

  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);

    if (!isAdmin) {
      return api.sendMessage("⚠️ يجب أن تكون مسؤولًا لتغيير إعدادات الدردشة.", threadID);
    }

    if (args[0] === "off") {
      chat[threadID] = true;
      fs.writeFileSync(path, JSON.stringify(chat), "utf-8");
      return api.sendMessage("✅ تم **تفعيل** وضع 'chatcontrol off'. سيتم الآن إزالة الأعضاء غير الإداريين عند إرسالهم للرسائل.", threadID);
    } else if (args[0] === "on") {
      chat[threadID] = false;
      fs.writeFileSync(path, JSON.stringify(chat), "utf-8");
      return api.sendMessage("✅ تم **إيقاف** وضع 'chatcontrol off'. لن يتم إزالة أي عضو بعد الآن.", threadID);
    } else {
      return api.sendMessage("⚠️ الاستخدام الصحيح:\n- `chatcontrol on` لإيقاف الوضع\n- `chatcontrol off` لتفعيله", threadID);
    }
  } catch (error) {
    console.error("❌ خطأ أثناء تنفيذ الأمر:", error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى لاحقًا.", threadID);
  }
};