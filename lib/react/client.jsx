import React from 'react';
import ReactDOM from 'react-dom';

class Sample extends React.Component {
    render() {
        return <div id="root">{Date.now()} !!!!</div>
    }
}

window.onload = () => {
    ReactDOM.render(
        <Sample/>,
        document.getElementById('root')
    );
};

