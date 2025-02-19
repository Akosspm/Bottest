module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.1.0",
    credits: "ryuko (modified by arabic dev)",
    description: "إشعار عند مغادرة شخص من المجموعة"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    try {
        const { threadID } = event;
        const leftUserID = event.logMessageData.leftParticipantFbId;

        // إذا كان البوت هو من غادر، فلا داعي لإرسال إشعار
        if (leftUserID == api.getCurrentUserID()) return;

        const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
        const name = global.data.userName.get(leftUserID) || await Users.getNameUser(leftUserID);

        // التحقق مما إذا كان المستخدم خرج بنفسه أم تمت إزالته
        const type = (event.author == leftUserID) ? "غادر المجموعة." : "تمت إزالته من المجموعة.";

        // تخصيص الرسالة
        let msg = data.customLeave || "👋 {name}، {type}";

        msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

        // إرسال الرسالة
        return api.sendMessage({ body: msg }, threadID);
    } catch (err) {
        console.error(err);
    }
};