module.exports.config = {
  name: "كود",
  version: "1.0.1",
  permission: 3,
  credits: "D-JUKIE",
  description: "تطبيق الكود من buildtooldev و pastebin",
  prefix: true,
  premium: false,
  category: "المشغل",
  usages: "[رد على رابط أو اسم الملف]",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  const request = require('request');
  const cheerio = require('cheerio');
  const { join, resolve } = require("path");
  const { senderID, threadID, messageID, messageReply, type } = event;

  var name = args[0];
  if (type == "message_reply") {
    var text = messageReply.body;
  }

  if (!text && !name) 
    return api.sendMessage('⚠️ **يرجى الرد على رابط يحتوي على كود** أو كتابة اسم الملف لحفظ الكود في Pastebin!', threadID, messageID);

  if (!text && name) {
    var data = fs.readFile(
      `${__dirname}/${args[0]}.js`,
      "utf-8",
      async (err, data) => {
        if (err) return api.sendMessage(`❌ **الأمر "${args[0]}" غير موجود!**`, threadID, messageID);
        const { PasteClient } = require('pastebin-api');
        const client = new PasteClient("aeGtA7rxefvTnR3AKmYwG-jxMo598whT");

        async function pastepin(name) {
          const url = await client.createPaste({
            code: data,
            expireDate: 'N',
            format: "javascript",
            name: name,
            publicity: 1
          });
          var id = url.split('/')[3];
          return 'https://pastebin.com/raw/' + id;
        }

        var link = await pastepin(args[1] || 'بدون_اسم');
        return api.sendMessage(`✅ **تم حفظ الكود في Pastebin**:\n${link}`, threadID, messageID);
      }
    );
    return;
  }

  var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  var url = text.match(urlR);

  if (url[0].includes('pastebin')) {
    axios.get(url[0]).then(i => {
      var data = i.data;
      fs.writeFile(
        `${__dirname}/${args[0]}.js`,
        data,
        "utf-8",
        function(err) {
          if (err) return api.sendMessage(`❌ **حدث خطأ أثناء تطبيق الكود "${args[0]}.js"**`, threadID, messageID);
          api.sendMessage(`✅ **تم تطبيق الكود "${args[0]}.js"**، استخدم الأمر **تحميل** لتفعيله!`, threadID, messageID);
        }
      );
    });
  }

  if (url[0].includes('buildtool') || url[0].includes('tinyurl.com')) {
    const options = {
      method: 'GET',
      url: messageReply.body
    };

    request(options, function(error, response, body) {
      if (error) return api.sendMessage('⚠️ **يرجى الرد فقط على رابط الكود (يجب أن يحتوي الرد على الرابط فقط)**', threadID, messageID);
      const load = cheerio.load(body);
      load('.language-js').each((index, el) => {
        if (index !== 0) return;
        var code = el.children[0].data;
        fs.writeFile(`${__dirname}/${args[0]}.js`, code, "utf-8",
          function(err) {
            if (err) return api.sendMessage(`❌ **حدث خطأ أثناء تطبيق الكود "${args[0]}.js"**`, threadID, messageID);
            return api.sendMessage(`✅ **تم إضافة الكود "${args[0]}.js"**، استخدم الأمر **تحميل** لتفعيله!`, threadID, messageID);
          }
        );
      });
    });
    return;
  }

  if (url[0].includes('drive.google')) {
    var id = url[0].match(/[-\w]{25,}/);
    const path = resolve(__dirname, `${args[0]}.js`);
    try {
      await utils.downloadFile(`https://drive.google.com/u/0/uc?id=${id}&export=download`, path);
      return api.sendMessage(`✅ **تم تحميل الكود "${args[0]}.js" بنجاح**! إذا واجهت مشاكل، جرب تحويل الملف إلى **txt** في Google Drive.`, threadID, messageID);
    }
    catch (e) {
      return api.sendMessage(`❌ **حدث خطأ أثناء تطبيق الكود "${args[0]}.js"**`, threadID, messageID);
    }
  }
};