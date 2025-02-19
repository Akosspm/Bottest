const axios = require('axios');

module.exports.config = {
  name: "رفع",
  version: "1.0.0",
  permission: 0,
  credits: "ryuko (تعريب وتحسين: مطور مجهول)",
  description: "رفع صورة إلى Imgur والحصول على رابط مباشر.",
  prefix: false,
  premium: false,
  category: "بدون بادئة",
  usages: "[رد على صورة]",
  cooldowns: 9
};

module.exports.run = async function({ api, event }) {
    try {
        if (!event.messageReply || !event.messageReply.attachments[0]) {
            return api.sendMessage(`❌ | يرجى الرد على صورة تريد رفعها إلى Imgur.`, event.threadID, event.messageID);
        }

        const attachmentUrl = event.messageReply.attachments[0].url;
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const res = await axios.get(`https://kaiz-apis.gleeze.com/api/imgur?url=${encodeURIComponent(attachmentUrl)}`);
        const uploadedImageUrl = res.data.uploaded.image;

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return api.sendMessage(`✅ | تم رفع الصورة بنجاح! 🌟\n🔗 الرابط: ${uploadedImageUrl}`, event.threadID, event.messageID);
        
    } catch (error) {
        console.error("خطأ أثناء رفع الصورة:", error);
        return api.sendMessage(`❌ | حدث خطأ غير متوقع أثناء محاولة رفع الصورة.`, event.threadID, event.messageID);
    }
};