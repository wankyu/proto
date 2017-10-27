import React from 'react';

const LoginButton = (props) => {
    return (
        <a className="login" href="./login">
            {(props.isLoggedIn)?'log out':'log in'}
        </a>
    )
};

class HelloMessage extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let is_logged_in = this.props.isLoggedIn || false;
        let root_node_id = this.props.rootNodeId || '';
        return (
                <html>
                <head>
                    <title>Test</title>
                    <link rel="stylesheet" href="./css/style.css" />
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                </head>
                <body>
                    <div className="header">
                        <LoginButton isLoggedIn={is_logged_in} />
                        <a className="home" href="./">Home</a>
                    </div>
                    <div id="nodes-wrap" className="nodes-wrap"></div>
                    <script src={"./js/nodes.js?" + root_node_id}></script>
                </body>
                </html>
        );
    }
}

module.exports = HelloMessage;
