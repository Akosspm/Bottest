module.exports.config = {
    name: "cmd",
    version: "1.1.0",
    permission: 3,
    credits: "D-Jukie (تحسينات: ChatGPT)",
    description: "تطبيق كود من buildtooldev و pastebin",
    prefix: true,
    premium: false,
    category: "المشرف",
    usages: "[رد على رابط أو كتابة اسم الملف]",
    cooldowns: 0,
    dependencies: {
        "pastebin-api": "",
        "cheerio": "",
        "request": ""
    }
};

module.exports.run = async function ({ api, event, args, utils }) {
    const axios = require("axios");
    const fs = require("fs");
    const request = require("request");
    const cheerio = require("cheerio");
    const { resolve } = require("path");
    const { senderID, threadID, messageID, messageReply, type } = event;

    if (!args[0] && (!messageReply || !messageReply.body)) {
        return api.sendMessage("⚠️ الرجاء الرد على رابط يحتوي على كود أو كتابة اسم ملف لحفظ الكود في Pastebin.", threadID, messageID);
    }

    let text = type === "message_reply" ? messageReply.body : null;
    let name = args[0];

    if (!text && name) {
        fs.readFile(`${__dirname}/${name}.js`, "utf-8", async (err, data) => {
            if (err) return api.sendMessage(`❌ الأمر "${name}" غير موجود.`, threadID, messageID);

            try {
                const { PasteClient } = require("pastebin-api");
                const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb");
                const url = await client.createPaste({
                    code: data,
                    expireDate: "N",
                    format: "javascript",
                    name: name,
                    publicity: 1
                });

                const id = url.split("/")[3];
                return api.sendMessage(`✅ تم تحميل الكود: https://pastebin.com/raw/${id}`, threadID, messageID);
            } catch (error) {
                console.error(error);
                return api.sendMessage("❌ حدث خطأ أثناء تحميل الكود إلى Pastebin.", threadID, messageID);
            }
        });
        return;
    }

    const urlMatch = text ? text.match(/https?:\/\/[^\s]+/) : null;
    if (!urlMatch) return api.sendMessage("⚠️ الرجاء الرد على رابط صالح يحتوي على كود.", threadID, messageID);

    const url = urlMatch[0];

    try {
        if (url.includes("pastebin")) {
            const response = await axios.get(url);
            fs.writeFile(`${__dirname}/${name}.js`, response.data, "utf-8", err => {
                if (err) return api.sendMessage(`❌ حدث خطأ أثناء تطبيق الكود على "${name}.js"`, threadID, messageID);
                api.sendMessage(`✅ تم تطبيق الكود على "${name}.js". استخدم الأمر "load" لتشغيله.`, threadID, messageID);
            });
            return;
        }

        if (url.includes("buildtool") || url.includes("tinyurl.com")) {
            request(url, (error, response, body) => {
                if (error) return api.sendMessage("⚠️ الرجاء الرد على رابط صالح فقط.", threadID, messageID);

                const load = cheerio.load(body);
                const codeBlock = load(".language-js").first();
                if (!codeBlock || !codeBlock.text()) {
                    return api.sendMessage("❌ لم يتم العثور على كود صالح في الرابط.", threadID, messageID);
                }

                fs.writeFile(`${__dirname}/${name}.js`, codeBlock.text(), "utf-8", err => {
                    if (err) return api.sendMessage(`❌ خطأ أثناء حفظ الكود في "${name}.js".`, threadID, messageID);
                    api.sendMessage(`✅ تم إضافة الكود إلى "${name}.js". استخدم "load" لتشغيله.`, threadID, messageID);
                });
            });
            return;
        }

        if (url.includes("drive.google")) {
            const driveId = url.match(/[-\w]{25,}/);
            if (!driveId) return api.sendMessage("⚠️ لم يتم العثور على معرف ملف صالح في الرابط.", threadID, messageID);

            const filePath = resolve(__dirname, `${name}.js`);
            try {
                await utils.downloadFile(`https://drive.google.com/u/0/uc?id=${driveId}&export=download`, filePath);
                api.sendMessage(`✅ تم حفظ الكود في "${name}.js". إذا كان هناك خطأ، يرجى تحويل الملف في Google Drive إلى تنسيق TXT.`, threadID, messageID);
            } catch (e) {
                console.error(e);
                api.sendMessage(`❌ خطأ أثناء تحميل الكود من Google Drive إلى "${name}.js".`, threadID, messageID);
            }
            return;
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ حدث خطأ أثناء معالجة الرابط. الرجاء التأكد من صحته والمحاولة مرة أخرى.", threadID, messageID);
    }
};