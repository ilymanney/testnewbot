const { SlashCommandBuilder } = require("@discordjs/builders");
const { embedMessage } = require("../../modules/embedSimple");

module.exports = {
  name: "clear",
  aliases: ["cl"],
  args: false,
  description: "Clears the Music Queue",
  usage: "cl || clear",
  async run(message, args, client) {
    const queue = client.player.getQueue(message.guild);

    if (
      message.guild.me.voice.channelId &&
      message.member.voice.channelId !== message.guild.me.voice.channelId
    )
      return await message.channel.send({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You must be in my voice channel to clear the queue!`
          ),
        ],
      });

    if (!queue) {
      return await message.channel.send({
        embeds: [
          embedMessage("RED", `❌ | No Queue has been created for this guild`),
        ],
      });
    }

    const checkdj = await client.db.get(`djRole_${message.guildId}`);
    const userRoles = await message.member.roles.cache.map((role) => role.id);

    if (
      checkdj &&
      !userRoles.includes(checkdj) &&
      message.guild.ownerId !== message.author.id
    ) {
      return await message.channel.send({
        embeds: [
          embedMessage(
            "#9dcc37",
            `You are not allowed to use this command.\n This command is only available for users with the DJ Role: <@&${checkdj}>`
          ),
        ],
      });
    }

    try {
      if (queue) {
        await queue.clear();
        await message.channel.send({
          embeds: [
            embedMessage(
              "#9dcc37",
              `✅ Queue Cleared! [${message.member.toString()}]`
            ),
          ],
        });
      }
    } catch (err) {
      client.logger(err.message, "error");
      await message.channel.send({
        embeds: [
          embedMessage(
            "RED",
            "❌ Could not clear the queue, maybe there is no queue"
          ),
        ],
      });
    }
  },
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("clears the music queue"),

  async execute(interaction, client) {
    await interaction.deferReply();
    const queue = client.player.getQueue(interaction.guild);

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You must be in my voice channel to clear the queue!`
          ),
        ],
      });

    if (!queue) {
      return await interaction.followUp({
        embeds: [
          embedMessage("RED", `❌ | No Queue has been created for this guild`),
        ],
      });
    }

    const checkdj = await client.db.get(`djRole_${interaction.guildId}`);
    const userRoles = await interaction.member.roles.cache.map(
      (role) => role.id
    );

    if (
      checkdj &&
      !userRoles.includes(checkdj) &&
      interaction.guild.ownerId !== interaction.member.id
    ) {
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "#9dcc37",
            `You are not allowed to use this command.\n This command is only available for users with the DJ Role: <@&${checkdj}>`
          ),
        ],
      });
    }

    try {
      if (queue) {
        await queue.clear();
        await interaction.followUp({
          embeds: [
            embedMessage(
              "#9dcc37",
              `✅ Queue Cleared! [<@${interaction.user.id}>]`
            ),
          ],
        });
      }
    } catch (err) {
      client.logger(err.message, "error");
      await interaction.followUp({
        embeds: [
          embedMessage(
            "RED",
            "❌ Could not clear the queue, maybe there is no queue"
          ),
        ],
      });
    }
  },
};
