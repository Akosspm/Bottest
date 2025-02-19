const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "إشعار_المشغل", // تم التعريب
    version: "1.0.0",
    permission: 3,
    credits: "ryuko (تعريب وتحسين: مطور مجهول)",
    description: "إرسال إشعارات من المشغل إلى جميع المجموعات",
    prefix: true,
    premium: false,
    category: "المشغل",
    usages: "[رسالة]",
    cooldowns: 5,
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for (let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response = await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`;
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch (e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads, botid }) {
    const moment = require("moment-timezone");
    let الوقت = moment.tz("Africa/Algiers").format("DD/MM/YYYY - HH:mm:ss"); // توقيت الجزائر
    const { threadID, messageID, senderID, body } = event;
    let name = await Users.getNameUser(senderID);

    switch (handleReply.type) {
        case "sendnoti": {
            let text = `${name} رد على إعلانك\n\n⏰ الوقت: ${الوقت}\n💬 الرد: ${body}\n\n📌 المجموعة: ${(await Threads.getInfo(threadID)).threadName || "غير معروف"}`;
            if (event.attachments.length > 0) {
                text = await getAtm(event.attachments, `${body}\n\n${text}`);
            }
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                });
            });
            break;
        }
        case "reply": {
            let text = `🔹 المشغل ${name} رد عليك\n\n💬 الرد: ${body}\n\n🔁 رد على هذه الرسالة للمتابعة.`;
            if (event.attachments.length > 0) {
                text = await getAtm(event.attachments, `${body}\n\n${text}`);
            }
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "sendnoti",
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
    let الوقت = moment.tz("Africa/Algiers").format("DD/MM/YYYY - HH:mm:ss"); // توقيت الجزائر
    const { threadID, messageID, senderID, messageReply } = event;
    const botID = await api.getCurrentUserID();
    const botThread = global.data.allThreadID.get(botID);
    if (!args[0]) return api.sendMessage("⚠️ | يرجى إدخال رسالة.", threadID);

    let allThread = botThread || [];
    let تم_الإرسال = 0, لم_يتم_الإرسال = 0;
    let text = `📢 إشعار من مشغلي البوت\n\n⏰ الوقت: ${الوقت}\n👤 المشغل: ${await Users.getNameUser(senderID)}\n💬 الرسالة: ${args.join(" ")}\n\n🔁 رد على هذه الرسالة للرد على المشغل.`;

    if (event.type == "message_reply") {
        text = await getAtm(messageReply.attachments, `📢 إشعار من مشغلي البوت\n\n⏰ الوقت: ${الوقت}\n👤 المشغل: ${await Users.getNameUser(senderID)}\n💬 الرسالة: ${args.join(" ")}\n\n🔁 رد على هذه الرسالة للرد على المشغل.`);
    }

    await new Promise(resolve => {
        allThread.forEach((each) => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if (err) {
                        لم_يتم_الإرسال++;
                    } else {
                        تم_الإرسال++;
                        atmDir.forEach(each => fs.unlinkSync(each))
                        atmDir = [];
                        global.client.handleReply.get(botid).push({
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            messID: messageID,
                            threadID
                        });
                        resolve();
                    }
                })
            } catch (e) { console.log(e) }
        })
    })
    api.sendMessage(`✅ | تم الإرسال إلى ${تم_الإرسال} مجموعة، ولم يتم الإرسال إلى ${لم_يتم_الإرسال} مجموعة.`, threadID);
}