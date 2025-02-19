module.exports.config = {
  name: "gemini",
  version: "1.1.1",
  permission: 0,
  credits: "ryuko - معرب ومحسن بواسطة OpenAI",
  description: "تواصل مع الذكاء الاصطناعي Gemini للإجابة عن أسئلتك",
  prefix: false,
  premium: false,
  category: "بدون بادئة",
  usage: "",
  cooldowns: 3,
  dependency: {
    "axios": ""
  }
};

const axios = require('axios');

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(" ").trim();
    
    if (!query) {
        return api.sendMessage("⚠️ يرجى كتابة السؤال الذي تريد طرحه.", event.threadID, event.messageID);
    }

    try {
        const res = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(query)}&uid=${event.senderID}`);
        
        if (!res.data || !res.data.response) {
            return api.sendMessage("❌ لم أتمكن من الحصول على رد من الخادم، حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
        }

        return api.sendMessage(res.data.response, event.threadID, event.messageID);

    } catch (error) {
        console.error("❌ خطأ أثناء جلب البيانات من API:", error.message);
        
        let errorMessage = "❌ حدث خطأ أثناء جلب الرد، حاول مرة أخرى لاحقًا.";
        
        if (error.response) {
            // الخطأ ناتج عن استجابة غير ناجحة من API
            errorMessage = `⚠️ خطأ من الخادم: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            // لم يتم تلقي أي استجابة من الخادم
            errorMessage = "⚠️ لم أتمكن من الاتصال بالخادم، تأكد من توفر الإنترنت.";
        }
        
        return api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
};