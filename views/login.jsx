import React from 'react';

const Result = (props) => {
    return (
        <div>
            <p>{Date.now()}</p>
            <p>Name: {props.test}</p>
            <p>Password Correct: {props.checkpw.toString()}</p>
        </div>
   );
};

const Form = (props) => {
    return (
        <form action="./login" method="post">
            <input name="username" type="text" placeholder="Username" />
            <input name="password" type="password" placeholder="Password" />
            <input name="referer" type="hidden" value={props.referer} />
            <input type="submit" value="Submit" />
        </form>
    );
};

class Login extends React.Component {
    render() {
        return (
                <html>
                <head>
                    <title>Login</title>
                    <link rel="stylesheet" href="/css/style.css" />
                </head>
                <body>
                    <h5>Login</h5>
                    <Result {...this.props} />
                    <Form referer={this.props.referer} />
                </body>
                </html>
        );
    }
}

module.exports = Login;
