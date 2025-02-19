module.exports.config = {
    name: "تحديث_بيانات_الأعضاء",
    version: "1.0",
    permission: 2,
    credits: "ryuko",
    prefix: false,
    premium: false,
    description: "تحديث بيانات جميع الأعضاء في المجموعة",
    category: "المدير",
    usages: "",
    cooldowns: 5,
};

module.exports.run = async function ({ Users, event, api, Threads }) { 
    const { threadID } = event;
    const { setData } = Users;
    
    try {
        var { participantIDs } = await Threads.getInfo(threadID) || await api.getThreadInfo(threadID);
        const totalUsers = participantIDs.length;

        if (totalUsers === 0) {
            return api.sendMessage("⚠️ | لا يوجد أعضاء في هذه المجموعة لتحديث بياناتهم.", threadID);
        }

        for (const id of participantIDs) {
            let userInfo = await api.getUserInfo(id);
            let userName = userInfo[id]?.name || "مستخدم مجهول";

            console.log(`🔄 | تحديث بيانات المستخدم: ${id} - ${userName}`);
            await setData(id, { name: userName, data: {} });
        }

        console.log(`✅ | تم تحديث بيانات ${totalUsers} عضوًا في المجموعة.`);
        return api.sendMessage(`✅ | تم تحديث بيانات ${totalUsers} عضوًا في هذه المجموعة بنجاح!`, threadID);
    } catch (error) {
        console.error("❌ | حدث خطأ أثناء تحديث بيانات الأعضاء:", error);
        return api.sendMessage("❌ | حدث خطأ أثناء تحديث البيانات، يُرجى المحاولة لاحقًا.", threadID);
    }
};