module.exports.config = {
    name: "قل",
    version: "1.0.0",
    permission: 0,
    credits: "ryuko",
    premium: false,
    description: "تحويل النص إلى صوت",
    prefix: true,
    category: "مع البادئة",
    usages: "تحويل النص إلى رسالة صوتية",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
        const { resolve } = global.nodemodule["path"];

        var content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
        if (!content) return api.sendMessage("⚠️ | يُرجى إدخال النص الذي تريد تحويله إلى صوت.", event.threadID, event.messageID);

        var languageToSay = (["ru", "en", "ko", "ja", "tl"].some(item => content.indexOf(item) == 0)) 
            ? content.slice(0, content.indexOf(" ")) 
            : global.config.language;

        var msg = (languageToSay != global.config.language) ? content.slice(3, content.length) : content;
        const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);

        await global.utils.downloadFile(
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`,
            path
        );

        return api.sendMessage({
            body: "🔊 | إليك الصوت الذي طلبته:",
            attachment: createReadStream(path)
        }, event.threadID, () => unlinkSync(path), event.messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب، يُرجى المحاولة لاحقًا.", event.threadID, event.messageID);
    }
};