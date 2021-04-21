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
                    return (
                        <div key={track.id} className="column is-one-quarter">
                            <div className="card">
                                <div className="card-content">
                                    <div className="media">
                                        <div className="media-left">
                                            <figure className="image is-64x64">
                                                <img src={track.image}></img>
                                            </figure>
                                        </div>
                                        <div className="media-content">
                                            <p className="title is-4">{track.name}</p>
                                            <p className="subtitle is-6">by {track.artists.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>
                                <footer className="card-footer">
                                    <p className="card-footer-item">
                                        <span>
                                            Search <a href={track.youtubeLink}>Youtube</a>
                                        </span>
                                    </p>
                                </footer>
                            </div>
                        </div>
                    )
                }));
            })
            .catch(err => console.log(err));
    }
    return (
        <section className="section">
            <div className="container">
                <div className="columns is-multiline is-2">
                    {tracks}
                </div>
            </div>
        </section>
    );
}

export default MySpotifyTracks;
