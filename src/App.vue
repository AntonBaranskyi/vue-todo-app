<script>
import { ref } from 'vue';
import {
  deleteTodo,
  getAllTodos,
  createTodo,
  patchTodo,
} from './utils/fetchTodos';

const input = ref(null);

export default {
  data() {
    return {
      todos: [],
      loadingsId: [],
      tempTodo: null,
      newTodoTitle: '',
      filterQuery: '',
      isEditing: false,
      editingTitle: '',
    };
  },
  mounted() {
    console.log('mount');
    this.getTodos();
  },

  computed: {
    getNoActiveTodo() {
      return this.todos.filter((todo) => !todo.completed).length || 0;
    },
  },

  methods: {
    getTodos() {
      getAllTodos().then(({ data }) => {
        this.todos = data;
      });
    },

    deleteTodoItem(todoId) {
      this.loadingsId.push(todoId);

      deleteTodo(todoId)
        .then(() => {
          this.todos = this.todos.filter((todo) => todo.id !== todoId);
        })
        .finally(() => {
          this.loadingsId = [];
        });
    },

    createTodo(title) {
      console.log(title);

      const newTodo = {
        title,
        completed: false,
        id: new Date(),
      };

      this.tempTodo = newTodo;

      createTodo(title)
        .then(({ data }) => this.todos.push(data))
        .finally(() => {
          this.newTodoTitle = '';
        });
    },

    updateTodo(todoId) {
      this.loadingsId.push(todoId);
      const currentTodo = this.todos.find((todo) => todo.id === todoId);
      const newStatus = !currentTodo.completed;

      const newTodo = { ...currentTodo, completed: newStatus };
      patchTodo(todoId, newTodo)
        .then(() => {
          this.todos = this.todos.map((todo) =>
            todo.id === todoId ? { ...todo, completed: newStatus } : todo
          );
        })
        .finally(() => {
          this.loadingsId = [];
        });
    },

    clearCompleted() {
      const completedTodosIds = this.todos
        .filter((todo) => todo.completed)
        .map((todo) => todo.id);

      this.loadingsId = [...completedTodosIds];

      Promise.all(completedTodosIds.map((id) => deleteTodo(id))).then(() => {
        this.todos = this.todos.filter((todo) => !todo.completed);
      });
    },

    onEditTodo(newTitle, id) {
      this.loadingsId.push(id);
      const currentTodo = this.todos.find((todo) => todo.id === id);

      if (!newTitle) {
        this.deleteTodoItem(id);

        return;
      }

      if (currentTodo.title !== newTitle) {
        patchTodo(id, { ...currentTodo, title: newTitle })
          .then(
            () =>
              (this.todos = this.todos.map((todo) =>
                todo.id === id ? { ...todo, title: newTitle } : todo
              ))
          )
          .finally(() => {
            this.loadingsId = [];
            this.isEditing = false;
          });
      }
    },

    onToggleAll() {
      const isEveryCompleted = this.todos.every((todo) => todo.completed);

      if (isEveryCompleted) {
        this.loadingsId = this.todos.map((todo) => todo.id);

        Promise.all(
          this.todos.map((todo) =>
            patchTodo(todo.id, { ...todo, completed: false })
          )
        ).finally(() => {
          this.loadingsId = [];
        });
        this.todos = this.todos.map((todo) => ({ ...todo, completed: false }));
      } else {
        this.loadingsId = this.todos
          .filter((todo) => !todo.completed)
          .map((todo) => todo.id);

        Promise.all(
          this.todos.map((todo) =>
            patchTodo(todo.id, { ...todo, completed: true })
          )
        ).finally(() => {
          this.loadingsId = [];
        });
        this.todos = this.todos.map((todo) => ({ ...todo, completed: true }));
      }
    },

    onDoubleClick(title) {
      this.isEditing = true;
      this.editingTitle = title;
    },
  },
};
</script>

<template>
  <div class="todoapp">
    <h1 class="todoapp__title">todos</h1>

    <div class="todoapp__content">
      <header class="todoapp__header">
        <button
          class="todoapp__toggle-all"
          :class="{ active: getNoActiveTodo === 0 }"
          @click="onToggleAll"
        ></button>

        <form @submit.prevent="createTodo(newTodoTitle)">
          <input
            type="text"
            class="todoapp__new-todo"
            placeholder="What needs to be done?"
            v-model.trim="newTodoTitle"
            ref="input"
          />
        </form>
      </header>

      <section class="todoapp__main" v-for="todo in todos" :key="todo.id">
        <div class="todo" :class="{ completed: todo.completed }">
          <label class="todo__status-label">
            <input
              type="checkbox"
              class="todo__status"
              :checked="todo.completed"
              @click="updateTodo(todo.id)"
            />
          </label>

          <form
            v-if="isEditing"
            @submit.prevent="onEditTodo(editingTitle, todo.id)"
          >
            <input
              type="text"
              class="todo__title-field"
              placeholder="Empty todo will be deleted"
              v-model="editingTitle"
              @keyup.escape="isEditing = false"
            />
          </form>

          <template v-else>
            <span @dblclick="onDoubleClick(todo.title)" class="todo__title">{{
              todo.title
            }}</span>

            <button @click="deleteTodoItem(todo.id)" class="todo__remove">
              x
            </button>
          </template>

          <div
            class="modal overlay"
            :class="{ 'is-active': loadingsId.includes(todo.id) }"
          >
            <div class="modal-background has-background-white-ter"></div>
            <div class="loader"></div>
          </div>
        </div>
      </section>

      <footer class="todoapp__footer">
        <span class="todo-count"> {{ getNoActiveTodo }} items left </span>

        <nav class="filter">
          <a href="#/" class="filter__link selected"> All </a>

          <a href="#/active" class="filter__link"> Active </a>

          <a href="#/completed" class="filter__link"> Completed </a>
        </nav>

        <button class="todoapp__clear-completed" @click="clearCompleted">
          Clear completed
        </button>
      </footer>
    </div>

    <article class="message is-danger message--hidden">
      <div class="message-header">
        <p>Error</p>
        <button class="delete"></button>
      </div>

      <div class="message-body">Unable to add a Todo</div>
    </article>
  </div>
</template>
<!-- <div class="todo">
  <label class="todo__status-label">
    <input type="checkbox" class="todo__status" />
  </label>

  <span class="todo__title">Not Completed Todo</span>
  <button class="todo__remove">x</button>

  <div class="modal overlay">
    <div class="modal-background has-background-white-ter"></div>
    <div class="loader"></div>
  </div>
</div>

<div class="todo">
  <label class="todo__status-label">
    <input type="checkbox" class="todo__status" />
  </label>

  <form>
    <input
      type="text"
      class="todo__title-field"
      placeholder="Empty todo will be deleted"
      value="Todo is being edited now"
    />
  </form>

  <div class="modal overlay">
    <div class="modal-background has-background-white-ter"></div>
    <div class="loader"></div>
  </div>
</div>

<div class="todo">
  <label class="todo__status-label">
    <input type="checkbox" class="todo__status" />
  </label>

  <span class="todo__title">Todo is being saved now</span>
  <button class="todo__remove">x</button>

  <div class="modal overlay is-active">
    <div class="modal-background has-background-white-ter"></div>
    <div class="loader"></div>
  </div>
</div> -->
  