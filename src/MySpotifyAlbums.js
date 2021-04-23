import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv'
import MySpotifyAlbumTracks from './MySpotifyAlbumTracks';
dotenv.config();

function MySpotifyAlbums() {
    const [data, setData] = useState({ albums: [], pages: [], selectedPage: 0 });
    const [album, setAlbum] = useState(null);
    function handlePageSelection(e) {
        e.preventDefault();
        setData({ albums: [], pages: [], selectedPage: parseInt(e.currentTarget.getAttribute('data-index')) });
    }
    function loadAlbum(e) {
        e.preventDefault();
        setAlbum({
            id: e.currentTarget.getAttribute('data-id'),
            title: e.currentTarget.getAttribute('data-title'),
            image: e.currentTarget.getAttribute('data-image')
        });
    }
    function resetAlbums() {
        setAlbum(null);
    }
    if (data.albums.length === 0) {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/my-albums/${data.selectedPage}`)
            .then(res => {
                const pages = [];
                for (var i = 0; i < res.data.totalPages; i++) {
                    pages.push(
                        <li key={i}>
                            <a onClick={handlePageSelection} data-index={i} className={`pagination-link ${i === data.selectedPage ? 'is-current has-background-success' : ''}`}>{i + 1}</a>
                        </li>
                    );
                }
                const albums = res.data.albums.map(album => {
                    return (
                        <div key={album.id} className="column is-half-tablet">
                            <div className="card">
                                <div className="card-content">
                                    <div className="media">
                                        <div className="media-left">
                                            <figure className="image is-64x64">
                                                <img src={album.image}></img>
                                            </figure>
                                        </div>
                                        <div className="media-content">
                                            <p className="title is-4">{album.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <footer className="card-footer">
                                    <p className="card-footer-item">
                                        <span>
                                            Go to <a
                                                data-id={album.id}
                                                data-title={album.name}
                                                data-image={album.image}
                                                href="#"
                                                onClick={loadAlbum}>Album</a>
                                        </span>
                                    </p>
                                </footer>
                            </div>
                        </div>
                    )
                });
                setData({ albums: albums, pages: pages, selectedPage: data.selectedPage });
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
            {data.pages.length > 1 && album === null ? pagination : <></>}
            <section className="section">
                <div className="container">
                    <div className="columns is-multiline is-5">
                        {album === null ? data.albums : <></>}
                        {album !== null ?
                            <MySpotifyAlbumTracks
                                albumId={album.id}
                                albumTitle={album.title}
                                albumImage={album.image}
                                onBackToAlbums={resetAlbums}>
                            </MySpotifyAlbumTracks>
                            : <></>
                        }
                    </div>
                </div>
            </section>
            {data.pages.length > 1 && album === null ? pagination : <></>}
        </div>
    );
}

export default MySpotifyAlbums;
