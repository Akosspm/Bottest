module.exports.config = {
	name: "autodl",
	version: "1.0.0",
	permission: 0,
	credits: "ryuko",
	premium: false,
	description: "none",
	prefix: false,
	category: "system",
	usages: `n/a`,
	cooldowns: 5
};

module.exports.handleEvent = async ({
	api,
	event
}) => {
	var axios = require('axios');
	var fs = require('fs-extra');
	var fbScrapper = require('fb-downloader-scrapper');
    var ttScrapper = require('ruhend-scraper').ttdl;
	var path = require('path');
	try {
    const cacheFile = `${event.messageID}.mp4`;
	const cachePath = path.join(__dirname, 'cache/' + cacheFile);
	const fbUrlRegex = /(https?:\/\/www\.facebook\.com\/[^\s]+)/g;
    const ttUrlRegex = /(https?:\/\/vt\.tiktok\.com\/[^\s]+)/g;
	const fbMatches = event.body.match(fbUrlRegex);
    const ttMatches = event.body.match(ttUrlRegex);
    if (ttMatches && ttMatches.length > 0) {
		const tiktokLink = ttMatches[0];
		try {
			const res = await ttScrapper(tiktokLink);
			var description = res.description || "no title";
            var { author, username, views, comment, like, share, music } = res;
			var downloadResponse = await axios({
				method: 'GET',
				url: res.video,
				responseType: 'stream'
			});
			var writer = fs.createWriteStream(cachePath);
			downloadResponse.data.pipe(writer);
			writer.on('finish', async () => {
				api.sendMessage({
                    body: `auto download tiktok video\n\nauthor : ${author || ""}\nusername : ${username || "no username"}\nviews : ${views}\ncomments : ${comment}\nlikes : ${like}\nshares : ${share}\nmusic : ${music}\ntitle : ${title}`,
					attachment: fs.createReadStream(cachePath)
				}, event.threadID, () => {
					fs.unlinkSync(cachePath);
				}, event.messageID);
			});
			writer.on('error', () => {
                console.error(error)
				return;
			});
		} catch (err) {
            console.error(err)
			return;
		}
	}
	if (fbMatches && fbMatches.length > 0) {
		const facebookLink = fbMatches[0];
		try {
			const res = await fbScrapper(facebookLink);
			var title = res.title || "no title";
			var downloadResponse = await axios({
				method: 'GET',
				url: res.hd,
				responseType: 'stream'
			});
			var writer = fs.createWriteStream(cachePath);
			downloadResponse.data.pipe(writer);
			writer.on('finish', async () => {
				api.sendMessage({
                    body: `auto download facebook video\n\ntitle : ${title}`,
					attachment: fs.createReadStream(cachePath)
				}, event.threadID, () => {
					fs.unlinkSync(cachePath);
				}, event.messageID);
			});
			writer.on('error', () => {
				return;
			});
		} catch (err) {
			return;
		}
	}
    } catch (err) {
		return;
}
}

module.exports.run = async ({
	api,
	args,
	event
}) => {
	return;
}