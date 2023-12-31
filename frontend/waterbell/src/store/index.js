import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import http from '../types/http'
import auth from './auth/auth'
// import axios from 'axios'
export default createStore({
  state: {
    location: { lon: '127', lat: '55' },
    tmpUnderroad: {},
    isMainpage: true,
    isPark: true
  },
  getters: {
    tmpUnderroad(state) {
      return state.tmpUnderroad
    },
    location(state) {
      return state.location
    }
  },
  mutations: {
    //state에 tmplocation에 임시 위치 저장하기
    // setTmplocation(state, payload) {
    //   state.tmplocation = payload
    // },
    setIsMainpage(state, value) {
      state.isMainpage = value
    },
    setTmpUnderroad(state, payload) {
      state.tmpUnderroad = payload
    },
    setIspark(state, value) {
      state.isPark = value
    }
  },
  actions: {
    //아래 action을 페이지 로딩 되자마자 띄울 수 있도록 할 것.
    async fetchUnderroads(context, payload) {
      // try {
      //로그인된 유저의 자격이 지하차도 매니저이면 지하차도 목록을 list로 생성할 것.
      await context.commit('auth/resetList')
      const loginUser = context.getters['auth/loginUser']
      const isLogin = context.rootGetters['auth/isLogin']
      const role = context.rootGetters['auth/role']
      // console.log('fetch에서 호출된 로그인 유저의 여부 : ' + isLogin)
      // console.log('fetch에서 호출된 로그인 유저의 롤 : ' + role)
      // const sidoId = loginUser.sido.id
      // console.log('여긴 들어와/?')
      if (isLogin && role == 'PUBLIC_MANAGER') {
        await http.get('/facilities/roads').then((res) => {
          res.data.forEach((element) => {
            //구군에 따른 지하차도 리스트 세팅
            // console.log('여긴 들어와/?')
            if (element.sido.id == loginUser.sidoId) {
              context.commit('setUnderroadbygugun', element.underroads)
            }
          })
        })
        context.commit('setUnderroadbygugun', loginUser.facilities) //지하차도 세팅하는거 로그인 때도 넣기
        //아니라면(비회원) 지하차도 전부 리스트로 받아오기(시군구별 + 전체)
      } else {
        await http.get('/facilities/roads').then((res) => {
          // console.log(res.data)
          res.data.forEach((element) => {
            if (element.underroads.length != 0) {
              context.commit('auth/setUnderroadbygugun', element)
              for (const e of element.underroads) {
                context.commit('auth/setUnderroadList', e)
              }
            }
          })
        })
        // console.log(context.getters['auth/underroadListByGugun'])
        // console.log('store에서 underroadList 출력')
        // console.log(context.getters['auth/underroadList'])
      }
    }
    // } catch (error) {
    //   console.log('지하차도를 가져오는데 에러가 발생했습니다.')
    // }
  },
  modules: {
    auth
  },
  plugins: [createPersistedState()]
})
//# sourceMappingURL=index.js.map
