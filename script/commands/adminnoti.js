const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "إشعار_الإدارة",
    version: "1.0.0",
    permission: 2,
    credits: "ryuko",
    description: "إرسال إشعار إلى جميع المجموعات",
    prefix: true,
    premium: false,
    category: "الإدارة",
    usages: "إشعار_الإدارة [رسالة]",
    cooldowns: 5,
}

let ملفات_مؤقتة = [];

const تحميل_المرفقات = (المرفقات, النص) => new Promise(async (resolve) => {
    let رسالة = {}, مرفقات = [];
    رسالة.body = النص;
    for(let مرفق من المرفقات) {
        await new Promise(async (resolve) => {
            try {
                let استجابة = await request.get(مرفق.url),
                    اسم_المسار = استجابة.uri.pathname,
                    امتداد = اسم_المسار.substring(اسم_المسار.lastIndexOf(".") + 1),
                    المسار = __dirname + `/cache/${مرفق.filename}.${امتداد}`;
                استجابة
                    .pipe(fs.createWriteStreamالمسار))
                    .on("close", () => {
                        مرفقات.push(fs.createReadStream(المسار));
                        ملفات_مؤقتة.push(المسار);
                        resolve();
                    });
            } catch(e) { console.log(e); }
        });
    }
    رسالة.attachment = مرفقات;
    resolve(رسالة);
});

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads, getText, botid }) {
    const moment = require("moment-timezone");
    var الوقت = moment.tz("Africa/Algiers").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, body } = event;
    let اسم_المرسل = await Users.getNameUser(senderID);

    switch (handleReply.type) {
        case "إرسال_إشعار": {
            let نص_الإجابة = `${اسم_المرسل} رد على إشعارك\n\nالوقت: ${الوقت}\nالرد: ${body}\n\nمن المجموعة: ${(await Threads.getInfo(threadID)).threadName || "غير معروف"}`;
            if(event.attachments.length > 0) 
                نص_الإجابة = await تحميل_المرفقات(event.attachments, `${body}\n${اسم_المرسل} رد على إشعارك\n\nالوقت: ${الوقت}\n\nمن المجموعة: ${(await Threads.getInfo(threadID)).threadName || "غير معروف"}`);

            api.sendMessage(نص_الإجابة, handleReply.threadID, (err, info) => {
                ملفات_مؤقتة.forEach(ملف => fs.unlinkSync(ملف));
                ملفات_مؤقتة = [];
                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "رد",
                    messageID: info.messageID,
                    threadID
                });
            });
            break;
        }

        case "رد": {
            let نص_الرد = `🔔 **رد المشرف**:\n\n${body}\n\n↪️ **يمكنك الرد على هذه الرسالة للمتابعة.**`;
            if(event.attachments.length > 0) 
                نص_الرد = await تحميل_المرفقات(event.attachments, `${body}\n🔔 **رد المشرف**\n↪️ **يمكنك الرد على هذه الرسالة للمتابعة.**`);

            api.sendMessage(نص_الرد, handleReply.threadID, (err, info) => {
                ملفات_مؤقتة.forEach(ملف => fs.unlinkSync(ملف));
                ملفات_مؤقتة = [];
                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "إرسال_إشعار",
                    messageID: info.messageID,
                    threadID
                });
            }, handleReply.messID);
            break;
        }
    }
}

module.exports.run = async function ({ api, event, botid, args, Users }) {
    const moment = require("moment-timezone");
    var الوقت = moment.tz("Africa/Algiers").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, messageReply } = event;
    const botID = await api.getCurrentUserID();
    const جميع_المجموعات = global.data.allThreadID.get(botID);

    if (!args[0]) return api.sendMessage("⚠️ **يرجى إدخال رسالة للإرسال!**", threadID);

    let تم_الإرسال = 0, فشل_الإرسال = 0;
    let نص_الإشعار = `📢 **إشعار من الإدارة**\n\n🕒 **الوقت**: ${الوقت}\n👤 **المشرف**: ${await Users.getNameUser(senderID)}\n💬 **الرسالة**: ${args.join(" ")}\n\n↪️ **يمكنك الرد على هذه الرسالة للمتابعة.**`;
    if(event.type == "message_reply") 
        نص_الإشعار = await تحميل_المرفقات(messageReply.attachments, `📢 **إشعار من الإدارة**\n🕒 **الوقت**: ${الوقت}\n👤 **المشرف**: ${await Users.getNameUser(senderID)}\n💬 **الرسالة**: ${args.join(" ")}\n\n↪️ **يمكنك الرد على هذه الرسالة للمتابعة.**`);

    await new Promise(resolve => {
        جميع_المجموعات.forEach((مجموعة) => {
            try {
                api.sendMessage(نص_الإشعار, مجموعة, (err, info) => {
                    if(err) { 
                        فشل_الإرسال++; 
                    } else {
                        تم_الإرسال++;
                        ملفات_مؤقتة.forEach(ملف => fs.unlinkSync(ملف));
                        ملفات_مؤقتة = [];
                        global.client.handleReply.get(botid).push({
                            name: this.config.name,
                            type: "إرسال_إشعار",
                            messageID: info.messageID,
                            threadID: مجموعة
                        });
                        resolve();
                    }
                });
            } catch(e) { console.log(e) }
        });
    });

    api.sendMessage(`✅ **تم الإرسال إلى ${تم_الإرسال} مجموعة، وفشل الإرسال إلى ${فشل_الإرسال} مجموعة.**`, threadID);
}