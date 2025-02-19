module.exports.config = {
    name: "الأصدقاء",
    version: "1.0.0",
    permission: 3,
    credits: "ryuko - معرب ومحسن بواسطة OpenAI",
    description: "عرض قائمة الأصدقاء وإمكانية حذفهم",
    prefix: true,
    premium: false,
    category: "المشرف",
    usages: "الأصدقاء",
    cooldowns: 5,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID } = event;
    if (parseInt(senderID) !== parseInt(handleReply.author)) return;

    if (handleReply.type === "reply") {
        let msg = "";
        const inputNumbers = event.body.split(/[ ,]+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0 && n <= handleReply.nameUser.length);

        if (inputNumbers.length === 0) {
            return api.sendMessage("❌ لم يتم تحديد أرقام صحيحة، يرجى المحاولة مرة أخرى.", threadID, messageID);
        }

        for (let num of inputNumbers) {
            let name = handleReply.nameUser[num - 1];
            let urlUser = handleReply.urlUser[num - 1];
            let uidUser = handleReply.uidUser[num - 1];

            try {
                await api.unfriend(uidUser);
                msg += `✅ تم حذف الصديق: ${name}\n🔗 رابط الحساب: ${urlUser}\n\n`;
            } catch (error) {
                msg += `❌ فشل في حذف ${name}، قد يكون هناك مشكلة في الصلاحيات.\n`;
            }
        }

        return api.sendMessage(`📌 تم تحديث قائمة الأصدقاء:\n\n${msg}`, threadID, () => api.unsendMessage(handleReply.messageID));
    }
};

module.exports.run = async function ({ event, api, args }) {
    const { threadID, messageID, senderID } = event;

    try {
        let friendsList = await api.getFriendsList();
        let totalFriends = friendsList.length;
        let page = parseInt(args[0]) || 1;
        let limit = 10;
        let totalPages = Math.ceil(totalFriends / limit);
        
        if (page < 1 || page > totalPages) {
            return api.sendMessage(`❌ رقم الصفحة غير صحيح. يرجى اختيار رقم بين 1 و ${totalPages}.`, threadID, messageID);
        }

        let start = (page - 1) * limit;
        let end = start + limit;
        let displayedFriends = friendsList.slice(start, end);

        let msg = `📋 لديك ${totalFriends} صديق/ة\n\n`;

        let nameUser = [], urlUser = [], uidUser = [];
        displayedFriends.forEach((friend, index) => {
            msg += `${start + index + 1}. 👤 الاسم: ${friend.fullName || "غير معروف"}\n🆔 ID: ${friend.userID}\n📌 رابط الحساب: ${friend.profileUrl}\n\n`;
            nameUser.push(friend.fullName || "غير معروف");
            urlUser.push(friend.profileUrl);
            uidUser.push(friend.userID);
        });

        msg += `📄 الصفحة ${page} من ${totalPages}\n🔹 استخدم: ${global.config.PREFIX}الأصدقاء [رقم الصفحة] للانتقال بين الصفحات.\n`;
        msg += `📌 للقيام بحذف صديق، قم بالرد على هذه الرسالة برقم الصديق أو عدة أرقام مفصولة بفاصلة (مثال: 1, 2, 3).`;

        return api.sendMessage(msg, threadID, (err, data) => {
            if (!err) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    author: senderID,
                    messageID: data.messageID,
                    nameUser,
                    urlUser,
                    uidUser,
                    type: 'reply'
                });
            }
        });
    } catch (error) {
        console.error("❌ خطأ أثناء جلب قائمة الأصدقاء:", error);
        return api.sendMessage("❌ حدث خطأ أثناء تحميل قائمة الأصدقاء. حاول مرة أخرى لاحقًا.", threadID, messageID);
    }
};