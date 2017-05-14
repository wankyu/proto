import React from 'react';

class HelloMessage extends React.Component {
    render() {
        return (
                <html>
                <head>
                    <title>{this.props.title}</title>
                    <link rel="stylesheet" href="/css/style.css" />
                </head>
                <body>
                    <h1>Hello {this.props.name}!!</h1>
                    <div id="root"></div>
                    <div>{Date.now()}</div>
                    <script src="/js/bundle.js"></script>
                </body>
                </html>
        );
    }
}

module.exports = HelloMessage;
