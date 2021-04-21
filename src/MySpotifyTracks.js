// import logo from './logo.svg';
// import './MySpotifyTracks.css';
import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

function MySpotifyTracks() {
    const [tracks, setTracks] = useState([]);
    if (tracks.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-tracks`)
            .then(res => {
                setTracks(res.data.map(track => {
                    console.log(track)
                    return <tr key={track.id}>
                        <td>{track.name}</td>
                        <td><a href={track.youtubeLink}>Youtube</a></td>
                    </tr>
                }));
            })
            .catch(err => console.log(err));
    }
    return (
        <table>
            <thead>
                <tr>
                    <th>Spotify Songs</th>
                    <th>Youtube Search Links</th>
                </tr>
            </thead>
            <tbody>
                {tracks}
            </tbody>
        </table>
    );
}

export default MySpotifyTracks;
