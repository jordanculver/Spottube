const express = require('express');
const app = express();
const port = 4732;
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use('/static', express.static('build'));
app.use('/static/css', express.static('build/static/css'));
app.use('/static/js', express.static('build/static/js'));
app.use('/static/media', express.static('build/static/media'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.get('/my-tracks', async (req, res) => {
    const spotifyTracks = await axios.get(`${process.env.SPOTIFY_API_URL}/me/tracks`, {
        headers: {
            authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
        }
    });
    const tracks = spotifyTracks.data.items
        .flatMap(item => item.track)
        .map(track => {
            const artists = track.artists.map(a => a.name);
            const youtubeLink = encodeURI(`https://www.youtube.com/results?search_query=${artists.join(' ')} ${track.name}`);
            const image = track.album.images.filter(image => image.height === 64)[0].url;
            return {
                name: track.name,
                id: track.id,
                artists: artists,
                youtubeLink: youtubeLink,
                image: image
            }
        });
    res.status(200).send(tracks);
});

app.listen(port, () => {
    console.log(`SpotTube listening at http://localhost:${port}`);
});
