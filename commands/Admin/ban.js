const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");
const { embedMessage } = require("../../modules/embedSimple");
const { getUserFromMention } = require("../../modules/getUserFromMention");

module.exports = {
  name: "ban",
  args: true,
  description: "Bans a user from the server",
  usage: "ban <user> <reason>",
  async run(message, args, client) {
    const user = getUserFromMention(args[0], client);

    if (!args[0])
      return await message.channel.send({
        embeds: [embedMessage("RED", `❌ | Please mention a user to ban`)],
      });

    const banReason = args.slice(1).join(" ");

    const embed = {
      author: {
        name: `${message.member.user.username}`,
        icon_url: `${
          message.member.user.avatarURL() || client.user.avatarURL()
        }`,
      },
      color: "#9dcc37",
      title: `A user has been Banned!`,
      fields: [
        {
          name: "User",
          value: `${user}`,
          inline: true,
        },
        {
          name: "Reason",
          value: `\`${banReason ? banReason : "No Reason provided!"}\``,
        },
      ],
      timestamp: new Date(),
    };

    if (!message.member.permissions.has("BAN_MEMBERS"))
      return await message.channel.send({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You do not have permission to ban members!`
          ),
        ],
      });

    if (!user)
      return await message.channel.send({
        embeds: [
          embedMessage(
            "RED",
            `❌ | Could not resolve the user, Please mention the user you want to ban!`
          ),
        ],
      });

    try {
      await message.guild.members.ban(user, {
        reason: banReason ? banReason : "No Reason",
      });
      return await message.channel.send({ embeds: [embed] });
    } catch (error) {
      client.logger(error.message, "error");
      return await message.channel.send({
        embeds: [
          embedMessage("RED", `❌ | Couldn't ban ${user}, ${error.message}`),
        ],
      });
      console.log(error);
    }
  },
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select a user").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("ban reason").setRequired(true)
    ),
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    await interaction.deferReply();

    const embed = {
      author: {
        name: `${interaction.user.username}`,
        icon_url: `${interaction.user.avatarURL() || client.user.avatarURL()}`,
      },
      color: "#9dcc37",
      title: `A user has been Banned!`,
      fields: [
        {
          name: "User",
          value: `${user}`,
          inline: true,
        },
        {
          name: "Reason",
          value: `${reason}`,
        },
      ],
      timestamp: new Date(),
    };

    if (!interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]))
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You do not have permission to ban members!`
          ),
        ],
      });

    try {
      await interaction.guild.members.ban(user, { reason });
      return await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      client.logger(error.message, "error");
      return await interaction.followUp({
        embeds: [embedMessage("RED", `Couldn't ban ${user}, ${error.message}`)],
      });
      console.log(error);
    }
  },
};
