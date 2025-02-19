module.exports.config = {
    name: "إيفانا",
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    version: '1.0.0',
    description: "الدردشة مع إيفانا أالوي",
    prefix: false,
    premium: false,
    permission: 0,
    category: "بدون بادئة",
    cooldowns: 0,
    dependencies: {
        "axios": ""
    }
}

const axios = require("axios");

module.exports.run = async function ({api, event, args }) {
    const ask = args.join(' ');
    
    if (!ask) {
        return api.sendMessage(`❌ | يرجى كتابة رسالة للدردشة مع إيفانا.`, event.threadID, event.messageID);
    }

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const res = await axios.get(`https://character-api.up.railway.app/api?name=ivana&message=${encodeURIComponent(ask)}`);
        const data = res.data;

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        return api.sendMessage(`🗣️ | إيفانا: ${data.message}`, event.threadID, event.messageID);

    } catch (error) {
        console.error("خطأ أثناء الاتصال بـ API:", error);
        return api.sendMessage(`❌ | حدث خطأ أثناء محاولة الدردشة مع إيفانا. حاول مرة أخرى لاحقًا.`, event.threadID, event.messageID);
    }
}