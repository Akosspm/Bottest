module.exports.config = {
	name: "المجموعة",
	version: "0.0.3",
	permission: 2,
	credits: "ryuko",
	prefix: true,
  	premium: false,
	description: "حظر أو إلغاء حظر مجموعة",
	category: "الإدارة",
	usages: "[حظر/إلغاء/بحث] [معرّف المجموعة أو نص البحث]",
	cooldowns: 5
};

module.exports.handleReaction = async ({ event, api, Threads, handleReaction, botid }) => {
	if (parseInt(event.userID) !== parseInt(handleReaction.author)) return;
	switch (handleReaction.type) {
		case "ban": {
			const data = (await Threads.getData(handleReaction.target)).data || {};
			data.banned = 1;
			await Threads.setData(handleReaction.target, { data });
			global.data.threadBanned.set(parseInt(handleReaction.target), 1);
			api.sendMessage(`✅ تم حظر المجموعة بنجاح!\n🆔 معرف المجموعة: ${handleReaction.target}`, event.threadID, () => api.unsendMessage(handleReaction.messageID));
			break;
		}
		case "unban": {
			const data = (await Threads.getData(handleReaction.target)).data || {};
			data.banned = 0;
			await Threads.setData(handleReaction.target, { data });
			global.data.threadBanned.delete(parseInt(handleReaction.target), 1);
			api.sendMessage(`✅ تم إلغاء حظر المجموعة!\n🆔 معرف المجموعة: ${handleReaction.target}`, event.threadID, () => api.unsendMessage(handleReaction.messageID));
			break;
		}
		default:
			break;
	}
}

module.exports.run = async ({ event, api, args, Threads, botid }) => {
    let content = args.slice(1, args.length);
	switch (args[0]) {
		case "حظر": {
			if (content.length == 0) return api.sendMessage("❌ يجب عليك إدخال معرف المجموعة التي تريد حظرها.", event.threadID);
			for (let idThread of content) {
				idThread = parseInt(idThread);
				if (isNaN(idThread)) return api.sendMessage("⚠️ هذا ليس معرف مجموعة صحيح!", event.threadID);
				let dataThread = (await Threads.getData(idThread.toString()));
				if (!dataThread) return api.sendMessage(`❌ المجموعة غير موجودة في قاعدة البيانات.\n🆔 معرف المجموعة: ${idThread}`, event.threadID);
				if (dataThread.banned) return api.sendMessage(`⚠️ المجموعة محظورة بالفعل!\n🆔 معرف المجموعة: ${idThread}`, event.threadID);
				return api.sendMessage(`⚠️ هل تريد حقًا حظر هذه المجموعة؟\n🆔 معرف المجموعة: ${idThread}\n\nيرجى التفاعل مع هذه الرسالة للتأكيد ✅`, event.threadID, (error, info) => {
					global.client.handleReaction.get(botid).push({
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID,
						type: "ban",
						target: idThread
					});
				})
			}
			break;
		}
		case "إلغاء": {
			if (content.length == 0) return api.sendMessage("❌ يجب عليك إدخال معرف المجموعة التي تريد إلغاء حظرها.", event.threadID);
			for (let idThread of content) {
				idThread = parseInt(idThread);
				if (isNaN(idThread)) return api.sendMessage("⚠️ هذا ليس معرف مجموعة صحيح!", event.threadID);
				let dataThread = (await Threads.getData(idThread)).data;
				if (!dataThread) return api.sendMessage(`❌ المجموعة غير موجودة في قاعدة البيانات.\n🆔 معرف المجموعة: ${idThread}`, event.threadID);
				if (dataThread.banned != 1) return api.sendMessage(`⚠️ هذه المجموعة لم يتم حظرها من قبل.\n🆔 معرف المجموعة: ${idThread}`, event.threadID);
				return api.sendMessage(`⚠️ هل تريد إلغاء حظر هذه المجموعة؟\n🆔 معرف المجموعة: ${idThread}\n\nيرجى التفاعل مع هذه الرسالة للتأكيد ✅`, event.threadID, (error, info) => {
					global.client.handleReaction.get(botid).push({
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID,
						type: "unban",
						target: idThread
					});
				})
			}
			break;
		}
		case "بحث": {
			let searchQuery = content.join(" ");
			let getThreads = (await Threads.getAll(['threadID', 'name'])).filter(item => !!item.name);
			let matchThreads = [], resultMessage = '', count = 0;
			getThreads.forEach(i => {
				if (i.name.toLowerCase().includes(searchQuery.toLowerCase())) {
					matchThreads.push({
						name: i.name,
						id: i.threadID
					});
				}
			});
			matchThreads.forEach(i => resultMessage += `\n${++count}. ${i.name} - 🆔 ${i.id}`);
			(matchThreads.length > 0) 
				? api.sendMessage(`🔍 تم العثور على النتائج المطابقة:\n${resultMessage}`, event.threadID) 
				: api.sendMessage("❌ لم يتم العثور على أي نتائج بناءً على بحثك.", event.threadID);
			break;
		}
		default: {
			return global.utils.throwError(this.config.name, event.threadID, event.messageID);
		}
	}
}