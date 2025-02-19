module.exports.config = {
  name: "بحث_صورة",
  version: "1.0.0",
  permission: 0,
  credits: "ryuko",
  premium: false,
  prefix: true,
  description: "البحث عن صورة من الإنترنت",
  category: "مع البادئة",
  usages: "بحث_صورة [الكلمة المفتاحية]",
  cooldowns: 60,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "googlethis": "",
    "cloudscraper": ""
  }
};

module.exports.run = async ({ event, api, args }) => {
  const axios = global.nodemodule['axios'];
  const google = global.nodemodule["googlethis"];
  const cloudscraper = global.nodemodule["cloudscraper"];
  const fs = global.nodemodule["fs"];

  let query = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
  
  if (!query) {
    return api.sendMessage("❌ | يرجى إدخال كلمة للبحث عن صورة.", event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 | جاري البحث عن: ${query}...`, event.threadID, event.messageID);
  
  let result = await google.image(query, { safe: false });

  if (result.length === 0) {
    return api.sendMessage(`⚠️ | لم يتم العثور على أي نتائج لبحثك.`, event.threadID, event.messageID);
  }

  let streams = [];
  let counter = 0;

  for (let image of result) {
    if (counter >= 6) break; // تحديد حد 6 صور فقط

    let url = image.url;
    if (!url.endsWith(".jpg") && !url.endsWith(".png")) continue;

    let path = __dirname + `/cache/search-image-${counter}.jpg`;
    let hasError = false;
    
    await cloudscraper.get({ uri: url, encoding: null })
      .then((buffer) => fs.writeFileSync(path, buffer))
      .catch(() => hasError = true);
      
    if (hasError) continue;

    streams.push(fs.createReadStream(path).on("end", async () => {
      if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
          if (err) console.log(err);
        });
      }
    }));
    
    counter += 1;
  }

  if (streams.length === 0) {
    return api.sendMessage("❌ | لم يتم العثور على صور متوافقة.", event.threadID, event.messageID);
  }

  let msg = {
    body: `📸 | نتائج البحث عن: ${query}\n\n✅ تم العثور على: ${result.length} صورة\n📌 عرض 6 صور فقط.`,
    attachment: streams
  };

  api.sendMessage(msg, event.threadID, event.messageID);
};