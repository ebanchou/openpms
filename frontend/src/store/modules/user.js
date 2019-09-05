import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { createuser } from '@/api/createuser'
import { rFormat } from '@/utils/rFormat'
import router from '../../router'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    group: [],
    userinfo: ''
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_GROUP: (state, group) => {
      state.group = group
    },
    CREATE_USER: (state, userinfo) => {
      state.userinfo = userinfo
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data.token)
          commit('SET_TOKEN', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          const data = response.data
          const rout = data.routers
          // 路由数据格式化处理
          const routers = rFormat(rout)

          router.addRoutes(routers)
          global.antRouter = router.options.routes.concat(routers)
          if (data.group && data.group.length > 0) { // 验证返回的group是否是一个非空数组
            commit('SET_GROUP', data.group)
          } else {
            // reject('getInfo: group must be a non-null array !')
          }
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          localStorage.setItem('element_perms', JSON.stringify(data.element_perms))
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_GROUP', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 用户注册
    Createuser({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password.trim()
      const group = userInfo.group.trim()
      return new Promise((resolve, reject) => {
        createuser(username, password, group).then(response => {
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }

  }
}

export default user
