const { SlashCommandBuilder } = require("@discordjs/builders");
const { embedMessage } = require("../../modules/embedSimple");
const { getSong } = require("genius-lyrics-api");
const { geniusApiKey } = require("../../config.json");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  args: true,
  description: "Gets the lyrics of the current song or a song you pass",
  usage: "ly || lyrics <optional song name>",
  async run(message, args, client) {
    if (!geniusApiKey)
      return await message.channel.send({
        embeds: [
          embedMessage(
            "#9dcc37",
            "You did not add your Genius API token in the config file!"
          ),
        ],
      });

    const queue = client.player.getQueue(message.guild);
    const songString = args.join(" ");
    let songTitle;

    if (songString) {
      songTitle = songString;
    } else {
      if (!queue)
        return await message.channel.send({
          embeds: [
            embedMessage(
              "RED",
              "❌ There is no music playing to search for lyrics!, Give me the song name instead."
            ),
          ],
        });
      if (queue.current.title) {
        songTitle = queue.current.title;

        const filterName = queue.current.title.indexOf("(");

        if (filterName !== -1) {
          songTitle = songTitle.slice(0, filterName);
        }
      }
    }

    try {
      const lyricsOptions = {
        apiKey: geniusApiKey,
        title: songTitle,
        artist: " ",
        optimizeQuery: false,
      };

      const lyrics = await getSong(lyricsOptions);
      if (!lyrics)
        return await message.channel.send({
          embeds: [
            embedMessage(
              "RED",
              `❌ | I could not find any lyrics for this song!`
            ),
          ],
        });

      const lyricsEmbed = {
        color: "#9dcc37",
        title: `${lyrics.title}`,
        author: {
          name: `${message.member.user.username}`,
          icon_url: `${
            message.member.user.avatarURL() || client.user.avatarURL()
          }`,
        },
        description: `${lyrics.lyrics}`,
        thumbnail: {
          url: `${lyrics.albumArt}`,
        },

        timestamp: new Date(),
      };

      if (lyrics.lyrics.length > 4096) {
        const chunkLyrics = client.tools.chunkSubstr(lyrics.lyrics, 4096);
        chunkLyrics.forEach(async (str) => {
          lyricsEmbed.description = str;
          return await message.channel.send({ embeds: [lyricsEmbed] });
        });
      } else {
        return await message.channel.send({
          embeds: [lyricsEmbed],
        });
      }
    } catch (error) {
      await message.channel.send({
        embeds: [
          embedMessage("RED", `❌ | I could not get the lyrics of this song!`),
        ],
      });
      client.logger(error.message, "error");
      console.log(error);
    }
  },
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Gets the lyrics of the current song or a song you pass")
    .addStringOption((option) =>
      option.setName("song").setDescription("song name")
    ),

  async execute(interaction, client) {
    await interaction.deferReply();
    const songString = interaction.options.getString("song");
    const queue = client.player.getQueue(interaction.guild);
    let songTitle;

    if (!geniusApiKey)
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "#9dcc37",
            "You did not add your Genius API token in the config file!"
          ),
        ],
      });

    if (songString) {
      songTitle = songString;
    } else {
      if (!queue)
        return await interaction.followUp({
          embeds: [
            embedMessage(
              "RED",
              "❌ There is no music playing to search for lyrics!"
            ),
          ],
        });
      if (queue.current.title) {
        songTitle = queue.current.title;

        const filterName = queue.current.title.indexOf("(");

        if (filterName !== -1) {
          songTitle = songTitle.slice(0, filterName);
        }
      }
    }

    try {
      const lyricsOptions = {
        apiKey: geniusApiKey,
        title: songTitle,
        artist: " ",
        optimizeQuery: false,
      };

      const lyrics = await getSong(lyricsOptions);

      if (!lyrics)
        return await interaction.followUp({
          embeds: [
            embedMessage(
              "RED",
              `❌ | I could not find any lyrics for this song!`
            ),
          ],
        });

      const lyricsEmbed = {
        color: "#9dcc37",
        title: `${lyrics.title}`,
        author: {
          name: `${interaction.user.username}`,
          icon_url: `${
            interaction.user.avatarURL() || client.user.avatarURL()
          }`,
        },
        description: `${lyrics.lyrics}`,
        thumbnail: {
          url: `${lyrics.albumArt}`,
        },

        timestamp: new Date(),
      };

      if (lyrics.lyrics.length > 4096) {
        const chunkLyrics = client.tools.chunkSubstr(lyrics.lyrics, 4096);
        chunkLyrics.forEach(async (str) => {
          lyricsEmbed.description = str;
          return await interaction.followUp({ embeds: [lyricsEmbed] });
        });
      } else {
        return await interaction.followUp({
          embeds: [lyricsEmbed],
        });
      }
    } catch (error) {
      await interaction.followUp({
        embeds: [
          embedMessage("RED", `❌ | I could not get the lyrics of this song!`),
        ],
      });
      client.logger(error.message, "error");
    }
  },
};
