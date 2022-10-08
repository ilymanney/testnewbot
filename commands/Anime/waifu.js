const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "waifu",
  args: false,
  description: "Gets a waifu pic :P",
  usage: "waifu",
  async run(message, args, client) {
    try {
      const waifu = await client.apis.request(
        "https://api.waifu.pics/sfw/waifu"
      );
      const waifuEmbed = {
        color: "#9dcc37",
        image: {
          url: `${waifu.url}`,
        },
        timestamp: new Date(),
        footer: {
          text: `Requested by ${message.member.user.username}`,
          icon_url: `${
            message.member.user.avatarURL() || client.user.avatarURL()
          }`,
        },
      };
      return await message.channel.send({ embeds: [waifuEmbed] });
    } catch (error) {
      client.logger(error.message, "error");
      return await message.channel.send(
        `❌ | Couldn't retrieve a waifu pic, Sorry!`
      );
    }
  },
  data: new SlashCommandBuilder()
    .setName("waifu")
    .setDescription("Gets a waifu pic :P"),
  async execute(interaction, client) {
    await interaction.deferReply();
    try {
      const waifu = await client.apis.request(
        "https://api.waifu.pics/sfw/waifu"
      );
      const waifuEmbed = {
        color: "#9dcc37",
        image: {
          url: `${waifu.url}`,
        },
        timestamp: new Date(),
        footer: {
          text: `Requested by ${interaction.user.username}`,
          icon_url: `${
            interaction.user.avatarURL() || client.user.avatarURL()
          }`,
        },
      };
      return await interaction.followUp({ embeds: [waifuEmbed] });
    } catch (error) {
      client.logger(error.message, "error");
      return await interaction.followUp(
        `❌ | Couldn't retrieve a waifu pic, Sorry!`
      );
    }
  },
};
