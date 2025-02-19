const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "operator",
    version: "2.1.0",
    permission: 3,
    credits: "ryuko (تحسين وتعريب: مطور مجهول)",
    description: "إدارة مشغلي البوت (Operators)",
    prefix: true,
    premium: false,
    category: "الإدارة",
    usages: "operator [add/remove/list] [uid]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, Users, permission }) {
    const { threadID, messageID, senderID, mentions } = event;
    const configPath = path.resolve(__dirname, "../../config.json");

    // التأكد من أن الملف موجود
    if (!fs.existsSync(configPath)) {
        return api.sendMessage("❌ | ملف الإعدادات غير موجود، تأكد من صحة المسار!", threadID, messageID);
    }

    // تحميل الإعدادات وتحديث البيانات
    delete require.cache[require.resolve(configPath)];
    let config = require(configPath);
    let { operators } = config;

    // التحقق من وجود إذن
    if (permission < 3) {
        return api.sendMessage("🚫 | ليس لديك الصلاحيات لاستخدام هذا الأمر.", threadID, messageID);
    }

    switch (args[0]?.toLowerCase()) {
        case "list":
        case "all":
        case "-a": {
            let msg = "📋 | قائمة مشغلي البوت:\n\n";
            for (const id of operators) {
                const name = await Users.getNameUser(id);
                msg += `🔹 الاسم: ${name}\n🆔 UID: ${id}\n\n`;
            }
            return api.sendMessage(msg, threadID, messageID);
        }

        case "add": {
            let addedList = [];

            if (Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    if (!operators.includes(id)) {
                        operators.push(id);
                        addedList.push(`🆔 ${id} - ${mentions[id]}`);
                    }
                }
            } else if (args[1] && !isNaN(args[1])) {
                if (!operators.includes(args[1])) {
                    operators.push(args[1]);
                    const name = await Users.getNameUser(args[1]);
                    addedList.push(`🆔 ${args[1]} - ${name}`);
                }
            } else {
                return api.sendMessage("⚠️ | يرجى تحديد مستخدم صحيح لإضافته.", threadID, messageID);
            }

            // حفظ التحديثات
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

            return api.sendMessage(`✅ | تمت إضافة ${addedList.length} مشغل جديد:\n\n${addedList.join("\n")}`, threadID, messageID);
        }

        case "remove":
        case "rm":
        case "delete": {
            let removedList = [];

            if (Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    const index = operators.indexOf(id);
                    if (index !== -1) {
                        operators.splice(index, 1);
                        removedList.push(`🆔 ${id} - ${mentions[id]}`);
                    }
                }
            } else if (args[1] && !isNaN(args[1])) {
                const index = operators.indexOf(args[1]);
                if (index !== -1) {
                    operators.splice(index, 1);
                    const name = await Users.getNameUser(args[1]);
                    removedList.push(`🆔 ${args[1]} - ${name}`);
                }
            } else {
                return api.sendMessage("⚠️ | يرجى تحديد مستخدم صحيح لإزالته.", threadID, messageID);
            }

            // حفظ التحديثات
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

            return api.sendMessage(`✅ | تمت إزالة ${removedList.length} مشغل:\n\n${removedList.join("\n")}`, threadID, messageID);
        }

        default:
            return api.sendMessage("⚠️ | الاستخدام غير صحيح! استخدم:\n- operator list\n- operator add @mention\n- operator remove @mention", threadID, messageID);
    }
};