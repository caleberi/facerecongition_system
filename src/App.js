import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import './App.css';
import './FaceRecognition.css';
import './Logo.css';

const particlesOptions = {
  particles: {
    line_linked: {
      number: {
        value: 40,
        density: {
          enable: true,
          value_area: 700,
        },
      },
    },
  },
};

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    password: '',
    entries: 0,
    joined: '',
  },
};
class App extends Component {
  constructor () {
    super ();
    this.state = initialState;
  }

  onInputChange = event => {
    this.setState ({input: event.target.value});
  };
  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById ('inputimage');
    const width = Number (image.width);
    const height = Number (image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  loadUser = user => {
    const {id, name, password, entries, joined} = user;
    console.log (user);
    this.setState ({
      user: {
        id: id,
        name: name,
        password: password,
        entries: entries,
        joined: joined,
      },
    });
    console.log (this.state);
  };
  drawFaceBox = boxData => {
    this.setState ({box: boxData});
  };
  onRouteChange = route => {
    if (route === 'signout') {
      this.setState (initialState);
    } else if (route === 'home') {
      this.setState ({isSignedIn: true});
    }
    this.setState ({route});
  };
  onSubmit = event => {
    this.setState ({imageUrl: this.state.input});
    event.preventDefault ();
    fetch ('http://localhost:3001/imageUrl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify ({
        input: this.state.input,
      }),
    })
      .then (res => res.json ())
      .then (res => {
        if (res) {
          fetch ('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify ({
              id: this.state.user.id,
            }),
          })
            .then (res => res.json ())
            .then (count => {
              this.setState (Object.assign (this.state.user, {entries: count}));
            })
            .catch (err => console.log (err));
        }
        this.drawFaceBox (this.calculateFaceLocation (res));
      })
      .catch (err => console.log (err));
  };
  render () {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          isSignedIn={this.state.isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank user={this.state.user} />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onSubmit={this.onSubmit}
              />
              <FaceRecognition
                box={this.state.box}
                imageUrl={this.state.imageUrl}
              />
            </div>
          : this.state.route === 'register'
              ? <Register
                  loadUser={this.loadUser}
                  onRouteChange={this.onRouteChange}
                />
              : <SignIn
                  loadUser={this.loadUser}
                  onRouteChange={this.onRouteChange}
                />}
      </div>
    );
  }
}

export default App;
