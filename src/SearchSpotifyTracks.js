import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config();

function SearchSpotifyTracks() {
    const [data, setData] = useState({ tracks: [], pages: [], selectedPage: 0 });
    const [query, setQuery] = useState('');
    function handlePageSelection(e) {
        e.preventDefault();
        setData({ tracks: [], pages: [], selectedPage: parseInt(e.currentTarget.getAttribute('data-index')) });
    }
    function performSearch(e) {
        if (query.length > 0) {
            axios.get(`${process.env.REACT_APP_SERVER_URL}/search/${data.selectedPage}`, {
                params: {
                    search_query: query
                }
            }).then(res => {
                const pages = [];
                for (var i = 0; i < res.data.totalPages; i++) {
                    pages.push(
                        <li key={i}>
                            <a onClick={handlePageSelection} data-index={i} className={`pagination-link ${i === data.selectedPage ? 'is-current has-background-success' : ''}`}>{i + 1}</a>
                        </li>
                    );
                }
                const searchResults = res.data.tracks.map(track => {
                    const youtubeDirectUrl = encodeURI(`${process.env.REACT_APP_SERVER_URL}/youtube-track?search_query=${track.artists.join(' ')} ${track.name}`);
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
                                            Go to <a href={youtubeDirectUrl}>Youtube</a>
                                        </span>
                                    </p>
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
                setData({ tracks: searchResults, pages: pages, selectedPage: data.selectedPage });
            }).catch(err => console.log(err));
        }
    }
    function handleQueryChange(event) {
        setQuery(event.target.value ? event.target.value : '');
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
            <section className="section">
                <div className="container">
                    <div className="columns is-multiline is-5">
                        <div className="column is-three-fifths is-offset-one-fifth">
                            <div className="field has-addons">
                                <div className="control is-expanded">
                                    <input className="input is-medium is-rounded" type="text" value={query} onChange={handleQueryChange}></input>
                                </div>
                                <div className="control">
                                    <button onClick={performSearch} className="button is-medium is-rounded is-full-width">
                                        <span>Search</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {data.tracks}
                    </div>
                </div>
            </section>
            {data.pages.length > 1 ? pagination : <></>}
        </div>
    );
}

export default SearchSpotifyTracks;
