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

const LinkStemView = (props) => 
    <button
        className="remove_link"
        type="submit"
        value="Remove Link"
        aria-label="Remove Link"
        {...props}
    />

const ResultView = (props) => {
    return (
        <ReactMarkdown
            className="result"
            softBreak="br"
            escapeHtml
            skipHtml
            source={props.value}
        />
    );
};

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillUnmount() {
    }
    handleChange(e) {
        this.props.onValueChange(e);
    }
    render() {
        let value = this.props.value;
        return (
            <InputView
                value={value}
                onChange={this.handleChange}
                onBlur={this.props.onBlur}
            />
        );
    }
}

class LinkStem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {style: {}};
    }
    componentDidMount() {
    }
    render() {
        return (
            <LinkStemView
                style={this.state.style}
                data-node-to={this.props.node_to_id}
                onClick={this.props.onRemoveLink}
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
            node_links: props.node_links,
            style: {},
        };
        this.linkPositions = [];
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleAddChild = this.handleAddChild.bind(this);
        this.handleAddLink = this.handleAddLink.bind(this);
        this.handleRemoveLink = this.handleRemoveLink.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    componentWillMount() {
    }
    componentDidMount() {
        let el = ReactDOM.findDOMNode(this);
        this.setPosition();
        if(this.props.is_logged_in && this.props.Draggable) {
            this.props.Draggable.appendElement(el);
            el.classList.add('is_draggable');
        }
        if(this.props.is_logged_in && this.props.Linkable) {
            this.props.Linkable.appendElement(el.querySelector('.add_link'));
        }
        if(this.props.Stems) {
            if(this.state.node_parent != 0) {
                if(document.getElementById(this.state.node_parent))
                    this.props.Stems.addAscendent(
                        document.getElementById(this.state.node_parent),
                        document.getElementById(this.state.node_id)
                    );
            }
            this.state.node_links.forEach((node_to_id, i, arr) => {
                this.props.Stems.addEquivalent(
                    document.getElementById(this.state.node_id),
                    document.getElementById(node_to_id)
                );
            });
        }
    }
    componentDidUpdate() {
        this.props.Stems.redraw();
    }
    handleValueChange(e) {
        this.setState({value: e.target.value});
    }
    handleBlur(e) {
        this.handleSubmit(e);
    }
    handleMouseDown(e) {
        if(this.props.is_logged_in && this.props.Draggable) {
            if(e.target.tagName.match(/TEXTAREA|INPUT|BUTTON/)) return;
            document.addEventListener('mouseup', this.handleSubmit, {capture: false, once: true});
        }
    }
    handleCreate() {
    }
    handleAddChild(e) {
        e.preventDefault();
        this.props.onCreateNode(this.state.node_id, this.state.position);
    }
    handleAddLink(e) {
        e.preventDefault();
        this.props.onAddLink(this.state.node_id);
    }
    handleRemoveLink(e) {
        e.preventDefault();
        let from_id = this.state.node_id;
        let to_id = e.target.dataset['nodeTo'];
        this.props.onRemoveLink(from_id, to_id);
    }
    handleSubmit(e) {
        //console.log(ReactDOM.findDOMNode(this).offsetParent);
        if(e && e.preventDefault) e.preventDefault();
        this.setState({position: this.getPosition()});
        this.props.onUpdateNode(this.state.node_id, {
            value: this.state.value,
            position: this.state.position,
        });
    }
    handleDelete(e) {
        e.preventDefault();
        this.props.onDeleteNode(this.state.node_id);
    }
    setPosition() {
        let sum = this.state.position;
        this.setState({style: Object.assign(this.state.style, {top: `${sum >> 16 & 0xffff}px`, left:  `${sum & 0xffff}px`})});
    }
    setLink() {
    }
    getPosition() {
        let el = ReactDOM.findDOMNode(this);
        let [y, x] = [
                Math.max(0, el.offsetTop - parseInt(window.getComputedStyle(el).marginTop)),
                Math.max(0, el.offsetLeft - parseInt(window.getComputedStyle(el).marginLeft)),
            ];
        let sum = y << 16 | x;
        return sum;
    }
    render() {
        return (
            <div id={this.state.node_id} className="node"
                data-position={this.state.position}
                //data-parent_id={this.state.node_parent}
                style={this.state.style}
                onMouseDown={this.handleMouseDown}
            >
                {(this.props.is_logged_in)?
                    <form onSubmit={this.handleSubmit}>
                        <Input value={this.state.value} onValueChange={this.handleValueChange} onBlur={this.handleBlur} />
                        <button className="submit" type="submit" value="Submit" />
                        <button className="add_child" type="submit" value="Add Child" aria-label="Add Child" onClick={this.handleAddChild} />
                        <button className="add_link" type="submit" value="Add Link" aria-label="Add Link" onMouseDown={this.handleAddLink} />
                        <button className="delete" type="submit" value="Delete" aria-label="Delete" onClick={this.handleDelete} />
                        {this.props.node_links.map((link, index) => (
                            <LinkStem 
                                key={link}
                                node_from_id={this.state.node_id}
                                node_to_id={link}
                                onRemoveLink={this.handleRemoveLink}
                            />
                        ))}
                    </form>
                    :''}
                <Result value={this.state.value} />
            </div>
        );
    }
}

export default Node;
