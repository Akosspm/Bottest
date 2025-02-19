module.exports.config = {
    name: "كين",
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    version: '1.0.0',
    description: "تحدث مع كين كانيكي",
    prefix: false,
    premium: false,
    permission: 0,
    category: "بدون بادئة",
    cooldowns: 0,
    dependencies: {
        "axios": ""
    }
};

const axios = require("axios");

module.exports.run = async function ({ api, event, args }) {
    const ask = args.join(' ');

    if (!ask) {
        return api.sendMessage(`❌ | يرجى كتابة رسالة لتتحدث مع كين كانيكي.`, event.threadID, event.messageID);
    }

    try {
        const res = await axios.get(`https://character-api.up.railway.app/api?name=ken&message=${encodeURIComponent(ask)}`);
        const data = res.data;

        if (data.status === "success") {
            return api.sendMessage(`🖤 | كين: ${data.message}`, event.threadID, event.messageID);
        } else {
            return api.sendMessage(`⚠️ | ${data.message}`, event.threadID, event.messageID);
        }
    } catch (error) {
        return api.sendMessage(`❌ | حدث خطأ، يرجى المحاولة مرة أخرى لاحقًا.`, event.threadID, event.messageID);
    }
};