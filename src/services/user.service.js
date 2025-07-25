import { api } from 'src/boot/axios'

class UserService {
  getAllUsers() {
    return api.get('/v1/users')
  }

  getUserById(id) {
    return api.get(`/v1/users/${id}`)
  }

  createUser(userData) {
    return api.post('/v1/users', userData)
  }

  updateUser(id, userData) {
    return api.put(`/v1/users/${id}`, userData)
  }

  deleteUser(id) {
    return api.delete(`/v1/users/${id}`)
  }

  updateUserRole(id, role) {
    return api.put(`/v1/users/${id}/role?newRole=${role}`)
  }
}

export default new UserService()
