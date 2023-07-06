import fs from "node:fs";
import assert from "node:assert";
import { Config } from "./types/Config";
import { Notifier, SubscriptionMethods, DataStorageMethods, Video } from "youtube-notifs";

/*
 * Config
 */
let cfg: Config;
{
	const webhookUrlPattern = /^https:\/\/discord.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_\-]+$/;

	if (!fs.existsSync("config.json")) {
		const defaultConfig: Config = {
			webhookUrl: "",
			message: "{ChannelName} just uploaded a new video!\n{VideoUrl}",
			checkInterval: 15,
			subscriptions: ["UCS0N5baNlQWJCUrhCEo8WlA"]
		};
		fs.writeFileSync("config.json", `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf8");
		console.log("Configuration file created! (config.json)");
		process.exit(0);
	}

	const cfgJson = fs.readFileSync("config.json", "utf8");

	try {
		cfg = JSON.parse(cfgJson);
	} catch (e) {
		console.log("Failed to parse configuration file. Check for mistakes.");
		process.exit(1);
	}

	assert(typeof cfg.webhookUrl === "string");
	assert(typeof cfg.message === "string");
	assert(typeof cfg.checkInterval === "number");
	assert(Array.isArray(cfg.subscriptions));
	assert(cfg.subscriptions.every(e => typeof e === "string"));

	if (!webhookUrlPattern.test(cfg.webhookUrl)) {
		console.log("The webhookUrl config option doesn't follow the right format. Make sure it is set and correct.");
		process.exit(1);
	}
}

/*
 * Notifier
 */
{
	const allowedMentions: any = {
		parse: /@(?:everyone|here)/.test(cfg.message) ? ["everyone"] : [],
		roles: Array.from(cfg.message.matchAll(/<@&(\d+)>/g)).map(e => e[1]),
		users: Array.from(cfg.message.matchAll(/<@!?(\d+)>/g)).map(e => e[1])
	};

	function webhookSend(msg: string) {
		fetch(cfg.webhookUrl, {
			method: "POST",
			headers: {
				"Content-type": "application/json"
			},
			body: JSON.stringify({
				content: msg,
				allowed_mentions: allowedMentions
			})
		});
	}

	function getMessage(vid: Video): string {
		return cfg.message.replace(/\{(.+?)\}/g, (full, name: string) => ({
			"VideoTitle": vid.title,
			"VideoUrl": vid.url,
			"VideoId": vid.id,
			"VideoReleased": vid.released.toString(),
			"VideoDescription": vid.description,
			"VideoWidth": vid.width.toString(),
			"VideoWeight": vid.height.toString(),
			"ThumbWidth": vid.thumb.width.toString(),
			"ThumbHeight": vid.thumb.height.toString(),
			"ThumbUrl": vid.thumb.url,
			"ChannelTitle": vid.channel.title,
			"ChannelUrl": vid.channel.url,
			"ChannelId": vid.channel.id,
			"ChannelReleased": vid.channel.released.toString()
		})[name] ?? full);
	}

	const notifier = new Notifier({
		subscription: {
			method: SubscriptionMethods.Polling,
			interval: cfg.checkInterval
		},
		dataStorage: {
			method: DataStorageMethods.File,
			file: "data.json"
		}
	});

	notifier.onError = console.error;

	notifier.onNewVideo = (video) => {
		const msg = getMessage(video);
		webhookSend(msg);
	}

	notifier.subscribe(...cfg.subscriptions);

	notifier.start();
}
