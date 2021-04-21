import logo from './logo.svg';
import './App.css';
import MySpotifyTracks from './MySpotifyTracks';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <MySpotifyTracks></MySpotifyTracks>
      </header>
    </div>
  );
}

export default App;
