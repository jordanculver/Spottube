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

const getSpotifyAccessToken = async () => {
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
    return res.data.access_token;
}

const getYoutubeAccessToken = async () => {
    const res = await axios.post(process.env.GOOGLE_AUTH_URL, null, {
        params: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
        }
    });
    return res.data.access_token;
}

const getMySpotifyTracks = async (params) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/tracks`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: params
        });
    } catch (err) {
        console.error(err);
        return {
            data: { total: 0, limit: params.limit, items: [] }
        }
    }
}

const getMySpotifyPlaylists = async (params) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/playlists`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: params
        });
    } catch (err) {
        console.error(err);
        return {
            data: {
                total: 0,
                items: []
            }
        }
    }
}

const getMySpotifyTracksFromPlaylists = async (playlistId, params) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/playlists/${playlistId}/tracks`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: params
        });
    } catch (err) {
        console.error(err);
        return {
            data: {
                total: 0,
                items: []
            }
        }
    }
}

const getMySpotifyAlbums = async (params) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/me/albums`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: params
        });
    } catch (err) {
        console.error(err);
        return {
            data: {
                total: 0,
                items: []
            }
        }
    }
}

const getMySpotifyTracksFromAlbums = async (albumId, params) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/albums/${albumId}`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: params
        });
    } catch (err) {
        console.error(err);
        return {
            data: {
                tracks: {
                    total: 0,
                    items: []
                },
                images: []
            }
        }
    }
}

const searchSpotifyTracks = async (query, limit, offset) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/search`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: {
                limit: limit,
                offset: offset,
                q: query,
                type: 'track'
            }
        });
    } catch (err) {
        console.error(err);
        return {
            data: {
                tracks: {
                    total: 0,
                    items: []
                }
            }
        };
    }
}

const getPlaylist = async (id) => {
    try {
        return await axios.get(`${process.env.SPOTIFY_API_URL}/playlists/${id}`, {
            headers: {
                authorization: `Bearer ${await getSpotifyAccessToken()}`
            },
            params: {
                fields: 'name,description,tracks.items(track(name,artists(name)))'
            }
        });
    } catch (err) {
        console.error(err);
        return null;
    }
}

const getYoutubePlaylist = async (spotifyPlaylist) => {
    try {
        return await axios.post(`${process.env.YOUTUBE_API_URL}/playlists`,
            {
                snippet: {
                    title: spotifyPlaylist.data.name,
                    description: spotifyPlaylist.data.description
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${await getYoutubeAccessToken()}`
                },
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    part: 'snippet'
                }
            }
        );
    } catch (err) {
        console.error(err);
        return null;
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

app.get('/youtube-auth', async (req, res) => {
    console.log(req.query.code);
    res.redirect(301, '/');
});

app.get('/youtube-export/:playlistId', async (req, res) => {
    const spotifyPlaylist = await getPlaylist(req.params.playlistId);
    if (!spotifyPlaylist) return res.redirect(302, `${process.env.REACT_APP_SERVER_URL}/`);
    const youtubePlaylist = await getYoutubePlaylist(spotifyPlaylist);
    if (!youtubePlaylist) return res.redirect(302, `${process.env.REACT_APP_SERVER_URL}/`);
    for (var i = 0; i < spotifyPlaylist.data.tracks.items.length; i++) {
        const track = spotifyPlaylist.data.tracks.items[i].track;
        const videos = await axios.get(`${process.env.YOUTUBE_API_URL}/search`, {
            params: {
                key: process.env.YOUTUBE_API_KEY,
                q: `${track.artists.map(a => a.name).join(' ')} ${track.name}`,
                limit: 5
            }
        });
        await axios.post(`${process.env.YOUTUBE_API_URL}/playlistItems`,
            {
                snippet: {
                    playlistId: youtubePlaylist.data.id,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videos.data.items[0].id.videoId
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${await getYoutubeAccessToken()}`
                },
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    part: 'snippet'
                }
            }
        );
    }
    res.redirect(302, `https://youtube.com/playlist?list=${youtubePlaylist.data.id}`);
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
            const largestImages = item.images.filter(image => image.height === 640);
            const image = largestImages.length > 0 ? largestImages[0].url : item.images.sort((a, b) => a - b)[0];
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
    const totalPages = Math.ceil(spotifyAlbumTracks.data.tracks.total / 50);
    const largestImages = spotifyAlbumTracks.data.images.filter(image => image.height === 640);
    const image = largestImages.length > 0 ? largestImages[0].url : item.images.sort((a, b) => a - b)[0];
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

app.get('/search/:pageNumber', async (req, res) => {
    const spotifyTracks = await searchSpotifyTracks(
        req.query.search_query,
        50,
        req.params.pageNumber * 50
    );
    const pageCount = Math.ceil(spotifyTracks.data.tracks.total / 50);
    const totalPages = pageCount > 10 ? 10 : pageCount;
    const tracks = spotifyTracks.data.tracks.items
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

app.listen(port, () => {
    console.log(`Spottube listening at http://localhost:${port}`);
});
