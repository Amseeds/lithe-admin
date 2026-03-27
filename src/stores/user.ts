import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'

import { signIn } from '@/api'
import router from '@/router'
import { resolveMenu, resolveRoute } from '@/router/helper'
import { fixedMenu } from '@/api/user'

import { pinia } from '.'

import type { UserInfo } from '@/api'

const userInfo: UserInfo = {
  avatar: '',
  id: 1,
  name: 'Lithe User',
  role: 'user',
  token: null,
  menu: [],
}

export const useUserStore = defineStore('userStore', () => {
  const user = useStorage<UserInfo>('user', userInfo)

  const token = useStorage<string | null>('token', null)

  async function userSignIn(data: Parameters<typeof signIn>[0]) {
    const res = await signIn(data)

    token.value = res.data.token
    console.log('token', token.value)

    // 【修改】使用前端固定菜单,忽略后端返回的菜单
    // 原代码: user.value = res.data
    user.value = {
      // ...res.data,
      menu: fixedMenu, // 覆盖为前端固定菜单
    }

    // 【恢复后端菜单配置时,使用以下代码替换上面的代码】:
    // user.value = res.data
    // 不需要任何额外处理,后端返回的 menu 会自动使用
  }

  function cleanup(redirectPath?: string) {
    router.replace({
      name: 'signIn',
      ...(redirectPath ? { query: { r: redirectPath } } : {}),
    })

    token.value = null
    user.value = userInfo

    if (router.hasRoute('layout')) {
      router.removeRoute('layout')
    }
  }

  const userMenu = computed(() => {
    return resolveMenu(user.value.menu)
  })
  const userRoute = computed(() => {
    return resolveRoute(user.value.menu)
  })

  return {
    user,
    token,
    userMenu,
    userRoute,
    userSignIn,
    cleanup,
  }
})

export function toRefsUserStore() {
  return {
    ...storeToRefs(useUserStore(pinia)),
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
