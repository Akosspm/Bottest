module.exports.config = {
    name: "الموافقة",
    version: "2.0.0",
    permission: 0,
    credits: "Ryuko (تحسينات وتعريب: ChatGPT)",
    description: "الموافقة على المجموعات باستخدام معرف المجموعة.",
    prefix: false,
    category: "الإدارة",
    premium: false,
    usages: "الموافقة [group/remove] [threadid]",
    cooldowns: 5,
};

module.exports.languages = {
    "arabic": {
        "listAdmin": '📋 **القائمة المعتمدة:**\n\n%1',
        "notHavePermission": '⚠️ **ليس لديك صلاحية لاستخدام هذا الأمر!**',
        "addedNewAdmin": '✅ تمت الموافقة على **%1**:\n\n%2',
        "removedAdmin": '❌ تم **إزالة** %1 من القائمة المعتمدة:\n\n%2'
    },
    "english": {
        "listAdmin": '📋 **Approved list:**\n\n%1',
        "notHavePermission": '⚠️ **You don’t have permission to use this command!**',
        "addedNewAdmin": '✅ Approved %1 box:\n\n%2',
        "removedAdmin": '❌ Removed %1 box from approved list:\n\n%2'
    }
};

module.exports.run = async function ({ api, event, args, Threads, Users, permission, getText }) {
    const content = args.slice(1);
    const { threadID, messageID, mentions } = event;
    const configPath = require.resolve('../../config.json');
    const { approvedgroups } = global.config;
    const { writeFileSync } = require("fs-extra");

    delete require.cache[configPath];
    const config = require(configPath);

    switch (args[0]) {
        case "list":
        case "all": {
            const listAdmin = approvedgroups || config.approvedgroups || [];
            let msg = [];

            for (const id of listAdmin) {
                let info;
                try {
                    const groupName = await global.data.threadInfo.get(id).threadName || "غير معروف";
                    info = `📌 **اسم المجموعة:** ${groupName}\n🆔 **معرف المجموعة:** ${id}`;
                } catch (error) {
                    const userName = await Users.getNameUser(id);
                    info = `👤 **اسم المستخدم:** ${userName}\n🆔 **معرف المستخدم:** ${id}`;
                }
                msg.push(info);
            }

            return api.sendMessage(getText("listAdmin", msg.join("\n\n")), threadID, messageID);
        }

        case "approve":
        case "group": {
            if (permission !== 3) return api.sendMessage(getText("notHavePermission"), threadID, messageID);

            let targetID = content[0];
            if (!targetID) return api.sendMessage("⚠️ **يرجى إدخال معرف المجموعة أو المستخدم للموافقة عليه.**", threadID, messageID);

            approvedgroups.push(targetID);
            config.approvedgroups.push(targetID);
            writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

            let info;
            try {
                const groupName = await global.data.threadInfo.get(targetID).threadName || "غير معروف";
                info = `📌 **اسم المجموعة:** ${groupName}\n🆔 **معرف المجموعة:** ${targetID}`;
            } catch (error) {
                const userName = await Users.getNameUser(targetID);
                info = `👤 **اسم المستخدم:** ${userName}\n🆔 **معرف المستخدم:** ${targetID}`;
            }

            return api.sendMessage(getText("addedNewAdmin", 1, info), threadID, messageID);
        }

        case "remove":
        case "rm":
        case "delete": {
            if (permission !== 3) return api.sendMessage(getText("notHavePermission"), threadID, messageID);

            let targetID = content[0];
            if (!targetID) return api.sendMessage("⚠️ **يرجى إدخال معرف المجموعة أو المستخدم لإزالته من القائمة المعتمدة.**", threadID, messageID);

            const index = config.approvedgroups.findIndex(item => item.toString() === targetID);
            if (index === -1) return api.sendMessage("❌ **المعرف غير موجود في القائمة المعتمدة!**", threadID, messageID);

            approvedgroups.splice(index, 1);
            config.approvedgroups.splice(index, 1);
            writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

            let info;
            try {
                const groupName = await global.data.threadInfo.get(targetID).threadName || "غير معروف";
                info = `📌 **اسم المجموعة:** ${groupName}\n🆔 **معرف المجموعة:** ${targetID}`;
            } catch (error) {
                const userName = await Users.getNameUser(targetID);
                info = `👤 **اسم المستخدم:** ${userName}\n🆔 **معرف المستخدم:** ${targetID}`;
            }

            return api.sendMessage(getText("removedAdmin", 1, info), threadID, messageID);
        }

        default:
            return api.sendMessage("⚠️ **الأمر غير صحيح! استخدم:**\n- `الموافقة list` لعرض القائمة\n- `الموافقة approve [معرف]` للموافقة\n- `الموافقة remove [معرف]` للإزالة", threadID, messageID);
    }
};