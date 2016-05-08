import React from 'react';

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = {lang : 'ru'};
  }

  render() {
    return (
      <div>
        It's a header
      </div>
    );
  }

}

export default Header;
