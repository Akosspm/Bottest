module.exports.config = {
    name: "إدارة",
    version: "1.0.0",
    permission: 3,
    credits: "ryuko",
    description: "إدارة والتحكم في جميع أوامر البوت",
    prefix: true,
    premium: false,
    category: "المشرف",
    usages: "[تحميل/إلغاء_تحميل/تحميل_الكل/إلغاء_تحميل_الكل/معلومات] [اسم الأمر]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": ""
    }
};

const تحميل_الأمر = function ({ moduleList, threadID, messageID, botid }) {
    const { execSync } = global.nodemodule['child_process'];
    const { writeFileSync, unlinkSync, readFileSync } = global.nodemodule['fs-extra'];
    const { join } = global.nodemodule['path'];
    const { mainPath, api } = global.client;
    const configPath = "../../config.json";
    const logger = require('../../main/utility/logs.js');

    var errorList = [];
    delete require['resolve'][require['resolve'](configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + '.temp', JSON.stringify(configValue, null, 2), 'utf8');

    for (const nameModule of moduleList) {
        try {
            const dirModule = __dirname + '/' + nameModule + '.js';
            delete require['cache'][require['resolve'](dirModule)];
            const command = require(dirModule);
            global.client.commands.delete(nameModule);

            if (!command.config || !command.run || !command.config.category) 
                throw new Error('الوحدة تالفة!');

            if (command.config.dependencies && typeof command.config.dependencies == 'object') {
                const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
                const listbuiltinModules = require('module')['builtinModules'];

                for (const packageName in command.config.dependencies) {
                    try {
                        if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) {
                            global.nodemodule[packageName] = require(packageName);
                        } else {
                            global.nodemodule[packageName] = require(join(global.client.mainPath, 'nodemodules', 'node_modules', packageName));
                        }
                    } catch {
                        logger.commands(`لم يتم العثور على الحزمة ${packageName}، سيتم تثبيتها...`, 'warn');
                        execSync(`npm install ${packageName}`, { stdio: 'inherit' });
                        global.nodemodule[packageName] = require(packageName);
                    }
                }
                logger.commands(`تم تحميل جميع الحزم بنجاح للأمر ${command.config.name}.`);
            }

            global.client.commands.set(command.config.name, command);
            logger.commands(`تم تحميل الأمر ${command.config.name}.`);
        } catch (error) {
            errorList.push(`${nameModule}: ${error}`);
        }
    }

    if (errorList.length > 0) {
        api.sendMessage(`حدثت أخطاء أثناء تحميل بعض الأوامر:\n${errorList.join("\n")}`, threadID, messageID);
    } else {
        api.sendMessage(`تم تحميل ${moduleList.length - errorList.length} أوامر بنجاح.`, threadID, messageID);
    }
    
    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + '.temp');
};

const إلغاء_تحميل_الأمر = function ({ moduleList, threadID, messageID }) {
    const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
    const { api } = global.client;
    const configPath = "../../config.json";
    const logger = require('../../main/utility/logs.js').commands;

    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        global.client.commands.delete(nameModule);
        configValue["disabledcmds"].push(`${nameModule}.js`);
        logger(`تم إلغاء تحميل الأمر ${nameModule}.`);
    }

    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + ".temp");

    api.sendMessage(`تم إلغاء تحميل ${moduleList.length} أوامر.`, threadID, messageID);
};

module.exports.run = function ({ event, args, api }) {
    const { readdirSync } = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;
    let المشغلون = global.config.operators;

    if (!المشغلون.includes(event.senderID)) {
        return api.sendMessage("❌ لا يمكنك استخدام هذا الأمر، فهو مخصص لمشغلي البوت فقط.", threadID, messageID);
    }

    let moduleList = args.slice(1);
    switch (args[0]) {
        case "تحميل":
            if (moduleList.length === 0) return api.sendMessage("❌ يجب تحديد اسم الأمر الذي تريد تحميله.", threadID, messageID);
            return تحميل_الأمر({ moduleList, threadID, messageID });

        case "إلغاء_تحميل":
            if (moduleList.length === 0) return api.sendMessage("❌ يجب تحديد اسم الأمر الذي تريد إلغاء تحميله.", threadID, messageID);
            return إلغاء_تحميل_الأمر({ moduleList, threadID, messageID });

        case "تحميل_الكل":
            moduleList = readdirSync(__dirname).filter(file => file.endsWith(".js")).map(file => file.replace(".js", ""));
            return تحميل_الأمر({ moduleList, threadID, messageID });

        case "إلغاء_تحميل_الكل":
            moduleList = readdirSync(__dirname).filter(file => file.endsWith(".js") && file !== "إدارة.js").map(file => file.replace(".js", ""));
            return إلغاء_تحميل_الأمر({ moduleList, threadID, messageID });

        case "معلومات":
            if (moduleList.length === 0) return api.sendMessage("❌ يجب تحديد اسم الأمر لمعرفة معلوماته.", threadID, messageID);
            const command = global.client.commands.get(moduleList[0]);
            if (!command) return api.sendMessage("❌ الأمر الذي أدخلته غير موجود.", threadID, messageID);

            const { name, version, permission, credits, cooldowns, dependencies } = command.config;
            return api.sendMessage(
                `📌 **معلومات عن الأمر ${name.toUpperCase()}**\n` +
                `👤 **المبرمج:** ${credits}\n` +
                `🆔 **الإصدار:** ${version}\n` +
                `🔐 **الصلاحية المطلوبة:** ${(permission === 0) ? "المستخدم" : (permission === 1) ? "المشرف" : "مشغل البوت"}\n` +
                `⏳ **مدة التبريد:** ${cooldowns} ثوانٍ\n` +
                `📦 **المكتبات المطلوبة:** ${Object.keys(dependencies || {}).join(", ") || "لا توجد"}`,
                threadID, messageID
            );

        default:
            return api.sendMessage("❌ استخدام غير صحيح للأمر. استخدم `إدارة [تحميل/إلغاء_تحميل/تحميل_الكل/إلغاء_تحميل_الكل/معلومات] [اسم_الأمر]`", threadID, messageID);
    }
};