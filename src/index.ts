import fs from "node:fs";
import assert from "node:assert";
import { Config } from "./types/Config";
import { PollingNotifier, JsonStorage, Video } from "youtube-notifs";

/*
 * Config
 */
let cfg: Config;
{
	const webhookUrlPattern = /^https:\/\/discord.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_\-]+$/;

	if (!fs.existsSync("config.json")) {
		const defaultConfig: Config = {
			webhookUrl: "",
			message: "{ChannelName} uploaded a new video!\n{VideoUrl}",
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

	async function webhookSend(msg: string): Promise<void> {
		await fetch(cfg.webhookUrl, {
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
		return cfg.message.replace(/\{([^\}]+)\}/g, (full, name: string) => ({
			"videotitle": vid.title,
			"videourl": vid.url,
			"videoid": vid.id,
			"videocreated": vid.created.toString(),
			"videodescription": vid.description,
			"videowidth": vid.width.toString(),
			"videoheight": vid.height.toString(),
			"thumbwidth": vid.thumb.width.toString(),
			"thumbheight": vid.thumb.height.toString(),
			"thumburl": vid.thumb.url,
			"channelname": vid.channel.name,
			"channelurl": vid.channel.url,
			"channelid": vid.channel.id,
			"channelcreated": vid.channel.created.toString()
		})[name.toLowerCase()] ?? full);
	}

	const notifier = new PollingNotifier({
		interval: cfg.checkInterval,
		storage: new JsonStorage("data.json")
	});

	notifier.onNewVideos = async (videos) => {
		for (const vid of videos) {
			const msg = getMessage(vid);
			await webhookSend(msg);
		}
	}

	notifier.subscribe(cfg.subscriptions);

	notifier.start();
}
