module.exports.config = {
    name: "بحث",
    version: "1.0.0",
    permission: 0,
    credits: "ryuko",
    prefix: false,
    premium: false,
    description: "البحث عن نتائج في جوجل",
    category: "بدون بادئة",
    usages: "بحث [النص]",
    cooldowns: 5,
    dependencies: {
        "request": "",
        "fs": ""
    }
};

module.exports.run = function({ api, event, args }) {
    let searchQuery = "";

    const imageRegex = /(https?:\/\/.*?\.(?:png|jpe?g|gif)(?:\?.*)?)/;
    
    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
        searchQuery = event.messageReply.attachments[0].url;
    } else {
        searchQuery = args.join(" ");
    }

    if (!searchQuery) {
        return api.sendMessage("❌ يرجى إدخال نص للبحث أو الرد بصورة.", event.threadID, event.messageID);
    }

    const searchUrl = imageRegex.test(searchQuery)
        ? `https://www.google.com/searchbyimage?image_url=${searchQuery}`
        : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    api.sendMessage(`🔍 إليك نتائج البحث:\n${searchUrl}`, event.threadID, event.messageID);
};