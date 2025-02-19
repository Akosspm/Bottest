module.exports.config = {
    name: "إعادة_تشغيل",
    version: "7.0.0",
    permission: 3,
    credits: "ryuko",
    prefix: false,
    premium: false,
    description: "إعادة تشغيل نظام البوت",
    category: "المشغل",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event }) {
    const process = require("process");
    const { threadID } = event;

    api.sendMessage("🔄 | يتم الآن إعادة تشغيل النظام بالكامل، يُرجى الانتظار...", threadID, () => process.exit(1));
};