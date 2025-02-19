module.exports.config = {
    name: "حذف",
    version: "1.0.2",
    permission: 2,
    credits: "nazrul - modified by ChatGPT",
    description: "حذف رسالة عند الرد عليها",
    category: "النظام",
    prefix: true,
    premium: false,
    usages: "حذف (للمسؤولين فقط)",
    cooldowns: 0
};

module.exports.languages = {
    "arabic": {
        "returnCant": "لا يمكن حذف رسالة من مستخدم آخر.",
        "missingReply": "يرجى الرد على الرسالة التي تريد حذفها.",
        "successUnsend": "تم حذف الرسالة بنجاح! ✅"
    }
};

module.exports.run = function({ api, event, getText }) {
    if (event.type !== "message_reply") {
        return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
    }

    if (event.messageReply.senderID !== api.getCurrentUserID()) {
        return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    }

    api.unsendMessage(event.messageReply.messageID, (err) => {
        if (!err) {
            api.sendMessage(getText("successUnsend"), event.threadID);
        }
    });
};