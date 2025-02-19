module.exports.config = {
    name: "تحديث_بيانات_المجموعات",
    version: "1.0",
    permission: 2,
    credits: "ryuko",
    premium: false,
    prefix: false,
    description: "تحديث بيانات المجموعات المخزنة في قاعدة البيانات",
    category: "المدير",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function ({ event, api, Threads }) { 
    const { threadID } = event;
    const { setData } = Threads;
    
    try {
        var inbox = await api.getThreadList(100, null, ['INBOX']);
        let groups = inbox.filter(group => group.isSubscribed && group.isGroup);
        const totalGroups = groups.length;

        if (totalGroups === 0) {
            return api.sendMessage("⚠️ | لا توجد مجموعات مفعلة لتحديث بياناتها.", threadID);
        }

        for (const groupInfo of groups) {
            console.log(`🔄 | تحديث بيانات المجموعة: ${groupInfo.threadID}`);
            var threadInfo = await api.getThreadInfo(groupInfo.threadID);
            await setData(groupInfo.threadID, { threadInfo });
        }

        console.log(`✅ | تم تحديث بيانات ${totalGroups} مجموعة.`);
        return api.sendMessage(`✅ | تم تحديث بيانات ${totalGroups} مجموعة بنجاح!`, threadID);
    } catch (error) {
        console.error("❌ | حدث خطأ أثناء تحديث بيانات المجموعات:", error);
        return api.sendMessage("❌ | حدث خطأ أثناء تحديث البيانات، يُرجى المحاولة لاحقًا.", threadID);
    }
};