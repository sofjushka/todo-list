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

    onAddInputChange = (event) => {
        this.currentInputValue = event.target.value;
    };

    onAddTask = () => {
        const text = this.currentInputValue.trim();
        if (text !== '') {
            this.onAdd(text);
            this.currentInputValue = '';
            this.update();
        }
    };

    render() {
        const inputElement = createElement("input", {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
            value: this.currentInputValue,
        }, null, {
            input: this.onAddInputChange
        });

        const buttonElement = createElement("button", {id: "add-btn"}, "+", {
            click: this.onAddTask
        });

        return createElement("div", {class: "add-todo"}, [
            inputElement,
            buttonElement
        ]);
    }
}

class Task extends Component {
    constructor(todo, onDelete, onToggle) {
        super();
        this.todo = todo;
        this.onDelete = onDelete;
        this.onToggle = onToggle;

        this.state = {
            isDeleteConfirmed: false
        };
    }

    handleDeleteClick = () => {
        if (!this.state.isDeleteConfirmed) {
            this.state.isDeleteConfirmed = true;
            this.update();
        } else {
            this.onDelete(this.todo.id);
        }
    };

    handleToggleChange = () => {
        this.onToggle(this.todo.id);
    };

    render() {
        const liClass = this.todo.completed ? "completed" : "";
        const btnClass = "delete-btn" + (this.state.isDeleteConfirmed ? " confirm" : "");

        return createElement("li", {class: liClass}, [
            createElement("input", {
                type: "checkbox",
                checked: this.todo.completed
            }, null, {
                change: this.handleToggleChange
            }),
            createElement("label", {}, this.todo.text),
            createElement("button", {class: btnClass}, "🗑️", {
                click: this.handleDeleteClick
            })
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();

        const savedTodos = localStorage.getItem('todos');
        const initialTodos = savedTodos
            ? JSON.parse(savedTodos)
            : [
                { id: 1, text: 'Сделать домашку', completed: false },
                { id: 2, text: 'Сделать практику', completed: false },
                { id: 3, text: 'Пойти домой', completed: false },
            ];

        this.state = {
            todos: initialTodos,
        };

        this.addTaskComponent = new AddTask(this.onAdd);
    }

    saveToLocalStorage = () => {
        localStorage.setItem('todos', JSON.stringify(this.state.todos));
    };

    onAdd = (text) => {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
        };
        this.state.todos.push(newTodo);
        this.saveToLocalStorage();
        this.update();
    };

    onToggle = (id) => {
        const todo = this.state.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.update();
        }
    };

    onDelete = (id) => {
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.update();
    };

    render() {
        const taskElements = this.state.todos.map(todo => {
            const task = new Task(todo, this.onDelete, this.onToggle);
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