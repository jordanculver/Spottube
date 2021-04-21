import logo from './spottube.svg';
import MySpotifyTracks from './MySpotifyTracks';

function App() {
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
      <section className="section">
        <div className="container">
          <MySpotifyTracks></MySpotifyTracks>
        </div>
      </section>
    </div>
  );
}

export default App;
