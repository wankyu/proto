import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import fSum from '../lib/sum';
const Sum = new fSum(4, 2);

const config = {
    title_declarator: "[#title#]:"
};

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
            source={props.value}
        />
    );
};

class Input extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillUnmount() {
    }
    render() {
        return (
            <InputView
                value={this.props.value}
                onChange={this.props.onValueChange}
                onFocus={this.props.onFocus}
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
            title: props.title,
            value: props.value,
            position: props.position,
            node_parent: props.node_parent,
            node_links: props.node_links,
            style: {},
        };
        this.node_el = null;
        this.linkPositions = [];
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
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
        this.checkTitle(this.state.value);
        let el = this.node_el = ReactDOM.findDOMNode(this);
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
                if(document.getElementById(node_to_id))
                    this.props.Stems.addEquivalent(
                        document.getElementById(this.state.node_id),
                        document.getElementById(node_to_id)
                    );
            });
        }
    }
    componentDidUpdate() {
    }
    handleValueChange(e) {
        let val = e.target.value;
        this.checkTitle(val);
        this.setState({value: val});
    }
    handleFocus(e) {
        this.props.onClearSelectedNodes();
    }
    handleBlur(e) {
        this.handleSubmit(e);
    }
    handleMouseDown(e) {
        if(!(this.props.is_logged_in && this.props.Draggable)) return;
        if(e.metaKey || e.ctrlKey) {
            e.preventDefault();
            this.props.onSelectNode(this.node_el, this.handleSubmit);
        } else {
            if(e.target.tagName.match(/A|TEXTAREA|INPUT|BUTTON/)) return;
            document.addEventListener('mouseup', this.handleSubmit, {capture: false, once: true});
        }
    }
    handleCreate() {
    }
    handleAddChild(e) {
        e.preventDefault();
        this.props.onCreateNode(e, this.state.node_id, this.state.position);
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
        if(e && e.preventDefault) e.preventDefault();
        this.setState({position: this.getPosition()}, () => {
            this.props.onUpdateNode(this.state.node_id, {
                title: this.state.title,
                value: this.state.value,
                position: this.state.position,
            });
        });
    }
    handleDelete(e) {
        e.preventDefault();
        this.props.onDeleteNode(this.state.node_id);
    }
    setPosition() {
        let pos = Sum.extract(this.state.position);
        this.setState({style: Object.assign(this.state.style, {top: `${pos[0]}px`, left:  `${pos[1]}px`})});
    }
    setLink() {
    }
    checkTitle(val) {
        let tit = val.split(/[\r\n]/, 1)[0].split(config.title_declarator)[1] || this.state.title; //[TODO] sanitize, check duplication
        tit = encodeURI(tit.trim());
        this.setState({title: tit});
    }
    getPosition() {
        let el = this.node_el;
        let [y, x] = [
                el.offsetTop - parseInt(window.getComputedStyle(el).marginTop),
                el.offsetLeft - parseInt(window.getComputedStyle(el).marginLeft),
            ];
        return Sum.create(y, x);
    }
    render() {
        let title = (this.state.node_id != this.state.title)?this.state.title:undefined;
        return (
            <div id={this.state.node_id} className="node"
                title={title}
                data-position={this.state.position}
                //data-parent_id={this.state.node_parent}
                style={this.state.style}
                onMouseDown={this.handleMouseDown}
            >
                {(this.props.is_logged_in)?
                    <form onSubmit={this.handleSubmit}>
                        <Input value={this.state.value} onValueChange={this.handleValueChange} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                        <button className="submit" type="submit" value="Submit" />
                        <button className="add_child" type="submit" value="Add Child" aria-label="Add Child" onClick={this.handleAddChild} />
                        <button className="add_link" type="submit" value="Add Link" aria-label="Add Link" onMouseDown={this.handleAddLink} />
                        <button className="delete" type="submit" value="Delete" aria-label="Delete" onClick={this.handleDelete} />
                        <a
                            className="url"
                            href={`./${this.state.node_id}${typeof title !== 'undefined' ? '_' + title : ''}`}
                            aria-label="URL"
                        >{title || "URL"}</a>
                        {this.props.node_links.map((link, index) => (
                            document.getElementById(link) &&
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
