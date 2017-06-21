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
                    <h5>{this.props.title}</h5>
                    <div id="root"></div>
                    <script src="/js/nodes.js"></script>
                </body>
                </html>
        );
    }
}

module.exports = HelloMessage;
