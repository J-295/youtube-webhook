# Install
- You must have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [Node.js](https://nodejs.org/en/download) installed first.
- Open the terminal. In Windows, the terminal can be found by pressing the Windows key and typing `cmd`
- Download the files by running `git clone https://github.com/James-Bennett-295/youtube-webhook`
- Once that command has completed, navigate to the newly created `youtube-webhook` folder by running `cd youtube-webhook`
- Get the program ready by running `npm install` then `npm run build`
- Now run `npm start` to start the program. This will generate a config.json file which you can now configure.
- To configure the `webhookUrl` option, you can go into the settings of the Discord channel where you want the notifications to be, open "Integrations", press "View Webhook", press "New Webhook", press on the newly created webhook, change the name and/or avatar if you'd like, then press "Copy Webhook URL" and set the `webhookUrl` config option to that.
- Run `npm start` again and if you don't see any new messages appear then it should be working.

# Placeholders
Here are the (case-insensitive) placeholders which can be used in the `message` config option:
- `{VideoTitle}`
- `{VideoUrl}`
- `{VideoId}`
- `{VideoCreated}`
- `{VideoDescription}`
- `{VideoWidth}`
- `{VideoHeight}`
- `{ThumbWidth}`
- `{ThumbHeight}`
- `{ThumbUrl}`
- `{ChannelName}`
- `{ChannelUrl}`
- `{ChannelId}`
- `{ChannelCreated}`
