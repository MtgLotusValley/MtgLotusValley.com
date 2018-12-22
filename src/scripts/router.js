import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import User from '@/pages/User'
import Meta from '@/pages/Meta'
import DeckBuilder from '@/pages/DeckBuilder'
import UserCollection from '@/pages/UserCollection'
import PrivateDeckList from '@/pages/PrivateDeckList'
import PrivateDeck from '@/pages/PrivateDeck'
import PublicDeckList from '@/pages/PublicDeckList'
import PublicDeck from '@/pages/PublicDeck'
import LotusTracker from '@/pages/LotusTracker'
import NewsMtgLotusValley from '@/pages/news/1MtgLotusValley'
import NewsMtgLVDecks from '@/pages/news/2MtgLVDecks'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/meta',
      name: 'Meta',
      component: Meta
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/user/collection',
      name: 'UserCollection',
      component: UserCollection,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/user/decks',
      name: 'PrivateDeckList',
      component: PrivateDeckList,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/user/decks/:id/edit',
      name: 'DeckBuilderUserDeckEdit',
      component: DeckBuilder,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/user/decks/:id',
      name: 'PrivateDeck',
      component: PrivateDeck,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/decks/builder',
      name: 'DeckBuilder',
      component: DeckBuilder
    },
    {
      path: '/decks',
      name: 'PublicDeckList',
      component: PublicDeckList
    },
    {
      path: '/decks/:alias/edit',
      name: 'DeckBuilderPublicDeckEdit',
      component: DeckBuilder,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/decks/:alias',
      name: 'PublicDeck',
      component: PublicDeck
    },
    {
      path: '/lotustracker',
      name: 'LotusTracker',
      component: LotusTracker
    },
    {
      path: '/mtglv',
      name: 'MtgLotusValley',
      component: NewsMtgLotusValley
    },
    {
      path: '/mtglv_decks',
      name: 'MtgLVDecks',
      component: NewsMtgLVDecks
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = 'Black Lotus Valley'
  const currentUserId = localStorage.getItem('localId')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !currentUserId) {
    next('/')
  } else {
    next()
  }
})

export default router
