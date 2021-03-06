const Draggable = function(){
    this.init(...arguments);
};
Draggable.prototype = {
    position_event_start: {},
    position_event_current: {},
    position_element_start: {},
    handlerElementMoveStart: function(e) {
        if(!(this.drag_handle_elements.indexOf(e.target) >= 0)) return;
        this.dragging_handle_element = e.target;
        this.dragging_target_element = this.drag_target_elements[
                (this.drag_handle_elements.indexOf(this.dragging_handle_element) < this.drag_target_elements.length)?
                    this.drag_handle_elements.indexOf(this.dragging_handle_element):
                    this.drag_target_elements.length - 1
            ];
        this.position_event_start = this.getEventPosition(e);
        this.position_element_start =
            (this.eventListener_capturing)?
            this.getEventPosition(e):
            this.getElementPosition(this.dragging_target_element);
        this.handlerDragStart(e, this.dragging_target_element, this.position_element_start);
        document.addEventListener('mousemove', this.handlerElementMoving, {capture: false});
        document.addEventListener('mouseup', this.handlerElementMoveEnd, {capture: false, once: true});
    },
    handlerElementMoving: function(e) {
        e.preventDefault();
        this.position_event_current = this.getEventPosition(e);
        this.handlerDragging(e, this.dragging_target_element, this.getMovedPosition());
    },
    handlerElementMoveEnd: function(e) {
        this.position_event_current = this.getEventPosition(e);
        this.handlerDragEnd(e, this.dragging_target_element, this.getMovedPosition());
        document.removeEventListener('mousemove', this.handlerElementMoving, {capture: false});
    },
    getEventPosition(e) {
        return {x: e.clientX, y: e.clientY};
    },
    getElementPosition(el) {
        let el_style = window.getComputedStyle(el);
        return {
            x: el.offsetLeft - parseInt(el_style.marginLeft),
            y: el.offsetTop - parseInt(el_style.marginTop)
        };
    },
    getMovedPosition() {
        return {
            x: this.position_element_start.x + (this.position_event_current.x - this.position_event_start.x),
            offsetX: this.position_event_current.x - this.position_event_start.x,
            y: this.position_element_start.y + (this.position_event_current.y - this.position_event_start.y),
            offsetY: this.position_event_current.y - this.position_event_start.y,
        }
    },
    appendElement(handle, target) {
        this.drag_handle_elements.push(handle);
        if(typeof target !== 'undefined') {
            this.drag_target_elements.push(target);
        } else {
            this.drag_target_elements.push(handle);
        }
    },
    receiveElements(target) {
        if(typeof target !== 'undefined' && !Array.isArray(target)) {
            target = [target];
        }
        return target;
    },
    init: function(args) {
        this.eventListener_capturing = args.eventListener_capturing || false;
        this.boundary_element = args.boundary_element || document.body;
        this.drag_handle_elements = this.receiveElements(args.drag_handle_elements) || [];
        this.drag_target_elements = this.receiveElements(args.drag_target_elements) || [...this.drag_handle_elements];
        this.handlerDragInit = args.onDragInit || function() {};
        this.handlerDragStart = args.onDragStart || function() {};
        this.handlerDragging = args.onDragging || function() {};
        this.handlerDragEnd = args.onDragEnd || function() {};
        this.handlerElementMoveStart = this.handlerElementMoveStart.bind(this);
        this.handlerElementMoving = this.handlerElementMoving.bind(this);
        this.handlerElementMoveEnd = this.handlerElementMoveEnd.bind(this);

        this.handlerDragInit();
        document.addEventListener('mousedown', this.handlerElementMoveStart, {capture: false});
    }
};

module.exports = Draggable;

