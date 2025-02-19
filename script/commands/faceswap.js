const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "تبديل_الوجوه",
    version: "1.1.0",
    permission: 0,
    credits: "churchill - معرب بواسطة OpenAI",
    description: "تبديل الوجوه بين صورتين",
    prefix: false,
    premium: false,
    category: "بدون بادئة",
    usages: "قم بالرد على صورتين بالأمر لتنفيذ التبديل.",
    cooldowns: 3,
    dependencies: {
        "axios": ""
    }
};

module.exports.run = async function({ api, event }) {
    if (!event.messageReply?.attachments || event.messageReply.attachments.length < 2) {
        return api.sendMessage('❌ يجب الرد على صورتين مرفقتين لاستخدام هذا الأمر.', event.threadID, event.messageID);
    }

    const attachments = event.messageReply.attachments;
    if (!attachments.every(att => att.type === 'photo')) {
        return api.sendMessage('❌ يجب أن تكون كلا المرفقات صورًا.', event.threadID, event.messageID);
    }

    const img1 = attachments[0].url;
    const img2 = attachments[1].url;

    const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap?swapUrl=${encodeURIComponent(img1)}&baseUrl=${encodeURIComponent(img2)}`;

    api.sendMessage('⏳ جارٍ تبديل الوجوه... يرجى الانتظار.', event.threadID, event.messageID);

    try {
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const filePath = path.join(cacheDir, `faceswap_${Date.now()}.jpg`);
        await fs.promises.writeFile(filePath, response.data);

        await api.sendMessage({
            body: '✅ تم تبديل الوجوه بنجاح!',
            attachment: fs.createReadStream(filePath),
        }, event.threadID, event.messageID);

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('❌ خطأ أثناء تبديل الوجوه:', error.message);
        api.sendMessage('❌ حدث خطأ أثناء تنفيذ التبديل. حاول مرة أخرى لاحقًا.', event.threadID, event.messageID);
    }
};