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

        this.currentInputValue = '';
    }

    onAddInputChange = (event) => {
        this.currentInputValue = event.target.value;
    };

    onAddTask = () => {
        const text = this.currentInputValue.trim();

        if (text !== '') {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
            };

            this.state.todos.push(newTodo);
            this.currentInputValue = '';
            this.update();
        }
    };

    render() {
        const todoItems = this.state.todos.map(todo => {
            return createElement("li", {}, [
                createElement("input", {
                    type: "checkbox",
                    checked: todo.completed
                }),
                createElement("label", {}, todo.text),
                createElement("button", {}, "🗑️")
            ]);
        });

        const inputElement = createElement("input", {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
            value: this.currentInputValue,
        }, null, {
            input: this.onAddInputChange
        });

        const buttonElement = createElement("button", { id: "add-btn" }, "+", {
            click: this.onAddTask
        });

        return createElement("div", { class: "todo-list" }, [
            createElement("h1", {}, "TODO List"),
            createElement("div", { class: "add-todo" }, [
                inputElement,
                buttonElement
            ]),
            createElement("ul", { id: "todos" }, todoItems),
        ]);
    }
}
document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
