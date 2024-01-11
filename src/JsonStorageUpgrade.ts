import { JsonStorage } from "youtube-notifs";

export class JsonStorageUpgrade extends JsonStorage {
    constructor(...args: ConstructorParameters<typeof JsonStorage>) {
        super(...args);
        if (Object.keys(this.data).includes("latestVids")) {
            this.data["latest_vid_ids"] = { ...this.data["latestVids"] };
            delete this.data["latestVids"];
        }
    }
}
