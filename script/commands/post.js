const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "منشور",
  version: "1.0.0",
  permission: 3,
  credits: "ryuko",
  prefix: true,
  premium: false,
  description: "إنشاء منشور جديد على حساب البوت",
  category: "المشغل",
  cooldowns: 5
};

module.exports.run = async ({ event, api }) => {
  const { threadID, messageID, senderID } = event;
  const معرف_فريد = الحصول_على_GUID();
  const بيانات_النموذج = {
    "input": {
      "composer_entry_point": "inline_composer",
      "composer_source_surface": "timeline",
      "idempotence_token": معرف_فريد + "_FEED",
      "source": "WWW",
      "attachments": [],
      "audience": {
        "privacy": {
          "allow": [],
          "base_state": "FRIENDS", // يمكن تغييره إلى EVERYONE أو SELF
          "deny": [],
          "tag_expansion_state": "UNSPECIFIED"
        }
      },
      "message": {
        "ranges": [],
        "text": ""
      },
      "actor_id": api.getCurrentUserID()
    }
  };

  return api.sendMessage(
    `اختر الجمهور الذي يمكنه رؤية المنشور:\n1. الجميع\n2. الأصدقاء\n3. أنا فقط`,
    threadID,
    (خطأ, معلومات) => {
      const بيانات_الرد = {
        name: this.config.name,
        messageID: معلومات.messageID,
        author: senderID,
        بيانات_النموذج,
        النوع: "اختيار_الجمهور"
      };
      global.client.handleReply.push(بيانات_الرد);
    },
    messageID
  );
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  const { النوع, author, بيانات_النموذج } = handleReply;
  if (event.senderID != author) return;

  const { threadID, messageID, senderID, attachments, body } = event;
  const معرف_البوت = api.getCurrentUserID();

  if (النوع == "اختيار_الجمهور") {
    if (!["1", "2", "3"].includes(body))
      return api.sendMessage("يرجى اختيار أحد الأرقام 1، 2، أو 3", threadID, messageID);

    بيانات_النموذج.input.audience.privacy.base_state = body == "1" ? "EVERYONE" : body == "2" ? "FRIENDS" : "SELF";

    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(
        "أرسل محتوى المنشور، أو رد بـ '0' إذا كنت لا تريد إضافة نص.",
        threadID,
        (خطأ, معلومات) => {
          const بيانات_الرد = {
            name: this.config.name,
            messageID: معلومات.messageID,
            author: senderID,
            بيانات_النموذج,
            النوع: "إضافة_المحتوى"
          };
          global.client.handleReply.push(بيانات_الرد);
        },
        messageID
      );
    });
  } else if (النوع == "إضافة_المحتوى") {
    if (body != "0") بيانات_النموذج.input.message.text = body;

    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(
        "أرسل صورة أو أكثر، أو رد بـ '0' إذا كنت لا تريد إضافة صور.",
        threadID,
        (خطأ, معلومات) => {
          const بيانات_الرد = {
            name: this.config.name,
            messageID: معلومات.messageID,
            author: senderID,
            بيانات_النموذج,
            النوع: "إضافة_الصور"
          };
          global.client.handleReply.push(بيانات_الرد);
        },
        messageID
      );
    });
  } else if (النوع == "إضافة_الصور") {
    if (body != "0") {
      const جميع_الملفات = [];
      const مسار_الصورة = __dirname + `/مؤقت/صورة_المنشور.png`;

      for (const مرفق of attachments) {
        if (مرفق.type != "photo") continue;
        const ملف_الصورة = (await axios.get(مرفق.url, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(مسار_الصورة, Buffer.from(ملف_الصورة));
        جميع_الملفات.push(fs.createReadStream(مسار_الصورة));
      }

      for (const ملف of جميع_الملفات) {
        بيانات_النموذج.input.attachments.push({ "photo": { "id": "رقم_عشوائي_لصورة" } });
      }
    }

    const form = {
      av: معرف_البوت,
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(بيانات_النموذج)
    };

    api.httpPost('https://www.facebook.com/api/graphql/', form, (خطأ, معلومات) => {
      api.unsendMessage(handleReply.messageID);
      try {
        if (خطأ) throw خطأ;
        if (typeof معلومات == "string") معلومات = JSON.parse(معلومات.replace("for (;;);", ""));
        const معرف_المنشور = معلومات.data.story_create.story.legacy_story_hideable_id;
        const رابط_المنشور = معلومات.data.story_create.story.url;
        if (!معرف_المنشور) throw معلومات.errors;

        return api.sendMessage(`تم نشر المنشور بنجاح!\nمعرف المنشور: ${معرف_المنشور}\nالرابط: ${رابط_المنشور}`, threadID, messageID);
      } catch (خطأ) {
        return api.sendMessage("فشل إنشاء المنشور، يرجى المحاولة لاحقًا.", threadID, messageID);
      }
    });
  }
};

function الحصول_على_GUID() {
  var طول_القسم = Date.now();
  var معرف = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((طول_القسم + Math.random() * 16) % 16);
    طول_القسم = Math.floor(طول_القسم / 16);
    return (c == "x" ? r : (r & 7) | 8).toString(16);
  });
  return معرف;
}