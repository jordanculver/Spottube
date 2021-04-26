import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
import MySpotifyPlaylistTracks from './MySpotifyPlaylistTracks';
dotenv.config();

function MySpotifyPlaylists() {
    const [data, setData] = useState({ playlists: [], pages: [], selectedPage: 0 });
    const [playlist, setPlaylist] = useState(null);
    function handlePageSelection(e) {
        e.preventDefault();
        setData({ playlists: [], pages: [], selectedPage: parseInt(e.currentTarget.getAttribute('data-index')) });
    }
    function loadPlaylist(e) {
        e.preventDefault();
        setPlaylist({
            id: e.currentTarget.getAttribute('data-id'),
            title: e.currentTarget.getAttribute('data-title'),
            image: e.currentTarget.getAttribute('data-image')
        });
    }
    function resetPlaylists() {
        setPlaylist(null);
    }
    if (data.playlists.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-playlists/${data.selectedPage}`)
            .then(res => {
                const pages = [];
                for (var i = 0; i < res.data.totalPages; i++) {
                    pages.push(
                        <li key={i}>
                            <a onClick={handlePageSelection} data-index={i} className={`pagination-link ${i === data.selectedPage ? 'is-current has-background-success' : ''}`}>{i + 1}</a>
                        </li>
                    );
                }
                const playlists = res.data.playlists.map(playlist => {
                    return (
                        <div key={playlist.id} className="column is-half-tablet">
                            <div className="card">
                                <div className="card-content">
                                    <div className="media">
                                        <div className="media-left">
                                            <figure className="image is-64x64">
                                                <img src={playlist.image}></img>
                                            </figure>
                                        </div>
                                        <div className="media-content">
                                            <p className="title is-4">{playlist.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <footer className="card-footer">
                                    <p className="card-footer-item">
                                        <span>
                                            Go to <a
                                                data-id={playlist.id}
                                                data-title={playlist.name}
                                                data-image={playlist.image}
                                                href="#"
                                                onClick={loadPlaylist}>Playlist</a>
                                        </span>
                                    </p>
                                </footer>
                            </div>
                        </div>
                    )
                });
                setData({ playlists: playlists, pages: pages, selectedPage: data.selectedPage });
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
            <section className="section">
                <div className="container">
                    <div className="columns is-multiline is-5">
                        {playlist === null ? data.playlists : <></>}
                        {playlist !== null ?
                            <MySpotifyPlaylistTracks
                                playlistId={playlist.id}
                                playlistTitle={playlist.title}
                                playlistImage={playlist.image}
                                onBackToPlaylists={resetPlaylists}>
                            </MySpotifyPlaylistTracks>
                            : <></>
                        }
                    </div>
                </div>
            </section>
            {data.pages.length > 1 ? pagination : <></>}
        </div>
    );
}

export default MySpotifyPlaylists;
