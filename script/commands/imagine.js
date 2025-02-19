const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "تخيل",
  version: "1.0.0",
  permission: 0,
  credits: "Jonell Magallanes (تعريب وتحسين: مطور مجهول)",
  description: "يُنشئ صورة بالذكاء الاصطناعي بناءً على وصفك.",
  prefix: false,
  premium: false,
  category: "الوسائط",
  usages: "[الوصف]",
  cooldowns: 9
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("❌ | يرجى إدخال وصف للصورة التي تريد إنشاؤها.", threadID, messageID);
  }

  api.setMessageReaction("🎨", messageID, () => {}, true);

  const imagePath = path.join(__dirname, 'cache', 'imagine.png');
  if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });

  try {
    const response = await axios.get(`https://ccprojectapis.ddns.net/api/flux?prompt=${encodeURIComponent(prompt)}`, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(imagePath, response.data);

    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage({
      body: `✨ | تم إنشاء الصورة بناءً على وصفك: "${prompt}"`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, messageID);

  } catch (error) {
    console.error("خطأ أثناء إنشاء الصورة:", error);
    api.sendMessage(`❌ | حدث خطأ أثناء إنشاء الصورة: ${error.message}`, threadID, messageID);
  }
};