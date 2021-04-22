import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

function MySpotifyTracks() {
    const [data, setData] = useState({ tracks: [], pages: [], selectedPage: 0 });
    function handlePageSelection(e) {
        e.preventDefault();
        setData({ tracks: [], pages: [], selectedPage: parseInt(e.currentTarget.getAttribute('data-index')) });
    }
    if (data.tracks.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-tracks/${data.selectedPage}`)
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
            {pagination}
            <section className="section">
                <div className="container">
                    <div className="columns is-multiline is-5">
                        {data.tracks}
                    </div>
                </div>
            </section>
            {pagination}
        </div>
    );
}

export default MySpotifyTracks;
