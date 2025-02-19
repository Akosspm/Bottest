const chalk = require('chalk');

module.exports.config = {
    name: "انضمام",
    version: "1.0.1",
    permission: 2,
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    prefix: true,
    description: "الانضمام إلى المجموعات التي يوجد بها البوت",
    category: "الإدارة",
    premium: false,
    usages: "",
    cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply, Threads }) {
    const { threadID, messageID, senderID, body } = event;
    const { ID } = handleReply;

    if (!body || isNaN(body)) {
        return api.sendMessage("❌ | يجب أن يكون الاختيار رقمًا!", threadID, messageID);
    }
    
    const index = parseInt(body) - 1;
    if (index < 0 || index >= ID.length) {
        return api.sendMessage("❌ | الرقم الذي اخترته غير موجود في القائمة.", threadID, messageID);
    }

    try {
        const threadInfo = await Threads.getInfo(ID[index]);
        const { participantIDs, approvalMode, adminIDs } = threadInfo;

        if (participantIDs.includes(senderID)) {
            return api.sendMessage("⚠️ | أنت بالفعل عضو في هذه المجموعة.", threadID, messageID);
        }

        await api.addUserToGroup(senderID, ID[index]);

        if (approvalMode && !adminIDs.some(item => item.id === api.getCurrentUserID())) {
            return api.sendMessage("✅ | تم إضافتك إلى قائمة الموافقة في المجموعة، يرجى انتظار قبول طلبك.", threadID, messageID);
        } else {
            return api.sendMessage(`✅ | لقد انضممت إلى المجموعة "${threadInfo.threadName}". تحقق من طلبات الرسائل أو الرسائل العشوائية (Spam). إذا لم تجد المجموعة، فقد يكون مطلوبًا موافقة المسؤولين على إضافتك.`, threadID, messageID);
        }
    } catch (error) {
        return api.sendMessage(`❌ | تعذر إضافتك إلى المجموعة. \n⚠️ الخطأ: ${error.message}`, threadID, messageID);
    }
};

module.exports.run = async function({ api, event, Threads, botid }) {
    const { threadID, messageID, senderID } = event;
    let msg = "📋 | قائمة المجموعات المتاحة:\n\n";
    let ID = [];

    try {
        const allThreads = await Threads.getAll();
        allThreads.forEach((thread, index) => {
            msg += `${index + 1}. ${thread.threadInfo.threadName}\n`;
            ID.push(thread.threadID);
        });

        msg += `\n📌 | رد على هذه الرسالة برقم المجموعة التي تريد الانضمام إليها.`;

        return api.sendMessage(msg, threadID, (error, info) => {
            if (!global.client.handleReply.has(botid)) {
                global.client.handleReply.set(botid, []);
            }

            global.client.handleReply.get(botid).push({
                name: module.exports.config.name,
                author: senderID,
                messageID: info.messageID,
                ID
            });
        }, messageID);
    } catch (error) {
        return api.sendMessage(`❌ | حدث خطأ أثناء جلب المجموعات. \n⚠️ الخطأ: ${error.message}`, threadID, messageID);
    }
};