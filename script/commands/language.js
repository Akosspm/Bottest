module.exports.config = {
    name: "language",
    version: "1.0.1",
    permission: 2,
    prefix: true,
    credits: "ryuko (تحسين وتعريب: مطور مجهول)",
    description: "تغيير لغة البوت",
    premium: false,
    category: "الإدارة",
    usages: "[arabic] [english]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;

    // التحقق من صلاحيات المستخدم
    if (!global.config.operators.includes(senderID)) {
        return api.sendMessage("❌ | هذا الأمر مخصص فقط لمشغلي البوت.", threadID, messageID);
    }

    switch (args[0]?.toLowerCase()) {
        case "arabic":
            global.config.language = "arabic";
            return api.sendMessage("✅ | تم تغيير لغة البوت إلى العربية.", threadID, messageID);

        case "english":
            global.config.language = "english";
            return api.sendMessage("✅ | The bot language has been changed to English.", threadID, messageID);

        default:
            return api.sendMessage("⚠️ | خطأ في الصياغة! استخدم الأمر كالتالي:\n- language arabic\n- language english", threadID, messageID);
    }
};