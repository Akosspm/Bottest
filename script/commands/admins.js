module.exports.config = {
    name: 'المشرفين',
    version: '1.0.0',
    permission: 0,
    credits: 'ryuko',
    prefix: false,
    premium: false,
    description: 'عرض قائمة مشرفي المجموعة.',
    category: 'بدون بادئة',
    usages: 'المشرفين',
    cooldowns: 5,
    dependencies: []
};

module.exports.run = async function({ api, event, Users }) {
    try {
        var معلومات_المجموعة = await api.getThreadInfo(event.threadID);
        let عدد_المشرفين = معلومات_المجموعة.adminIDs.length;
        var قائمة_المشرفين = '';
        var المشرفين = معلومات_المجموعة.adminIDs;
        
        for (let i = 0; i < المشرفين.length; i++) {
            const معلومات_المستخدم = await api.getUserInfo(المشرفين[i].id);
            const الاسم = معلومات_المستخدم[المشرفين[i].id].name;
            قائمة_المشرفين += `${i + 1}. ${الاسم}\n`;
        }

        api.sendMessage(
            `📋 **قائمة المشرفين (${عدد_المشرفين})**:\n\n${قائمة_المشرفين}`,
            event.threadID,
            event.messageID
        );

    } catch (خطأ) {
        console.error(خطأ);
        api.sendMessage("❌ حدث خطأ أثناء جلب قائمة المشرفين.", event.threadID, event.messageID);
    }
};