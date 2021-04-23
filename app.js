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
        return null;
    }
}

const getMySpotifyTracks = async (params) => {
    try {
        const accessToken = await getAccessToken();
        const token = accessToken === null ? await refreshSpotifyToken() : accessToken;
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/tracks`, {
            headers: {
                authorization: `Bearer ${token}`
            },
            params: params
        });
    } catch (err) {
        try {
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyTracks(params);
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

const getMySpotifyPlaylists = async (params) => {
    try {
        const accessToken = await getAccessToken();
        const token = accessToken === null ? await refreshSpotifyToken() : accessToken;
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/playlists`, {
            headers: {
                authorization: `Bearer ${token}`
            },
            params: params
        });
    } catch (err) {
        try {
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyPlaylists(params);
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

const getMySpotifyTracksFromPlaylists = async (playlistId, params) => {
    try {
        const accessToken = await getAccessToken();
        const token = accessToken === null ? await refreshSpotifyToken() : accessToken;
        return await axios.get(`${process.env.SPOTIFY_API_URL}/playlists/${playlistId}/tracks`, {
            headers: {
                authorization: `Bearer ${token}`
            },
            params: params
        });
    } catch (err) {
        try {
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyTracksFromPlaylists(playlistId, params);
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

const getMySpotifyAlbums = async (params) => {
    try {
        const accessToken = await getAccessToken();
        const token = accessToken === null ? await refreshSpotifyToken() : accessToken;
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/albums`, {
            headers: {
                authorization: `Bearer ${token}`
            },
            params: params
        });
    } catch (err) {
        try {
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyAlbums(params);
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

const getMySpotifyTracksFromAlbums = async (albumId, params) => {
    try {
        const accessToken = await getAccessToken();
        const token = accessToken === null ? await refreshSpotifyToken() : accessToken;
        return await axios.get(`${process.env.SPOTIFY_API_URL}/albums/${albumId}`, {
            headers: {
                authorization: `Bearer ${token}`
            },
            params: params
        });
    } catch (err) {
        try {
            if (err.indexOf("open 'tmp/access_token'") > -1) return null;
            fs.rmSync(`tmp/access_token`, { encoding: 'utf-8' });
            return await getMySpotifyTracksFromAlbums(albumId, params);
        } catch (removeErr) {
            console.error(removeErr);
        }
        console.error(err);
    }
}

app.get('/youtube-track', async (req, res) => {
    const result = await axios.get(`${process.env.YOUTUBE_API_URL}/search`, {
        params: {
            key: process.env.YOUTUBE_API_KEY,
            q: req.query.search_query,
            limit: 5
        }
    });
    if (!result) return res.redirect(`https://www.youtube.com/results?search_query=${req.query.search_query}`);
    const youtubeId = result.data.items[0].id.videoId;
    res.redirect(301, `https://www.youtube.com/watch?v=${youtubeId}`);
});

app.get('/my-tracks', async (req, res) => {
    const spotifyTracks = await getMySpotifyTracks({ limit: 50 });
    const totalPages = Math.ceil(spotifyTracks.data.total / spotifyTracks.data.limit);
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
    res.status(200).send({ totalPages, tracks });
});

app.get('/my-tracks/:pageNumber', async (req, res) => {
    const spotifyTracks = await getMySpotifyTracks({ offset: req.params.pageNumber * 50, limit: 50 });
    if (!spotifyTracks) return res.status(200).send({ totalPages: 0, tracks: [] });
    const totalPages = Math.ceil(spotifyTracks.data.total / 50);
    const tracks = spotifyTracks.data.items
        .flatMap(item => item.track)
        .filter(track => track)
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
    res.status(200).send({ totalPages, tracks });
});

app.get('/my-playlists/:pageNumber', async (req, res) => {
    const spotifyPlaylists = await getMySpotifyPlaylists({ offset: req.params.pageNumber * 50, limit: 50 });
    if (!spotifyPlaylists) return res.status(200).send({ totalPages: 0, tracks: [] });
    const totalPages = Math.ceil(spotifyPlaylists.data.total / 50);
    const playlists = spotifyPlaylists.data.items
        .flatMap(item => {
            return {
                id: item.id,
                name: item.name,
                tracks: item.tracks,
                images: item.images
            }
        })
        .filter(item => item.tracks && item.images)
        .map(item => {
            const image = item.images.filter(image => image.height === 640)[0].url;
            return {
                id: item.id,
                name: item.name,
                href: item.tracks.href,
                total: item.tracks.total,
                image: image
            }
        });
    res.status(200).send({ totalPages, playlists });
});

app.get('/my-playlists/:playlistId/tracks/:trackPageNumber', async (req, res) => {
    const spotifyPlaylistTracks = await getMySpotifyTracksFromPlaylists(
        req.params.playlistId,
        { offset: req.params.trackPageNumber, limit: 50 }
    );
    if (!spotifyPlaylistTracks) return res.status(200).send({ totalPages: 0, tracks: [] });
    const totalPages = Math.ceil(spotifyPlaylistTracks.data.total / 50);
    const tracks = spotifyPlaylistTracks.data.items
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
    res.status(200).send({ totalPages, tracks });
});

app.get('/my-albums/:pageNumber', async (req, res) => {
    const spotifyAlbums = await getMySpotifyAlbums({ offset: req.params.pageNumber * 50, limit: 50 });
    if (!spotifyAlbums) return res.status(200).send({ totalPages: 0, tracks: [] });
    const totalPages = Math.ceil(spotifyAlbums.data.total / 50);
    const albums = spotifyAlbums.data.items
        .flatMap(item => item.album)
        .filter(album => album.tracks && album.images)
        .map(album => {
            const largestImages = album.images.filter(image => image.height === 640);
            const image = largestImages.length > 0 ? largestImages[0].url : album.images.sort((a, b) => a - b)[0];
            return {
                id: album.id,
                name: album.name,
                href: album.tracks.href,
                total: album.tracks.total,
                image: image
            }
        });
    res.status(200).send({ totalPages, albums });
});

app.get('/my-albums/:albumId/tracks', async (req, res) => {
    const spotifyAlbumTracks = await getMySpotifyTracksFromAlbums(
        req.params.albumId,
        { limit: 50 }
    );
    if (!spotifyAlbumTracks) return res.status(200).send({ totalPages: 0, tracks: [] });
    const totalPages = Math.ceil(spotifyAlbumTracks.data.tracks.total / 50);
    const image = spotifyAlbumTracks.data.images.filter(img => img.height === 640)[0].url;
    const tracks = spotifyAlbumTracks.data.tracks.items
        .map(track => {
            const artists = track.artists.map(a => a.name);
            const youtubeLink = encodeURI(`https://www.youtube.com/results?search_query=${artists.join(' ')} ${track.name}`);
            return {
                name: track.name,
                id: track.id,
                artists: artists,
                youtubeLink: youtubeLink
            }
        });
    res.status(200).send({ totalPages, image, tracks });
});

app.listen(port, () => {
    console.log(`SpotTube listening at http://localhost:${port}`);
});
