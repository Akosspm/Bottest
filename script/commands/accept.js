module.exports.config = {
  name: "قبول",
  version: "1.0.0",
  permission: 2,
  credits: "ryuko",
  prefix: true,
  premium: false,
  description: "قبول أو حذف طلبات الصداقة باستخدام الأمر",
  category: "admin",
  usages: "قبول",
  cooldowns: 0
};  

module.exports.handleReply = async ({ handleReply, event, api, botid }) => {
  const { author, listRequest } = handleReply;
  if (author != event.senderID) return;
  const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");
  
  const form = {
    av: api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString()
      },
      scale: 3,
      refresh_num: 0
    }
  };
  
  const success = [];
  const failed = [];
  
  if (args[0] == "ضف") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";
  }
  else if (args[0] == "حذف") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
    form.doc_id = "4108254489275063";
  }
  else return api.sendMessage("⚠️ يرجى اختيار: ضف أو حذف، أو استخدم الكل", event.threadID, event.messageID);

  let targetIDs = args.slice(1);
  
  if (args[1] == "الكل") {
    targetIDs = [];
    const lengthList = listRequest.length;
    for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
  }
  
  const newTargetIDs = [];
  const promiseFriends = [];
  
  for (const stt of targetIDs) {
    const u = listRequest[parseInt(stt) - 1];
    if (!u) {
      failed.push(`⚠️ الرقم ${stt} غير موجود في القائمة`);
      continue;
    }
    form.variables.input.friend_requester_id = u.node.id;
    form.variables = JSON.stringify(form.variables);
    newTargetIDs.push(u);
    promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
    form.variables = JSON.parse(form.variables);
  }
  
  const lengthTarget = newTargetIDs.length;
  for (let i = 0; i < lengthTarget; i++) {
    try {
      const friendRequest = await promiseFriends[i];
      if (JSON.parse(friendRequest).errors) failed.push(newTargetIDs[i].node.name);
      else success.push(newTargetIDs[i].node.name);
    }
    catch(e) {
      failed.push(newTargetIDs[i].node.name);
    }
  }
  
  api.sendMessage(
    `تم ${args[0] == 'ضف' ? '✅ إضافة' : '❌ حذف'} طلب الصداقة لـ ${success.length} شخص:\n${success.join("\n")}`
    + (failed.length > 0 ? `\n⚠️ فشل مع ${failed.length} شخص:\n${failed.join("\n")}` : ""),
    event.threadID,
    event.messageID
  );
};

module.exports.run = async ({ event, api, botid }) => {
  const moment = require("moment-timezone");
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } })
  };
  const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;
  let msg = "";
  let i = 0;
  for (const user of listRequest) {
    i++;
    msg += (`\n${i}.\n👤 **الاسم:** ${user.node.name}`
         + `\n🆔 **المعرف:** ${user.node.id}`
         + `\n🔗 **الرابط:** ${user.node.url.replace("www.facebook", "fb")}`
         + `\n🕒 **التوقيت:** ${moment(user.time*1009).tz("Africa/Algiers").format("DD/MM/YYYY HH:mm:ss")}\n`);
  }
  api.sendMessage(
    `${msg}\n↩ **قم بالرد على هذه الرسالة بـ:**\n✅ \`ضف\` + **رقم** (للقبول)\n❌ \`حذف\` + **رقم** (للإلغاء)\n🔄 \`الكل\` (لتطبيق الأمر على الجميع)`,
    event.threadID,
    (e, info) => {
      const data = {
        name: this.config.name,
        messageID: info.messageID,
        listRequest,
        author: event.senderID
      };
      global.client.handleReply.get(botid).push(data);
    },
    event.messageID
  );
};