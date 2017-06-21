import React from 'react';
import ReactDOM from 'react-dom';
import Node from './node.jsx';
import Draggable from '../draggable';

const NodesView = ({nodes, ...props}) =>
    <div className="nodes">
        {nodes.map((node, index) => (
            <Node
                key={node.node_id}
                {...node}
                {...props}
            />
        ))}
    </div>

class Nodes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {nodes: []};
        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.handleUpdateNode = this.handleUpdateNode.bind(this);
        this.handleDeleteNode = this.handleDeleteNode.bind(this);
    }
    componentDidMount() {
        fetch('/node', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            return res.json();
        }).then((data) => {
            this.setDraggable();
            this.setState({nodes: data.map((node, i) => {
                return Object.assign(node, {Draggable: this.Draggable});
            })});
        });
    }
    handleCreateNode(e) {
        e.preventDefault();
        this.setState({nodes: [...this.state.nodes, {node_id: '-1', node_parent: '0', value: '', Draggable: this.Draggable}]});
    }
    handleUpdateNode(id, data) {
        this.setState((prev_state, props) => {
            let nodes = prev_state.nodes;
            Object.assign(nodes[nodes.findIndex(n => n.node_id == id)], data);
            return {nodes: [...nodes]}
        });
    }
    handleDeleteNode(id) {
        this.setState((prev_state, props) => {
            let nodes = prev_state.nodes;
            nodes.splice(nodes.findIndex(n => n.node_id == id), 1);
            return {nodes: [...nodes]}
        });
    }
    setDraggable() {
        this.Draggable = new Draggable({
            drag_handle_elements: [],
            onDragInit: () => {
            },
            onDragStart: (el, pos) => {
                //console.log('start', pos);
                el.classList.add('is_dragging');
            },
            onDragging: (el, pos) => {
                //console.log('moving', pos);
                el.style.top = `${Math.max(pos.y, 0)}px`;
                el.style.left = `${Math.max(pos.x, 0)}px`;
            },
            onDragEnd: (el, pos) => {
                //console.log('end', pos, el.offsetTop << 16 | el.offsetLeft);
                el.classList.remove('is_dragging');
            }
        });
    }
    render() {
        return (
            <div className="nodes-container">
                <input type="submit" value="Create" onClick={this.handleCreateNode} />
                <NodesView
                    nodes={this.state.nodes}
                    onUpdateNode={this.handleUpdateNode}
                    onDeleteNode={this.handleDeleteNode}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <Nodes />,
    document.getElementById('root')
);

