const { SlashCommandBuilder } = require("@discordjs/builders");
const { embedMessage } = require("../../modules/embedSimple");
const { Music } = require("../../modules/Music.js");
const playdl = require("play-dl");
const { QueryType } = require("discord-player");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Plays music from Youtube, Spotify and Soundcloud!",
  args: true,
  usage: "p <YouTube URL | Song Name | Spotify URL | Soundcloud URL |>",
  async run(message, args, client, prefix) {
    const songString = args.join(" ");

    if (!songString)
      return await message.reply({
        embeds: [
          embedMessage(
            "RED",
            `❌ | ${message.member.toString()}, You have to provide a song name or URL`
          ),
        ],
      });

    const checkdj = await client.db.get(`djRole_${message.guildId}`);
    const userRoles = await message.member.roles.cache.map((role) => role.id);

    if (
      checkdj &&
      !userRoles.includes(checkdj) &&
      message.guild.ownerId !== message.author.id
    ) {
      return await message.reply({
        embeds: [
          embedMessage(
            "RED",
            `You are not allowed to use this command.\n This command is only available for users with the DJ Role: <@&${checkdj}>`
          ),
        ],
      });
    }
    if (!message.member.voice.channelId)
      return message.reply({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You must be in a voice channel to play music!`
          ),
        ],
      });

    if (
      message.guild.me.voice.channelId &&
      message.member.voice.channelId !== message.guild.me.voice.channelId
    )
      return await message.reply({
        embeds: [embedMessage("RED", `❌ | You must be in my voice channel!`)],
      });
    const user = message.member.user;

    await new Music().play(songString, message, client, user);
  },
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("plays music from Youtube")
    .addStringOption((option) =>
      option.setName("song").setDescription("song name").setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply();

    if (!interaction.member.voice.channelId)
      return await interaction.followUp({
        embeds: [
          embedMessage(
            "RED",
            `❌ | You must be in a voice channel to play music!`
          ),
        ],
      });

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      return await interaction.followUp({
        embeds: [embedMessage("RED", `❌ | You must be in my voice channel!`)],
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
            "RED",
            `You are not allowed to use this command.\n This command is only available for users with the DJ Role: <@&${checkdj}>`
          ),
        ],
      });
    }

    const songString = interaction.options.getString("song");
    const searchSong = await client.player.search(songString, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });

    if (!searchSong.tracks.length || !searchSong)
      return interaction.followUp({
        embeds: [embedMessage("RED", `❌ | Song not found`)],
      });

    let queue = await client.player.createQueue(interaction.guildId, {
      leaveOnEnd: false,
      leaveOnStop: true,
      initialVolume: 80,
      leaveOnEmptyCooldown: 60 * 1000 * 3,
      bufferingTimeout: 200,
      leaveOnEmpty: true,
      async onBeforeCreateStream(track, source, _queue) {
        if (source === "soundcloud") {
          const client_id = await playdl.getFreeClientID();
          playdl.setToken({
            soundcloud: {
              client_id: client_id,
            },
          });
          if (await playdl.so_validate(track.url)) {
            let soundCloudInfo = await playdl.soundcloud(track.url);
            return (await playdl.stream_from_info(soundCloudInfo)).stream;
          }
          return;
        }

        if (source === "youtube") {
          const validateSP = playdl.sp_validate(track.url);
          const spotifyList = ["track", "album", "playlist"];
          if (spotifyList.includes(validateSP)) {
            if (playdl.is_expired()) {
              await playdl.refreshToken();
            }
            let spotifyInfo = await playdl.spotify(track.url);
            let youtube = await playdl.search(`${spotifyInfo.name}`, {
              limit: 2,
            });
            return (
              await playdl.stream(youtube[0].url, {
                discordPlayerCompatibility: true,
                quality: 1,
              })
            ).stream;
          }

          return (
            await playdl.stream(track.url, {
              discordPlayerCompatibility: true,
              quality: 1,
            })
          ).stream;
        }
      },
    });

    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      client.player.deleteQueue(interaction.guildId);
      queue.destroy(true);
      return await interaction.followUp({
        content: "Could not join your voice channel!",
        empheral: true,
      });
    }

    searchSong.playlist
      ? queue.addTracks(searchSong.tracks)
      : queue.addTrack(searchSong.tracks[0]);

    const musicEmbed = {
      color: "#9dcc37",
      title: `${queue.playing ? "✅ Added to Queue" : "🎵  Playing"}`,
      author: {
        name: `${interaction.user.username}`,
        icon_url: `${interaction.user.avatarURL() || client.user.avatarURL()}`,
      },
      description: `Song: **[${searchSong.tracks[0].title}](${searchSong.tracks[0].url})**`,
      thumbnail: {
        url: `${searchSong.tracks[0].thumbnail}`,
      },
      fields: [
        {
          name: "Author",
          value: `${searchSong.tracks[0].author}`,
          inline: true,
        },
        {
          name: "🕓 Duration",
          value: `${searchSong.tracks[0].duration}`,
          inline: true,
        },
      ],

      timestamp: new Date(),
    };

    let playlistEmbed = {
      color: "#9dcc37",
      description: `✅ | Queued ${queue.tracks.length} Songs`,
    };

    if (!queue.playing) {
      try {
        await queue.play();
        searchSong.playlist
          ? await interaction.followUp({
              embeds: [playlistEmbed, musicEmbed],
            })
          : await interaction.followUp({
              embeds: [musicEmbed],
            });
        return;
      } catch (err) {
        client.logger(err.message, "error");
        await interaction.followUp({
          embeds: [
            embedMessage(
              "RED",
              `❌ | An error occurred while trying to play this song! \nError Message: ${err.message}`
            ),
          ],
        });
      }
    }

    if (queue.playing) {
      searchSong.playlist
        ? await interaction.followUp({ embeds: [playlistEmbed, musicEmbed] })
        : await interaction.followUp({ embeds: [musicEmbed] });
      return;
    }
  },
};
