import React from 'react';
import './App.css';
import OBS from './obsModel';

type State = {
  LoggedIn: boolean;
}
class App extends React.Component<{}, State> {
  componentDidMount() {
    this.login();
  }

  componentWillUnmount() {
    OBS.logout();
  }

  async login() {
    try {
      await OBS.login('localhost', 4444, 'qutopia');
      this.setState({ LoggedIn: true });
    } catch (e) {
      this.setState({ LoggedIn: false });
    } finally {
      await OBS.createElements();
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        
        </header>
      </div>
    )
  }

}

export default App;
