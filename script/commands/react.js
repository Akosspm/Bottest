module.exports.config = {
    name: "تفاعل",
    version: "1.0.0",
    permission: 2,
    credits: "ryuko",
    description: "التفاعل مع المنشورات بواسطة المعرف",
    prefix: true,
    premium: false,
    category: "الإدارة",
    usages: "[معرف المنشور] <نوع التفاعل>: (إلغاء/إعجاب/حب/قلب/هاها/واو/حزين/غاضب)",
    cooldowns: 1
};

module.exports.run = async ({ api, event, args }) => {
    const allType = ["إلغاء", "إعجاب", "حب", "قلب", "هاها", "واو", "حزين", "غاضب"];
    const engType = ["unlike", "like", "love", "heart", "haha", "wow", "sad", "angry"];
    
    const postID = args[0];
    const type = args[1];

    if (!postID || !type) 
        return api.sendMessage("⚠️ | يرجى إدخال معرف المنشور ونوع التفاعل المطلوب.", event.threadID, event.messageID);
    
    const index = allType.indexOf(type);
    if (index === -1) 
        return api.sendMessage(`🚫 | نوع التفاعل غير صالح، يرجى اختيار أحد الأنواع التالية:\n${allType.join(" / ")}`, event.threadID, event.messageID);
    
    api.setPostReaction(Number(postID), engType[index], (err) => {
        if (err) 
            return api.sendMessage("❌ | حدث خطأ، يرجى التحقق من معرف المنشور والمحاولة مرة أخرى.", event.threadID, event.messageID);
        
        api.sendMessage(`✅ | تم إرسال تفاعل "${type}" على المنشور بمعرف: ${postID}`, event.threadID, event.messageID);
    });
};