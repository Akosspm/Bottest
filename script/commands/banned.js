module.exports.config = {
	name: "banlist",
	version: "1.1.0",
	permission: 2,
	credits: "NTKhang (تحسينات وتعريب: ChatGPT)",
	prefix: false,
	premium: false,
	description: "عرض قائمة المستخدمين والمجموعات المحظورة",
	category: "الإدارة",
	usages: "[user/thread]",
	cooldowns: 5,
};

module.exports.run = async function({ api, args, Users, event, Threads }) {
	const { threadID, messageID } = event;

	if (!args[0] || (args[0] !== "user" && args[0] !== "thread")) {
		return api.sendMessage("⚠️ **الاستخدام الصحيح:**\n- `banlist user` لعرض المستخدمين المحظورين\n- `banlist thread` لعرض المجموعات المحظورة", threadID, messageID);
	}

	// 🔹 إذا كان الطلب هو عرض المستخدمين المحظورين
	if (args[0] === "user") {
		const userBanned = global.data.userBanned || [];
		let bannedUsersList = [];

		for (let userID of userBanned) {
			const userData = await Users.getData(userID);
			if (userData.banned) {
				bannedUsersList.push({ id: userID, name: userData.name });
			}
		}

		// 🔹 عرض القائمة برسالة مفصلة
		if (bannedUsersList.length === 0) {
			return api.sendMessage("✅ **لا يوجد أي مستخدم محظور حاليًا.**", threadID, messageID);
		}

		let msg = "🚫 **المستخدمون المحظورون من البوت:**\n\n";
		bannedUsersList.forEach((user, index) => {
			msg += `🔹 ${index + 1}. **الاسم:** ${user.name}\n🆔 **المعرف:** ${user.id}\n\n`;
		});

		return api.sendMessage(msg, threadID, messageID);
	}

	// 🔹 إذا كان الطلب هو عرض المجموعات المحظورة
	if (args[0] === "thread") {
		const threadBanned = global.data.threadBanned || [];
		let bannedThreadsList = [];

		for (let threadID of threadBanned) {
			const threadData = await Threads.getData(threadID);
			if (threadData.banned) {
				let threadInfo;
				try {
					threadInfo = await api.getThreadInfo(threadID);
				} catch (err) {
					threadInfo = { threadName: "غير معروف" }; // في حال فشل جلب الاسم
				}
				bannedThreadsList.push({ id: threadID, name: threadInfo.threadName });
			}
		}

		// 🔹 عرض القائمة برسالة مفصلة
		if (bannedThreadsList.length === 0) {
			return api.sendMessage("✅ **لا توجد أي مجموعة محظورة حاليًا.**", threadID, messageID);
		}

		let msg = "🚫 **المجموعات المحظورة من البوت:**\n\n";
		bannedThreadsList.forEach((group, index) => {
			msg += `🔹 ${index + 1}. **اسم المجموعة:** ${group.name}\n🆔 **معرف المجموعة:** ${group.id}\n\n`;
		});

		return api.sendMessage(msg, threadID, messageID);
	}
};