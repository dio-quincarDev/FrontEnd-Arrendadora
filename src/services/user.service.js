import { api } from 'src/boot/axios';

class UserService {
  getAllUsers() {
    return api.get('/v1/admin/users');
  }

  getUserById(id) {
    return api.get(`/v1/admin/users/${id}`);
  }

  createUser(userData) {
    return api.post('/v1/admin/users', userData);
  }

  updateUser(id, userData) {
    return api.put(`/v1/admin/users/${id}`, userData);
  }

  deleteUser(id) {
    return api.delete(`/v1/admin/users/${id}`);
  }

  updateUserRole(id, role) {
    return api.put(`/v1/admin/users/${id}/role`, { role });
  }
}

export default new UserService();
