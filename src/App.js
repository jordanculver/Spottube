import React, { useState } from 'react';
import logo from './spottube.svg';
import MySpotifyTracks from './MySpotifyTracks';
import MySpotifyPlaylists from './MySpotifyPlaylists';
import MySpotifyAlbums from './MySpotifyAlbums';

function App() {
  const tabs = {
    TRACKS: 'my_tracks',
    PLAYLISTS: 'my_playlists',
    ALBUMS: 'my_albums'
  }
  const [tab, setTab] = useState(tabs.TRACKS);
  return (
    <div>
      <nav className="navbar" role="navigation">
        <div className="navbar-brand">
          <a href="#">
            <img className="navbar-item" width="112" height="28" src={logo}></img>
          </a>
          <div className="navbar-item">
            <h1 className="title">SpotTube - Find your Spotify songs on Youtube!</h1>
          </div>
        </div>
      </nav>
      <div className="tabs is-centered is-large">
        <ul>
          <li className={tab === tabs.TRACKS ? 'is-active' : ''}>
            <a onClick={(e) => { e.preventDefault(); setTab(tabs.TRACKS) }}>My Tracks</a>
          </li>
          <li className={tab === tabs.PLAYLISTS ? 'is-active' : ''}>
            <a onClick={(e) => { e.preventDefault(); setTab(tabs.PLAYLISTS) }}>My Playlists</a>
          </li>
          <li className={tab === tabs.ALBUMS ? 'is-active' : ''}>
            <a onClick={(e) => { e.preventDefault(); setTab(tabs.ALBUMS) }}>My Albums</a>
          </li>
        </ul>
      </div>
      <section className="section">
        <div className="container">
          {tab === tabs.TRACKS ? <MySpotifyTracks></MySpotifyTracks> : <></>}
          {tab === tabs.PLAYLISTS ? <MySpotifyPlaylists></MySpotifyPlaylists> : <></>}
          {tab === tabs.ALBUMS ? <MySpotifyAlbums></MySpotifyAlbums> : <></>}
        </div>
      </section>
    </div>
  );
}

export default App;
