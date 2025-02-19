module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  permission: "0",
  credits: "Kim Joseph DG Bien", // REMAKE BY JONELL
  description: "البحث عن فيديوهات تيك توك",
  prefix: false,
  premium: false,
  category: "بدون بادئة",
  usage: "[tiktok <نص البحث>]",
  cooldowns: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      return api.sendMessage("❗ الاستخدام: tiktok <نص البحث>", event.threadID);
    }

    const loadingMessage = await api.sendMessage("🔍 جاري البحث، يرجى الانتظار...", event.threadID);

    const response = await axios.get(`https://ccprojectapis.ddns.net/api/tiktok/searchvideo?keywords=${encodeURIComponent(searchQuery)}`);
    const videos = response.data.data.videos;

    if (!videos || videos.length === 0) {
      return api.sendMessage("❌ لم يتم العثور على أي فيديوهات لهذا البحث.", event.threadID);
    }

    const videoData = videos[0];
    const videoUrl = videoData.play;
    const message = `🎵 نتائج البحث عن تيك توك:\n\n👤 المنشئ: ${videoData.author.nickname}\n🔹 اسم المستخدم: ${videoData.author.unique_id}\n\n📌 العنوان: ${videoData.title}`;

    api.unsendMessage(loadingMessage.messageID);
    
    const filePath = path.join(__dirname, `/cache/tiktok_video.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoResponse = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        { body: message, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });

    writer.on('error', () => {
      api.sendMessage("❌ حدث خطأ أثناء تحميل الفيديو، يرجى المحاولة لاحقًا.", event.threadID);
    });

  } catch (error) {
    api.sendMessage("⚠️ حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقًا.", event.threadID);
  }
};