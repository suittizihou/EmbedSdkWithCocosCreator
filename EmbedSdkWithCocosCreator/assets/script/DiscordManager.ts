import { DiscordSDK } from "@discord/embedded-app-sdk";
import { Constants } from '../env/Constants'

import { _decorator, Component, debug, ImageAsset, Label, log, Node, RichText, Sprite, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiscordManager')
export class DiscordManager extends Component {
    private discordSdk: DiscordSDK | null = null;
    private auth: any = null;

    @property(RichText)
    public channelNameText: RichText | null = null;
    @property(Sprite)
    public targetSprite: Sprite | null = null;
    @property(Label)
    public userName: Label | null = null;

    onLoad() {
        this.discordSdk = new DiscordSDK(Constants.DISCORD_CLIENT_ID);
    }
    
    async start() {
        if(this.discordSdk) {
            try {
                this.setupDiscordSdk().then(() => {
                    console.log("Discord SDK is authenticated");

                    this.appendVoiceChannelName();
                    this.appendGuildAvater();
                    this.appendUserName();
                })
            }
            catch (error) {
                console.error("Error initializing Discord SDK:", error);
            }
        }
    }

    async setupDiscordSdk() {
        try{
            await this.discordSdk.ready();
            console.log("Discord SDK is ready");

            console.log("Discord command calling authorize")
            const { code } = await this.discordSdk.commands.authorize({
                client_id: Constants.DISCORD_CLIENT_ID,
                response_type: "code",
                state: "",
                prompt: "none",
                scope: [
                    "identify",
                    "guilds"
                ],
            });

            console.log("Discord command called authorize");

            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                }),
            });
            const { access_token } = await response.json();

            this.auth = await this.discordSdk.commands.authenticate({
                access_token,
            });
            console.log("Discord command called authenticate");

            if(this.auth == null) {
                throw new Error('Authenticate command failed');
            }
        }
        catch (error) {
            console.error("Error initializing Discord SDK:", error);
        }
    }

    async appendVoiceChannelName() {
        this.channelNameText.string = "Voice Channel Name: ... ";

        if(this.discordSdk.channelId != null && this.discordSdk.guildId != null) {
            const channel = await this.discordSdk.commands.getChannel({channel_id: this.discordSdk.channelId});
            if(channel.name != null) {
                this.channelNameText.string = `Voice Channel Name:${channel.name}`;
            }
        }
    }

    async appendGuildAvater() {
        const guilds = await fetch(`${Constants.DISCORD_BASE_ENDPOINT}/v10/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${this.auth.access_token}`,
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json());

        const currentGuild = guilds.find((g) => g.id === this.discordSdk.guildId);

        if(currentGuild != null) {
            const buffer = await fetch(`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`).then((response) => response.arrayBuffer());
            const guildImg = new Image();
            guildImg.onload = () => {
                const imageAsset = new ImageAsset();
                imageAsset._nativeAsset = guildImg;
                const texture = new Texture2D();
                texture.image = imageAsset;

                const spriteFrame = this.targetSprite.spriteFrame.clone();
                spriteFrame.texture = texture;
                this.targetSprite.spriteFrame = spriteFrame;
            };
            guildImg.src = URL.createObjectURL(new Blob([buffer]));
        }
    }

    async appendUserName() {
        const user = await fetch(`${Constants.DISCORD_BASE_ENDPOINT}/v10/users/@me`, {
            headers: {
                Authorization: `Bearer ${this.auth.access_token}`,
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json());

        if(user.username != null) {
            this.userName.string = `${user.username}`;
        }
    }
}
