import React from 'react';
import ReactDOM from 'react-dom';
import Url from 'url';
import Node from './node.jsx';
import Draggable from '../draggable';
import Stems from '../stems';
import {Esc} from '../escListener';
import fSum from '../sum';
const Sum = new fSum(4, 2);

let default_root_node_id = "0";
let node_base_className = "node";
let node_selected_className = "is_selected";
let node_ondrag_className = "is_dragging";
let node_onlink_className = "is_linking";
let link_handle_id = "___link_handle";

const NodesView = ({nodes, ...props}) =>
    <div className="nodes" data-root={props.root_node_id}>
        {Object.keys(nodes).map((id, index) => (
            <Node
                key={id}
                {...nodes[id]}
                {...props}
            />
        ))}
    </div>

const updateNode = (id, data = {}) => {
    return (prev_state, props) => {
        if(typeof prev_state.nodes[id] == 'undefined') prev_state.nodes[id] = {};
        let node = {[id]: Object.assign(prev_state.nodes[id], data)};
        return {nodes: Object.assign(prev_state.nodes, node)};
    };
};
const deleteNode = (id) => {
    return (prev_state, props) => {
        let nodes = prev_state.nodes;
        delete nodes[id];
        return {nodes: nodes};
    };
};
const setNodePosition = (node_el, pos) => {
    let snap_step = 10;
    pos.x = parseInt(pos.x / snap_step) * snap_step;
    pos.y = parseInt(pos.y / snap_step) * snap_step;
    Object.assign(node_el.style, {
        top: `${pos.y}px`,
        left: `${pos.x}px`
    });
};
const setLinksPosition = (node_el) => {
    let node = node_el;
    let from_id = node_el.id;
    node.querySelectorAll(".remove_link").forEach((link_el) => {
        let to_id = link_el.dataset.nodeTo;
        let from_node = node;
        let to_node = document.getElementById(to_id);
        let handle_element = link_el;
        let from_center = {
            x: from_node.offsetLeft + (from_node.offsetWidth / 2),
            y: from_node.offsetTop + (from_node.offsetHeight / 2)
        };
        let to_center = {
            x: to_node.offsetLeft + (to_node.offsetWidth / 2),
            y: to_node.offsetTop + (to_node.offsetHeight / 2)
        };
        let t = Math.atan2(
                from_center.y - to_center.y,
                from_center.x - to_center.x
            );
        let x2 = from_center.x - from_node.offsetLeft;
        let y2 = from_center.y - from_node.offsetTop;
        let offset = {
            vertical: x2 * Math.tan(t),
            horizontal: y2 / Math.tan(t),
            margin: {
                top: 17
            }
        };
        let x, y;
        if(Math.abs(offset.vertical)>Math.abs(offset.horizontal)){
            if(t<0){// bottom side
                y = from_node.offsetTop + from_node.offsetHeight;
                x = from_center.x + offset.horizontal;
            } else{// top side
                y = from_node.offsetTop - handle_element.offsetHeight - offset.margin.top;
                x = from_center.x - offset.horizontal - (offset.margin.top / Math.tan(t));
            }
            /*
            if(x > from_node.offsetLeft + from_node.offsetWidth){
                x = from_node.offsetLeft + from_node.offsetWidth;
            } else if(x < from_node.offsetLeft){
                x = from_node.offsetLeft;
            }
            */
        } else if(Math.abs(offset.vertical)<Math.abs(offset.horizontal)){
            if(Math.abs(t)<Math.PI/2){// left side
                y = from_center.y - offset.vertical;
                x = from_node.offsetLeft - handle_element.offsetWidth;
            } else{// right side
                y = from_center.y + offset.vertical;
                x = from_node.offsetLeft + from_node.offsetWidth;
            }
            /*
            if(y > from_node.offsetTop + from_node.offsetHeight){
                y = from_node.offsetTop + from_node.offsetHeight;
            } else if(y < from_node.offsetTop){
                y = from_node.offsetTop;
            }
            */
        }
        Object.assign(link_el.style, {
            top: `${y - from_node.offsetTop}px`,
            left: `${x - from_node.offsetLeft}px`
        });
    });
};

class Nodes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            is_logged_in: false,
            root_node_id: Url.parse(document.currentScript.src).query || default_root_node_id
        };
        this.modules = {};
        this.selectedNodes = {};
        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.handleUpdateNode = this.handleUpdateNode.bind(this);
        this.handleDeleteNode = this.handleDeleteNode.bind(this);
        this.handleCreateNewNode = this.handleCreateNewNode.bind(this);
        this.handleAddLink = this.handleAddLink.bind(this);
        this.handleRemoveLink = this.handleRemoveLink.bind(this);
        this.handleSelectNode = this.handleSelectNode.bind(this);
        this.handleClearSelectedNodes = this.handleClearSelectedNodes.bind(this);
        Esc.addHandler(this.handleClearSelectedNodes);
        Esc.addHandler((e) => {
            if(e.target.tagName == 'TEXTAREA')
                e.target.blur();
        });
    }
    componentDidUpdate(prevProps, prevState) {
    }
    componentWillMount() {
    }
    componentDidMount() {
        let fetch_url = (this.state.root_node_id != default_root_node_id)?`./node/${this.state.root_node_id}`:'./node';
        fetch(fetch_url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            return res.json();
        }).then((data) => {
            this.setDraggable();
            this.setLinkable();
            this.setStems();
            this.setState({'is_logged_in': data.pop()});
            let tmp = {};
            data.map((node) => {
                tmp[node.node_id] = Object.assign(node, this.modules, {title: node.node_id});
            });
            this.setState({'nodes': tmp}, () => {
                Object.keys(this.state.nodes).map((id, index) => {
                    setLinksPosition(document.getElementById(id));
                });
            });
            this.Stems.redraw();
            this.setContainerScrollable();
        });
    }
    handleCreateNode(e, node_parent_id, pos) {
        //let init_position = {x: e.clientX, y: e.clientY}
        let init_position_margin = 30;
        pos = pos + Sum.create(init_position_margin, init_position_margin);
        fetch('./node', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                $node_parent: node_parent_id,
                $node_links: [],
                $time: Date.now(),
                $position: pos,
                $value: '',
            })
        }).then((res) => {
            if(res.ok) {
                return res.json();
            } else {
                this.handleErrorStatus(res.status);
            }
        }).then((res) => {
            this.setState(
                updateNode(
                    res.node_id,
                    Object.assign(res, this.modules, {title: res.node_id})
                ));
        });
    }
    handleUpdateNode(id, data = {}) {
        if(this.state.nodes[id] == 'undefined') this.state.nodes[id] = {};
        data = Object.assign(this.state.nodes[id], data);
        fetch('./node/' + id, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                $node_parent: data.node_parent,
                $node_links: data.node_links,
                $time: Date.now(),
                $position: data.position,
                //$title: data.title,
                $value: data.value,
            })
        }).then((res) => {
            if(res.ok) {
                this.setState(updateNode(id, data), () => {
                    setLinksPosition(document.getElementById(id));
                });
                this.Stems.redraw();
                this.forceUpdate();
            } else {
                this.handleErrorStatus(res.status);
            }
        });
    }
    handleDeleteNode(id) {
        fetch('./node/' + id, {
            method: 'DELETE',
            credentials: 'include',
        }).then((res) => {
            if(res.ok) {
                this.Stems.removeAscendent(document.getElementById(id));
                this.Stems.removeEquivalent(document.getElementById(id));
                this.Stems.redraw();
                this.setState(deleteNode(id));
                for(let node_id in this.state.nodes) {
                    let node = this.state.nodes[node_id];
                    if(node.node_parent == id) {
                        node.node_parent = default_root_node_id;
                        this.handleUpdateNode(node_id, node);
                    }
                    if(node.node_links.indexOf(id) >= 0) {
                        node.node_links.splice(node.node_links.indexOf(id), 1);
                        this.handleUpdateNode(node_id, node);
                    }
                }
            } else {
                this.handleErrorStatus(res.status);
            }
        });
    }
    handleCreateNewNode(e) {
        e.preventDefault();
        let container_style = ReactDOM.findDOMNode(this).style;
        let current_position = Sum.create(-1 * parseInt(container_style.top), -1 * parseInt(container_style.left));
        this.handleCreateNode(e, this.state.root_node_id, current_position);
    }
    handleAddLink(from_id) {
        document.addEventListener('linked', (e) => {
            let from_node = this.state.nodes[from_id];
            let to_id = e.detail.node_to_id;
            if(typeof to_id !== 'undefined'
                && to_id != from_id
                && !(from_node.node_links.indexOf(to_id) >= 0)
                ) {
                    this.handleUpdateNode(from_id, {node_links: [...from_node.node_links, to_id]});
                    this.Stems.addEquivalent(
                        document.getElementById(from_id),
                        document.getElementById(to_id)
                    );
                }
        }, {once: true});
    }
    handleRemoveLink(from_id, to_id) {
        this.handleUpdateNode(from_id, {
            node_links: this.state.nodes[from_id].node_links.filter((id) => id != to_id)
        });
        this.Stems.removeEquivalent(
            document.getElementById(from_id),
            document.getElementById(to_id)
        );
    }
    handleSelectNode(el, callback = () => {}) {
        if(!el.classList.toggle(node_selected_className)) {
            delete this.selectedNodes[el.id];
            return;
        }
        this.selectedNodes[el.id] = {
            el: el,
            submit: callback
        };
        if(typeof this.handleClearCallback == 'undefined') {
            this.handleClearCallback = (e) => {
                if(e.target.closest('.node')) return;
                this.handleClearSelectedNodes();
            };
            document.addEventListener('mousedown', this.handleClearCallback, {capture: true});
        }
    }
    handleClearSelectedNodes() {
        for(let id in this.selectedNodes) {
            this.selectedNodes[id].el.classList.remove(node_selected_className);
            this.selectedNodes[id].submit();
        }
        this.selectedNodes = {};
        document.removeEventListener('mousedown', this.handleClearCallback, {capture: true});
        delete this.handleClearCallback;
    }
    handleErrorStatus(status) {
        switch(status) {
            case 403:
                window.location.reload();
            default:
                console.log(status);
        }
    }
    setStems() {
        this.Stems = new Stems({
            container_element: ReactDOM.findDOMNode(this)
        });
        Object.assign(this.modules, {Stems: this.Stems});
    }
    setDraggable() {
        this.Draggable = new Draggable({
            boundary_element: ReactDOM.findDOMNode(this),
            drag_handle_elements: [],
            onDragInit: () => {
            },
            onDragStart: (e, el, pos) => {
                el.classList.add(node_ondrag_className);
                for(let id in this.selectedNodes) {
                    this.selectedNodes[id].el.classList.add(node_ondrag_className);
                }
            },
            onDragging: (e, el, pos) => {
                setNodePosition(el, pos);
                setLinksPosition(el);
                for(let id in this.selectedNodes) {
                    let el = this.selectedNodes[id].el;
                    let pos_orig = Sum.extract(el.dataset['position']);
                    setNodePosition(el, {
                        x: pos_orig[1] + pos.offsetX,
                        y: pos_orig[0] + pos.offsetY,
                    });
                    //setLinksPosition(el);
                }
                this.Stems.redraw();
            },
            onDragEnd: (e, el, pos) => {
                el.classList.remove(node_ondrag_className);
                for(let id in this.selectedNodes) {
                    this.selectedNodes[id].el.classList.remove(node_ondrag_className);
                    this.selectedNodes[id].submit();
                }
            }
        });
        Object.assign(this.modules, {Draggable: this.Draggable});
    }
    setLinkable() {
        this.Linkable = new Draggable({
            eventListener_capturing: true,
            boundary_element: document.body,
            drag_handle_elements: [],
            onDragInit: () => {
                let link_handle = document.createElement('div');
                link_handle.id = link_handle_id;
                Object.assign(link_handle.style, {
                    display: 'none',
                    position: 'absolute',
                    margin: '1px',
                    pointerEvents: 'none',
                });
                document.body.appendChild(link_handle);
            },
            onDragStart: (e, el, pos) => {
                let node_from = el.closest(`.${node_base_className}`);
                let link_handle = document.getElementById(link_handle_id);
                node_from.classList.add(node_onlink_className);
                Object.assign(link_handle.style, {
                    display: 'block',
                    top: `${pos.y}px`,
                    left: `${pos.x}px`,
                });
                this.Stems.addEquivalent(node_from, link_handle);
            },
            onDragging: (e, el, pos) => {
                e.preventDefault();
                let link_handle = document.getElementById(link_handle_id);
                Object.assign(link_handle.style, {
                    top: `${e.clientY}px`,
                    left: `${e.clientX}px`,
                });
                this.Stems.redraw();
            },
            onDragEnd: (e, el, pos) => {
                let node_from = el.closest(`.${node_base_className}`);
                let node_to = e.target.closest(`.${node_base_className}`) || {};
                let link_handle = document.getElementById(link_handle_id);
                node_from.classList.remove(node_onlink_className);
                link_handle.style.display = 'none';
                this.Stems.removeEquivalent(node_from, link_handle);
                this.Stems.redraw();
                document.dispatchEvent(new CustomEvent('linked', {detail: {node_to_id: node_to.id}}));
            }
        });
        Object.assign(this.modules, {Linkable: this.Linkable});
    }
    setContainerScrollable() {
        let container_style = ReactDOM.findDOMNode(this).style;
        let container_pos = {};
        if(this.state.root_node_id != default_root_node_id) {
            let pos = Sum.extract(this.state.nodes[this.state.root_node_id].position);
            container_pos = {
                top: `${pos[0] * -1 + 60}px`,
                left: `${pos[1] * -1 + 30}px`
            };
        } else {
            container_pos = {
                top: '0px',
                left: '0px'
            };
        }
        Object.assign(container_style, container_pos);
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            Object.assign(container_style, {
                top: `${parseInt(container_style.top) - e.deltaY}px`,
                left: `${parseInt(container_style.left) - e.deltaX}px`
            });
        });
    }
    render() {
        return (
            <div className="nodes-container">
                {(this.state.is_logged_in && this.state.root_node_id == default_root_node_id)?
                    <button className="create_node" type="submit" value="Create" aria-label="Create" onClick={this.handleCreateNewNode} />
                    :''}
                <NodesView
                    nodes={this.state.nodes}
                    root_node_id={this.state.root_node_id}
                    is_logged_in={this.state.is_logged_in}
                    onCreateNode={this.handleCreateNode}
                    onAddLink={this.handleAddLink}
                    onRemoveLink={this.handleRemoveLink}
                    onUpdateNode={this.handleUpdateNode}
                    onDeleteNode={this.handleDeleteNode}
                    onSelectNode={this.handleSelectNode}
                    onClearSelectedNodes={this.handleClearSelectedNodes}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <Nodes />,
    document.getElementById('nodes-wrap')
);

export default Nodes;
