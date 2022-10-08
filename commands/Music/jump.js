const { SlashCommandBuilder } = require("@discordjs/builders");
const { embedMessage } = require("../../modules/embedSimple");

module.exports = {
  name: "jump",
  args: true,
  description: "Jumps to a particular position in the queue",
  usage: "jump <position>",
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
            `❌ | You must be in my voice channel to jump to a new song!`
          ),
        ],
      });

    if (!queue || !queue.playing)
      return await message.channel.send({
        embeds: [
          embedMessage("RED", `❌ | There is nothing playing at the moment`),
        ],
      });

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
            "RED",
            `You are not allowed to use this command.\n This command is only available for users with the DJ Role: <@&${checkdj}>`
          ),
        ],
      });
    }

    if (!args[0])
      return await message.channel.send({
        embeds: [
          embedMessage("#9dcc37", `Please provide the position to jump to!`),
        ],
      });
    try {
      if (queue) {
        await queue.jump(Number(args[0] - 1));
        return await message.channel.send({
          embeds: [
            embedMessage(
              "#9dcc37",
              `✅ jumped to position ${args[0]} in the queue!`
            ),
          ],
        });
      }
    } catch (err) {
      client.logger(err.message, "error");
      await message.channel.send({
        embeds: [embedMessage("#9dcc37", "Could not jump to this position")],
      });
    }
  },
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jumps to a particular position in the queue")
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("new position")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const queue = client.player.getQueue(interaction.guild);
    const position = interaction.options.getInteger("position");

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You must be in my voice channel to jump to a new song!`
          ),
        ],
      });

    if (!queue || !queue.playing)
      return await interaction.followUp({
        embeds: [
          embedMessage("RED", `❌ | There is nothing playing at the moment`),
        ],
      });

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
        await queue.jump(Number(position - 1));
        return await interaction.followUp({
          embeds: [
            embedMessage(
              "#9dcc37",
              `✅ Jumped to position ${position} in the queue!`
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
            "Could not jump to this position because it does not exist!"
          ),
        ],
      });
    }
  },
};
