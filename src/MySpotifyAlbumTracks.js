import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

function MySpotifyAlbumTracks(props) {
    const [data, setData] = useState({ tracks: [] });
    function goBackToAlbums(e) {
        e.preventDefault();
        props.onBackToAlbums();
    }
    if (data.tracks.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-albums/${props.albumId}/tracks`)
            .then(res => {
                const tracks = res.data.tracks.map(track => {
                    return (
                        <div key={track.id} className="column is-half-tablet">
                            <div className="card">
                                <div className="card-content">
                                    <div className="media">
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
                });
                setData({ tracks: tracks });
            }).catch(err => console.log(err));
    }
    return (
        <div>
            <div className="columns is-full">
                <div className="column">
                    <div className="card">
                        <div className="card-content">
                            <div className="media">
                                <div className="media-left">
                                    <figure className="image is-128x128">
                                        <img src={props.albumImage}></img>
                                    </figure>
                                </div>
                                <div className="media-content">
                                    <h1 className="title">{props.albumTitle}</h1>
                                    <p className="subtitle">
                                        <a onClick={goBackToAlbums}>Back to albums</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section className="section">
                <div className="container">
                    <div className="columns is-multiline is-5">
                        {data.tracks}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MySpotifyAlbumTracks;
