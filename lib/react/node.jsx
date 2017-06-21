import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';

const InputView = (props) => {
    return (
        <textarea
            className="input"
            {...props}
        ></textarea>
    );
};

const ResultView = (props) => {
    return (
        <ReactMarkdown
            className="result"
            source={props.value}
            softBreak="br"
            escapeHtml
            skipHtml
        />
    );
};

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillUnmount() {
    }
    handleChange(e) {
        this.setState({value: e.target.value});
        this.props.onValueChange(e.target.value);
    }
    render() {
        let value = this.state.value;
        return (
            <InputView
                value={value}
                onChange={this.handleChange}
                onBlur={this.props.onBlur}
            />
        );
    }
}

class Result extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
    }
    render() {
        return (
            <ResultView value={this.props.value} />
        );
    }
}

class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            node_id: props.node_id,
            value: props.value,
            position: props.position,
            node_parent: props.node_parent,
            style: {},
        };
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    componentWillMount() {
    }
    componentDidMount() {
        let el = ReactDOM.findDOMNode(this);
        if(this.state.node_id == -1) {
            this.handleCreate();
            this.getPosition();
        }
        if(this.props.Draggable) {
            let el = ReactDOM.findDOMNode(this);
            el.classList.add('is_draggable');
            this.props.Draggable.appendElement(el);
            this.setPosition();
        }
    }
    handleValueChange(data) {
        this.setState({value: data});
    }
    handleBlur(e) {
        this.handleSubmit();
    }
    handleMouseDown(e) {
        if(this.props.Draggable) {
            if(e.target.tagName.match(/TEXTAREA|INPUT/)) return;
            document.addEventListener('mouseup', this.handleSubmit, {capture: false, once: true});
        }
    }
    handleCreate() {
        fetch('/node', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                $value: '',
                $time: Date.now(),
                $position: this.getPosition(),
                $node_parent: this.state.node_parent,
            })
        }).then((res) => {
            return res.json();
        }).then((res) => {
            this.setState({node_id: res.node_id});
            this.props.onUpdateNode('-1', this.state);
        });
    }
    handleSubmit(e) {
        //console.log(ReactDOM.findDOMNode(this).offsetParent);
        if(typeof e !== 'undefined') e.preventDefault();
        fetch('/node/' + this.state.node_id, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                $value: this.state.value,
                $time: Date.now(),
                $position: this.getPosition(),
                $node_parent: this.state.node_parent,
            })
        });
        this.props.onUpdateNode(this.state.node_id, this.state);
    }
    handleDelete(e) {
        e.preventDefault();
        fetch('/node/' + this.state.node_id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });
        this.props.onDeleteNode(this.state.node_id);
    }
    setPosition() {
        let sum = this.state.position;
        this.setState({style: {top: `${sum >> 16 & 0xffff}px`, left:  `${sum & 0xffff}px`}});
    }
    getPosition() {
        let el = ReactDOM.findDOMNode(this);
        let [y, x] = [
                Math.max(0, el.offsetTop - parseInt(window.getComputedStyle(el).marginTop)),
                Math.max(0, el.offsetLeft - parseInt(window.getComputedStyle(el).marginLeft)),
            ];
        let sum = y << 16 | x;
        this.setState({position: sum});
        return sum;
    }
    render() {
        return (
            <div id={this.state.node_id} className="node"
                data-position={this.state.position}
                style={this.state.style}
                onMouseDown={this.handleMouseDown}
            >
                <form onSubmit={this.handleSubmit}>
                    <Input value={this.state.value} onValueChange={this.handleValueChange} onBlur={this.handleBlur} />
                    <button className="submit" type="submit" value="Submit" />
                    <button className="delete" type="submit" value="Delete" onClick={this.handleDelete} />
                </form>
                <Result value={this.state.value} />
            </div>
        );
    }
}

export default Node;
