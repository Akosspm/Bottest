module.exports.config = {
    name: "تذكير",
    version: "0.0.1",
    permission: 0,
    credits: "ryuko",
    prefix: true,
    premium: false,
    description: "إرسال إشعار بالتذكير",
    category: "مع البادئة",
    usages: "[الوقت] [النص]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
    const time = args[0];
    const text = args.slice(1).join(" ");

    if (this.config.credits !== "ryuko") 
        return api.sendMessage("⚠️ | يُرجى عدم تغيير حقوق المبرمج.", event.threadID, event.messageID);

    if (isNaN(time)) 
        return api.sendMessage(
            `❓ | كيفية الاستخدام:\n${global.config.PREFIX}تذكير [الوقت بالثواني] [النص]\n\n📌 | مثال:\n${global.config.PREFIX}تذكير 60 هذا البوت صنعه ryuko\n\n⏳ | ملاحظة:\n- الرقم 59 يعني ثانية واحدة لكل عدد.\n- الرقم 60 يعني دقيقة واحدة.\n\n🕒 | مثال للتذكير بالدقائق:\n${global.config.PREFIX}تذكير 99999 [النص]\n(99999 يساوي تقريبًا 16 دقيقة)`, 
            event.threadID, event.messageID
        );

    const display = time > 59 ? `${Math.round(time / 60)} دقيقة` : `${time} ثانية`;
    api.sendMessage(`⏳ | سأذكرك بعد ${display}.`, event.threadID, event.messageID);

    await new Promise(resolve => setTimeout(resolve, time * 1000));

    var value = await api.getThreadInfo(event.threadID);
    if (!(value.nicknames)[event.userID]) 
        value = (await Users.getInfo(event.senderID)).name;
    else 
        value = (value.nicknames)[event.senderID];

    return api.sendMessage({
        body: text ? `🔔 | ${value}،\nتذكير: ${text}` : `🔔 | ${value}، أعتقد أنك طلبت مني تذكيرك بشيء، صحيح؟ 🤔`,
        mentions: [{ tag: value, id: event.senderID }]
    }, event.threadID, event.messageID);
};