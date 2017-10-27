import React from 'react';

const Form = (props) => {
    return (
        <form action="./login" method="post">
            <fieldset className="login_fieldset">
                <legend>Login</legend>
                <input name="username" type="text" placeholder="Username" />
                <input name="password" type="password" placeholder="Password" />
                <input name="referer" type="hidden" value={props.referer} />
                <input type="submit" value="Submit" />
            </fieldset>
        </form>
    );
};

class Login extends React.Component {
    render() {
        return (
                <html>
                <head>
                    <title>Login</title>
                    <link rel="stylesheet" href="./css/style.css" />
                </head>
                <body>
                    <Form referer={this.props.referer} />
                </body>
                </html>
        );
    }
}

module.exports = Login;
