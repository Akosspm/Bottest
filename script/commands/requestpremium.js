module.exports.config = {
  name: "طلب_بريميوم",
  version: "1.0.0",
  permission: 0,
  prefix: false,
  premium: false,
  category: "النظام",
  cooldown: 100,
  description: "طلب ترقية إلى بريميوم",
  ussage: "طلب_بريميوم"
};

module.exports.run = async function({ api, args, event, Users }) {
  const { sendMessage } = api;
  const { threadID, messageID, senderID } = event;

  if (global.config.premium) {
    const message = args.join(" ");
    if (!message) {
      return sendMessage("⚠️ | يُرجى إدخال رسالة لطلب البريميوم.", threadID, messageID);
    }

    let username;
    try {
      username = await Users.getNameUser(senderID);
    } catch (error) {
      username = "مستخدم فيسبوك";
    }

    try {
      api.sendMessage("✅ | تم إرسال طلبك إلى مشغل البوت عبر البريد.", threadID, messageID);
      global.config.operators.forEach((i) => {
        api.sendMessage(
          `🔔 | طلب بريميوم جديد!\n\n👤 | المستخدم: ${username}\n🆔 | معرف المستخدم: ${senderID}\n📩 | الرسالة:\n${message}`,
          i
        );
      });
    } catch (err) {
      return api.sendMessage("❌ | حدث خطأ أثناء إرسال الطلب، يُرجى المحاولة لاحقًا.", threadID, messageID);
    }
  } else {
    return sendMessage("⚠️ | نظام البريميوم غير مُفعل حاليًا.", threadID, messageID);
  }
};