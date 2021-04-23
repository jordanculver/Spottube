import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

function MySpotifyPlaylistTracks(props) {
    const [data, setData] = useState({ tracks: [], pages: [], selectedPage: 0 });
    function handlePageSelection(e) {
        e.preventDefault();
        setData({ tracks: [], pages: [], selectedPage: parseInt(e.currentTarget.getAttribute('data-index')) });
    }
    function goBackToPlaylists(e) {
        e.preventDefault();
        props.onBackToPlaylists();
    }
    if (data.tracks.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-playlists/${props.playlistId}/tracks/${data.selectedPage}`)
            .then(res => {
                const pages = [];
                for (var i = 0; i < res.data.totalPages; i++) {
                    pages.push(
                        <li key={i}>
                            <a onClick={handlePageSelection} data-index={i} className={`pagination-link ${i === data.selectedPage ? 'is-current has-background-success' : ''}`}>{i + 1}</a>
                        </li>
                    );
                }
                const tracks = res.data.tracks.map(track => {
                    return (
                        <div key={track.id} className="column is-half-tablet">
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
                });
                setData({ tracks: tracks, pages: pages, selectedPage: data.selectedPage });
            }).catch(err => console.log(err));
    }
    const pagination = (
        <section className="section">
            <div className="container">
                <nav className="pagination is-centered" role="navigation">
                    <ul className="pagination-list">
                        {data.pages}
                    </ul>
                </nav>
            </div>
        </section>
    );
    return (
        <div>
            {data.pages.length > 1 ? pagination : <></>}
            <div className="columns is-full">
                <div className="column">
                    <div className="card">
                        <div className="card-content">
                            <div className="media">
                                <div className="media-left">
                                    <figure className="image is-128x128">
                                        <img src={props.playlistImage}></img>
                                    </figure>
                                </div>
                                <div className="media-content">
                                    <h1 className="title">{props.playlistTitle}</h1>
                                    <p className="subtitle">
                                        <a onClick={goBackToPlaylists}>Back to playlists</a>
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
            {data.pages.length > 1 ? pagination : <></>}
        </div>
    );
}

export default MySpotifyPlaylistTracks;
