module.exports.config = {
    name: "كينشين",
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    version: '1.0.0',
    description: "تحدث مع كينشين هيمورا",
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
        return api.sendMessage(`❌ | يرجى كتابة رسالة للتحدث مع كينشين هيمورا.`, event.threadID, event.messageID);
    }

    try {
        const res = await axios.get(`https://character-api.up.railway.app/api?name=kenshin&message=${encodeURIComponent(ask)}`);
        const data = res.data;

        if (data.status === "success") {
            return api.sendMessage(`⚔️ | كينشين: ${data.message}`, event.threadID, event.messageID);
        } else {
            return api.sendMessage(`⚠️ | ${data.message}`, event.threadID, event.messageID);
        }
    } catch (error) {
        return api.sendMessage(`❌ | حدث خطأ، يرجى المحاولة لاحقًا.`, event.threadID, event.messageID);
    }
};