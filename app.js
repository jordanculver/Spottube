const express = require('express');
const app = express();
const port = 4732;
const path = require('path');
const axios = require('axios').default;
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

app.use(cors());
app.use('/static', express.static('build'));
app.use('/static/css', express.static('build/static/css'));
app.use('/static/js', express.static('build/static/js'));
app.use('/static/media', express.static('build/static/media'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

const refreshSpotifyToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', process.env.SPOTIFY_REFRESH_TOKEN);
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: process.env.SPOTIFY_CLIENT_ID,
            password: process.env.SPOTIFY_CLIENT_SECRET
        }
    };
    const res = await axios.post(`${process.env.SPOTIFY_ACCOUNT_URL}/api/token`, params, config);
    try {
        fs.writeFileSync(`tmp/access_token`, res.data.access_token);
    } catch (err) {
        console.error(err);
    }
    return res.data.access_token;
}

const getAccessToken = async () => {
    try {
        return fs.readFileSync(`tmp/access_token`, { encoding: 'utf-8' });
    } catch (err) {
        console.error(err);
        return await refreshSpotifyToken();
    }
}

const getMySpotifyTracks = async () => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/tracks`, {
            headers: {
                authorization: `Bearer ${await getAccessToken()}`
            }
        });
    } catch (err) {
        try {
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyTracks();
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

app.get('/my-tracks', async (req, res) => {
    const spotifyTracks = await getMySpotifyTracks();
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
