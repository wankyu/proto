import React from 'react';

const LoginButton = (props) => {
    return (
        <a className="login" href="/login">
            {(props.isLoggedIn)?'log out':'log in'}
        </a>
    )
};

class HelloMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: this.props.isLoggedIn || false
        };
    }
    render() {
        let is_logged_in = this.state.isLoggedIn;
        return (
                <html>
                <head>
                    <title>Test</title>
                    <link rel="stylesheet" href="/css/style.css" />
                </head>
                <body>
                    <LoginButton isLoggedIn={is_logged_in} />
                    <div id="nodes-wrap" className="nodes-wrap"></div>
                    <script src="/js/nodes.js"></script>
                </body>
                </html>
        );
    }
}

module.exports = HelloMessage;
