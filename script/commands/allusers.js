module.exports.config = {
    name: "كل_الأعضاء",
    version: "1.0.5",
    permission: 0,
    prefix: false,
    credits: "Deku (مع تعديلات من ChatGPT)",
    description: "عرض جميع معرفات وأسماء الأعضاء في المجموعة.",
    premium: false,
    category: "بدون بادئة",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args, Users }) {
  
    function إرسال_رسالة(النص) {
        api.sendMessage(النص, event.threadID, event.messageID);
    }

    let جميع_الأعضاء = event.participantIDs;
    let الرسالة = "";
    let العدد = 0;

    for (let العضو of جميع_الأعضاء) {
        العدد += 1;
        const الاسم = await Users.getNameUser(العضو);
        الرسالة += `🔹 ${العدد}. **${الاسم}**\n📌 **معرف المستخدم:** ${العضو}\n🔗 **رابط الحساب:** [اضغط هنا](https://facebook.com/${العضو})\n\n`;
    }

    let رسالة_الإرسال = `📋 **قائمة الأعضاء في المجموعة:**\n👥 **إجمالي الأعضاء:** ${جميع_الأعضاء.length}\n\n${الرسالة}`;

    إرسال_رسالة(رسالة_الإرسال);
};