function createElement(tag, attributes, children, events) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            if (key === 'value' || key === 'checked') {
                element[key] = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
    }

    if (events) {
        Object.keys(events).forEach((eventName) => {
            element.addEventListener(eventName, events[eventName]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === 'string') {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    return element;
}

class Component {
    constructor() {
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        if (this._domNode && this._domNode.parentNode) {
            const newNode = this.render();
            this._domNode.parentNode.replaceChild(newNode, this._domNode);
            this._domNode = newNode;
        }
    }
}

class AddTask extends Component {
    constructor(onAdd) {
        super();
        this.onAdd = onAdd;
        this.currentInputValue = '';
    }

    onInputChange = (event) => {
        this.currentInputValue = event.target.value;
    };

    onAddTask = () => {
        const text = this.currentInputValue.trim();
        if (text !== '') {
            this.onAdd(text);
            this.currentInputValue = '';
        }
    };

    render() {
        const inputElement = createElement("input", {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
            value: this.currentInputValue,
        }, null, {
            input: this.onInputChange
        });

        const buttonElement = createElement("button", { id: "add-btn" }, "+", {
            click: this.onAddTask
        });

        return createElement("div", { class: "add-todo" }, [
            inputElement,
            buttonElement
        ]);
    }
}

class Task extends Component {
    constructor(todo, onDelete) {
        super();
        this.todo = todo;
        this.onDelete = onDelete;
    }

    render() {
        return createElement("li", {}, [
            createElement("input", {
                type: "checkbox",
                checked: this.todo.completed
            }),
            createElement("label", {}, this.todo.text),
            createElement("button", {}, "🗑️", {
                click: () => this.onDelete(this.todo.id)
            })
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            todos: [
                { id: 1, text: 'Сделать домашку', completed: false },
                { id: 2, text: 'Сделать практику', completed: false },
                { id: 3, text: 'Пойти домой', completed: false },
            ],
        };

        this.addTaskComponent = new AddTask(this.onAdd);
    }

    onAdd = (text) => {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
        };
        this.state.todos.push(newTodo);
        this.update();
    };

    onDelete = (id) => {
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.update();
    };

    render() {
        const taskElements = this.state.todos.map(todo => {
            const task = new Task(todo, this.onDelete);
            return task.getDomNode();
        });

        return createElement("div", { class: "todo-list" }, [
            createElement("h1", {}, "TODO List"),
            this.addTaskComponent.getDomNode(),
            createElement("ul", { id: "todos" }, taskElements),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});