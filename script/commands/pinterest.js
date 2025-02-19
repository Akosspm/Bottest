const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports.config = {
  name: "بحث_صور",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes (تعريب وتحسين: مطور مجهول)",
  description: "البحث عن الصور في Pinterest",
  premium: false,
  prefix: true,
  category: "الوسائط",
  usages: "[الكلمة المفتاحية -عدد الصور]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID } = event;

  try {
    const query = args.join(" ");

    if (!query.includes("-")) {
      return api.sendMessage(
        `❌ | يرجى إدخال الكلمة المفتاحية وعدد الصور (1-99).\n📌 | مثال: ${prefix}بحث_صور طبيعة -5`,
        threadID,
        messageID
      );
    }

    const loadingMessage = await api.sendMessage("⏳ | جاري البحث، يرجى الانتظار...", threadID, messageID);
    const searchTerm = query.split("-")[0].trim();
    let imageCount = parseInt(query.split("-").pop().trim()) || 5;

    if (isNaN(imageCount) || imageCount < 1 || imageCount > 99) {
      return api.sendMessage(
        "⚠️ | يرجى إدخال رقم صحيح بين (1-99). مثال: طبيعة -5",
        threadID,
        messageID
      );
    }

    const apiUrl = `https://ccprojectapis.ddns.net/api/pin?title=${searchTerm}&count=${imageCount}`;
    console.log(`🔍 | جاري جلب البيانات من: ${apiUrl}`);

    const response = await axios.get(apiUrl);
    const images = response.data.data;

    if (!images || images.length === 0) {
      return api.sendMessage(
        `❌ | لم يتم العثور على نتائج للبحث: "${searchTerm}". حاول استخدام كلمة مفتاحية أخرى.`,
        threadID,
        messageID
      );
    }

    const imageFiles = [];
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    for (let i = 0; i < Math.min(imageCount, images.length); i++) {
      console.log(`📷 | تحميل الصورة ${i + 1}: ${images[i]}`);
      const imageResponse = await axios.get(images[i], { responseType: "arraybuffer" });
      const imagePath = path.join(cacheDir, `${i + 1}.jpg`);
      await fs.outputFile(imagePath, imageResponse.data);
      imageFiles.push(fs.createReadStream(imagePath));
    }

    await api.sendMessage({
      body: `✅ | تم العثور على ${imageFiles.length} صورة لكلمة البحث: "${searchTerm}".`,
      attachment: imageFiles,
    }, threadID, messageID);

    api.unsendMessage(loadingMessage.messageID);
    console.log(`✅ | تم إرسال الصور بنجاح إلى المجموعة ${threadID}`);

    // حذف الملفات المؤقتة
    setTimeout(() => {
      fs.emptyDirSync(cacheDir);
      console.log("🧹 | تم تنظيف المجلد المؤقت.");
    }, 5000);

  } catch (error) {
    console.error("❌ | خطأ أثناء جلب الصور من Pinterest:", error);
    return api.sendMessage(
      "⚠️ | حدث خطأ أثناء البحث عن الصور. يرجى المحاولة لاحقًا.",
      threadID,
      messageID
    );
  }
};