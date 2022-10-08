const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "Get my link to invite me to other servers!",
  usage: "invite || inv",
  async run(message, args, client) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Invite")
        .setStyle("LINK")
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot&permissions=536079414`
        ),
      new MessageButton()
        .setLabel("GitHub")
        .setStyle("LINK")
        .setURL("https://github.com/naseif/Eyesense-Music-Bot"),
      new MessageButton()
        .setLabel("Support")
        .setStyle("LINK")
        .setURL("https://discord.gg/JCdpeeNP9N")
    );

    const embed = new MessageEmbed()
      .setAuthor(
        "Eyesense",
        "https://cdn.discordapp.com/attachments/506267292993191947/896386593181560873/eyesense.png"
      )
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/506267292993191947/896386593181560873/eyesense.png"
      )
      .setColor("#9dcc37")
      .addField(
        "Eyesense",
        `Eyesense is a feature-rich discord bot that provides over 100 commands!`,
        true
      );
      return await message.channel.send({ embeds: [embed], components: [row] });
  },
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get my link to invite me to other servers!"),
  async execute(interaction, client) {
    await interaction.deferReply();

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Invite")
        .setStyle("LINK")
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot&permissions=536079414`
        ),
      new MessageButton()
        .setLabel("GitHub")
        .setStyle("LINK")
        .setURL("https://github.com/naseif/Eyesense-Music-Bot"),
      new MessageButton()
        .setLabel("Support")
        .setStyle("LINK")
        .setURL("https://discord.gg/JCdpeeNP9N")
    );

    const embed = new MessageEmbed()
      .setAuthor(
        "Eyesense",
        "https://cdn.discordapp.com/attachments/506267292993191947/896386593181560873/eyesense.png"
      )
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/506267292993191947/896386593181560873/eyesense.png"
      )
      .setColor("#9dcc37")
      .addField(
        "Eyesense",
        `Eyesense is a feature-rich discord bot that provides over 100 commands!`,
        true
      );
      return await interaction.followUp({ embeds: [embed], components: [row] });
  },
};
