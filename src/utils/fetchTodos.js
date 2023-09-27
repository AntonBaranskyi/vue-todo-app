import axios from '../utils/axios';

const USER_ID = '11224';

export const getAllTodos = () => {
  return axios.get(`/todos?userId=${USER_ID}`);
};

export const deleteTodo = (todoId) => {
  return axios.delete(`todos/${todoId}`);
};

export const createTodo = (title) => {
  return axios.post('todos?userId=11224', {
    title,
    completed: false,
    userId: USER_ID,
  });
};

export const patchTodo = (todoId, todoData) => {
  return axios.patch(`todos/${todoId}`, todoData);
};
