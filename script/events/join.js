module.exports.config = {
    name: "join",
    eventType: ["log:subscribe"],
    version: "1.1.0",
    credits: "ryuko (modified by arabic dev)",
    description: "إشعار الترحيب عند دخول الأعضاء",
    dependencies: { "fs-extra": "" }
};

module.exports.run = async function({ api, event, Threads, botname, prefix }) {
    const { threadID } = event;
    const data = (await Threads.getData(threadID)).data || {};
    const checkban = data.banOut || [];
    const botID = await api.getCurrentUserID();

    if (checkban.includes(botID)) return;

    if (event.logMessageData.addedParticipants.some(user => user.userFbId == botID)) {
        api.changeNickname(`${botname} AI`, threadID, botID);
        return api.sendMessage(
            `✅ تم الاتصال بنجاح\n\n📌 **معلوماتي:**\n🤖 اسم البوت: ${botname}\n⌨️ البريفكس: ${prefix}\n\n📊 **إحصائيات البوت:**\n👥 المستخدمين: ${global.data.allUserID.length}\n🛡️ المجموعات: ${global.data.allThreadID.size}\n\n🔹 **كيفية الاستخدام؟**\n- ${prefix}help (لعرض قائمة الأوامر)\n- ai (سؤال) - بدون بريفكس\n- talk (نص) - بدون بريفكس\n\n🚀 **Ryuko BotPack V5**`,
            threadID
        );
    } else {
        try {
            const { createReadStream } = global.nodemodule["fs-extra"];
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const threadData = global.data.threadData.get(parseInt(threadID)) || {};

            let mentions = [], nameArray = [], memLength = [];
            
            for (const user of event.logMessageData.addedParticipants) {
                nameArray.push(user.fullName);
                mentions.push({ tag: user.fullName, id: user.userFbId });
                memLength.push(participantIDs.length);
            }

            memLength.sort((a, b) => a - b);

            let msg = threadData.customJoin || "👋 مرحبًا، {name}، أهلاً وسهلاً بك في {threadName}!";
            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, memLength.length > 1 ? 'أصدقاؤك' : 'أنت')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName);

            return api.sendMessage({ body: msg, mentions }, threadID);
        } catch (error) {
            console.error(error);
        }
    }
};