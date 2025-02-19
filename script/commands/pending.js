module.exports.config = {
    name: "المعلّقة",
    version: "1.0.5",
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    prefix: false,
    premium: false,
    permission: 2,
    description: "الموافقة على المجموعات المعلقة",
    category: "الإدارة",
    cooldowns: 5
};

module.exports.languages = {
    "arabic": {
        "invaildNumber": "❌ | %1 ليس رقمًا صحيحًا!",
        "cancelSuccess": "✅ | تم رفض %1 مجموعة.",
        "notiBox": "✅ | تم قبول مجموعتك، يمكنك الآن استخدام البوت.",
        "approveSuccess": "✅ | تم قبول %1 مجموعة بنجاح.",

        "cantGetPendingList": "⚠️ | تعذّر جلب قائمة المجموعات المعلقة.",
        "returnListPending": "📌 | عدد المجموعات المعلقة للموافقة: %1 مجموعة\n\n%2",
        "returnListClean": "✅ | لا توجد أي مجموعة في قائمة الانتظار."
    }
}

module.exports.handleReply = async function({ api, event, handleReply, getText }) {
    if (String(event.senderID) !== String(handleReply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if (isNaN(body) && (body.startsWith("c") || body.startsWith("cancel"))) {
        const indexList = body.slice(1).split(/\s+/);
        for (const singleIndex of indexList) {
            if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) {
                return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
            }
            api.removeUserFromGroup(api.getCurrentUserID(), handleReply.pending[singleIndex - 1].threadID);
            count++;
        }
        return api.sendMessage(getText("cancelSuccess", count), threadID, messageID);
    } else {
        const indexList = body.split(/\s+/);
        for (const singleIndex of indexList) {
            if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) {
                return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
            }
            api.sendMessage(getText("notiBox"), handleReply.pending[singleIndex - 1].threadID);
            count++;
        }
        return api.sendMessage(getText("approveSuccess", count), threadID, messageID);
    }
}

module.exports.run = async function({ api, event, getText, botid }) {
    const { threadID, messageID } = event;
    const commandName = this.config.name;
    let msg = "", index = 1;

    try {
        var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
        var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) { 
        return api.sendMessage(getText("cantGetPendingList"), threadID, messageID);
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list) {
        msg += `${index++}. ${single.name} (${single.threadID})\n`;
    }

    if (list.length !== 0) {
        return api.sendMessage(getText("returnListPending", list.length, msg), threadID, (error, info) => {
            global.client.handleReply.get(botid).push({
                name: commandName,
                messageID: info.messageID,
                author: event.senderID,
                pending: list
            });
        }, messageID);
    } else {
        return api.sendMessage(getText("returnListClean"), threadID, messageID);
    }
}