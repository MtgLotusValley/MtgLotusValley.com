<template>
  <v-layout class="mb-3" column wrap>
    <!-- Top -->
    <v-flex class="text-xs-left" xs12>
      <v-breadcrumbs class="breadcrumbs" :items="breadcrumbs">
        <v-icon slot="divider">chevron_right</v-icon>
      </v-breadcrumbs>
    </v-flex>
    <v-flex xs12>
      <v-layout row class="headerContainer mt-2_5 ml-2_5 mr-2_5">
        <div :class="`header header-${deckColors !== '' ? deckColors : 'default'} white--text`">
          <v-layout class="line pt-2 ml-2" row nowrap>
            <div class="mana mt-2 ml-1 hidden-xs-only">
              <img class="mr-1" v-for="color in deckColors.split('')" :key="color"
                :src="require(`@/assets/mana/${color}.png`)"/>
            </div>
            <span class="title textNoWrap mt-2 ml-2">{{ deckName }}</span>
          </v-layout>
          <v-layout class="line ml-3" row nowrap>
            <v-btn v-if="deckId !== ''" class="likeButton" flat small :disabled="isLoading"
              :color="deckLiked ? 'primary' : 'white'" @click="like()">
              <span class="mt-1 subheading text--white">({{deckLikes}})</span>
              <v-icon class="ml-1">thumb_up</v-icon>
            </v-btn>
            <span class='subheading mt-2_5'>{{ deckArch }}</span>
            <v-spacer class="hidden-sm-and-up"/>
            <div class="mana mt-1 mr-2 hidden-sm-and-up">
              <img class="mr-1" v-for="color in deckColors.split('')" :key="color"
                :src="require(`@/assets/mana/${color}.png`)"/>
            </div>
          </v-layout>
        </div>
        <v-layout row class="overlay">
          
          <v-layout class="mt-2_5 mr-2 white--text hidden-sm-and-down" column nowrap>
            <v-layout row nowrap justify-end>
              <span class='mt-0_5 subheading'>Total Cost</span>
              <WildcardsCost class="wildcardsCost ml-2" :cost="deckWCCost" medium/>
            </v-layout>
            <v-layout row nowrap class="mt-1" v-if="$isUserLogged()" justify-end>
              <span class='mt-0_5 subheading'>Build Cost</span>
              <WildcardsCost class="wildcardsCost ml-2" :cost="deckWCMissingCost" medium/>
            </v-layout>
            <v-spacer/>
          </v-layout>

          <v-divider class="mt-2 mb-2 hidden-sm-and-down" vertical color="gray"/>
          <v-layout column class='manaCurve mt-2 hidden-sm-and-down'>
            <ManaCurve :manaCurve="deckManaCurve" :id="1"
              :height="75" :width="150" :showTitle="false"/>
          </v-layout>

          <v-divider class="mt-2 mb-2 mr-05 hidden-xs-only" vertical color="gray"/>
          <v-layout column class="hidden-xs-only">
            <v-btn flat small color="white" @click="exportDeckToArena()">Export to Arena</v-btn>
            <v-btn flat small color="white" @click="exportDeckToText()">Export to Text</v-btn>
          </v-layout>
        </v-layout>
      </v-layout>
    </v-flex>
    
    <v-layout row wrap justify-end :class="$vuetify.breakpoint.smAndDown ? 'column-reverse' : ''">
      <!-- Left / Bottom -->
      <v-flex xs12 sm12 md8>
        <div :class="`box ${$vuetify.breakpoint.mdAndUp ? 'mr-0' : ''}`">
          <v-layout class="mainContainer boxContent" column nowrap>
            <v-tabs class="mb-3 ml-2 mr-2" color="transparent" v-model="currentTab">

              <v-tab>Overview</v-tab>
              <v-tab-item>
                <v-layout class="overview" column wrap>
                  <div class="deckGuideContainer">
                    <v-layout row v-if="isUserDeckOwner" :class="deckGuideEditing ? 'deckGuideEditingButtons' : 'deckGuideButtons'">
                      <v-btn v-if="!deckGuideEditing && !isLoading" flat icon color="primary"
                        @click="deckGuideEditing = true"><v-icon>edit</v-icon></v-btn>
                      <v-tooltip v-if="deckGuideEditing && !isLoading" top lazy>                         
                        <v-btn v-if="deckGuideEditing && !isLoading" flat icon color="primary" slot="activator"
                          href="https://commonmark.org/help/" target="_blank"><v-icon>info</v-icon></v-btn>
                        <span>Text formatting info</span>
                      </v-tooltip>
                      <v-btn v-if="deckGuideEditing && !isLoading" flat icon color="primary"
                        @click="onDeckGuideCancel()"><v-icon>close</v-icon></v-btn>
                      <v-btn v-if="deckGuideEditing && !isLoading" flat icon color="primary"
                        @click="onDeckGuideSave()"><v-icon>done</v-icon></v-btn>
                    </v-layout>
                    <v-layout row v-if="isUserDeckOwner && isLoading" class="deckGuideButtons">
                      <v-progress-circular color="deep-orange" :indeterminate="true"/>
                    </v-layout>
                    <v-textarea v-if="deckGuideEditing" class="mt-3" box rows="10"
                      v-model="deckGuide" label="Markdown Text" no-resize/>
                    <vue-markdown class="mt-4" :source="deckGuide"/>
                  </div>
                  <vue-disqus shortname="mtglotusvalley"/>
                </v-layout>
              </v-tab-item>

              <v-tab>Visual Mode</v-tab>
              <v-tab-item lazy>
                <div>
                  <v-layout row class="mt-4 ml-5">
                    <span class="subheading mt-2">Main Deck - {{cardsTotal(deckCards)}} cards</span>
                  </v-layout>
                  <v-divider class="mt-1 ml-5 mr-5"/>
                  <DeckVisual class="mt-3 m-auto" :cards="deckCards"/>
                </div>
                <div v-if="Object.keys(sideboardCards).length > 0">
                  <v-layout row class="mt-4 ml-5">
                    <span class="subheading mt-2">Sideboard - {{cardsTotal(sideboardCards)}} cards</span>
                  </v-layout>
                  <v-divider class="mt-1 ml-5 mr-5"/>
                  <DeckVisual class="mt-3" :sideboard="sideboardCards"/>
                </div>
              </v-tab-item>

              <v-tab :disabled="deckUpdates.length === 0">Updates</v-tab>
              <v-tab-item>
                <Updates class='mt-3 ml-3 mr-3' :updates="deckUpdates"/>
              </v-tab-item>

              <v-tab>Stats</v-tab>
              <v-tab-item>
                <Stats class='mt-3' :cards="deckCards"/>
              </v-tab-item>

              <v-tab>Play Test</v-tab>
              <v-tab-item>
                <PlayTest class="mt-3" :cards="deckCards"/>
              </v-tab-item>
            </v-tabs>
          </v-layout>
        </div>
      </v-flex>
      <!-- Right / Top -->
      <v-flex class="ml-0" xs12 sm12 md4>
        <div class="box">
          <v-layout class="boxContent pb-2" column nowrap>
            <v-layout v-if="isUserDeckOwner" row class="deckActions hidden-sm-and-down">
              <v-flex xs6>
                <v-btn flat small color="primary" @click="editDeck()">Edit</v-btn>
              </v-flex>
              <v-divider class="mt-2 mb-2" vertical color="gray"/>
              <v-flex xs6>
                <v-btn flat small color="primary" @click="deleteConfirmationDialogVisible = true">Delete</v-btn>
              </v-flex>
            </v-layout>

            <!-- Desktop Layout -->
            <v-layout column class="hidden-sm-and-down">
              <DeckPresenting v-if="Object.keys(deckCards).length > 0"
                class="ml-1 mr-1" :cards="deckCards"/>
              <Deck class="deck deckContainer mt-4" :cards="deckCards"
                :sideboard="sideboardCards"/>
            </v-layout>
            <!-- Tablet Layout -->
            <v-layout row wrap class="hidden-xs-only hidden-md-and-up">
              <v-flex xs12 sm7>
                <Deck class="deck deckContainer mt-4" :cards="deckCards"
                  :sideboard="sideboardCards"/>
                <v-layout v-if="isUserDeckOwner" row class="deckActions mt-2 ml-4 mr-4">
                  <v-flex xs6>
                    <v-btn flat small color="primary" @click="editDeck()">Edit</v-btn>
                  </v-flex>
                  <v-divider class="mt-2 mb-2" vertical color="gray"/>
                  <v-flex xs6>
                    <v-btn flat small color="primary" @click="deleteConfirmationDialogVisible = true">Delete</v-btn>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs12 sm5>
                <v-layout column nowrap>
                  <DeckPresenting v-if="Object.keys(deckCards).length > 0"
                    class="mt-4 ml-1 mr-1" :cards="deckCards"/>                  
                  <v-layout row class='mt-4 m-auto'>
                    <ManaCurve :manaCurve="deckManaCurve" :id="2"
                      :height="150" :width="250" :showTitle="true"/>
                  </v-layout>
                  <v-layout class="mt-4 mr-3" column wrap justify-center>
                    <span class='subheading'>Total Cost</span>
                    <WildcardsCost class="wildcardsCost mt-2" :cost="deckWCCost"/>
                  </v-layout>
                  <v-layout class="mt-2 mr-3" column wrap v-if="$isUserLogged()" justify-center>
                    <span class='subheading'>Build Cost</span>
                    <WildcardsCost class="wildcardsCost mt-2" :cost="deckWCMissingCost"/>
                  </v-layout>
                </v-layout>
              </v-flex>
            </v-layout>
            <!-- Mobile Layout -->
            <v-layout column nowrap class="hidden-sm-and-up">
              <DeckPresenting v-if="Object.keys(deckCards).length > 0"
                class="mt-4 ml-1 mr-1" :cards="deckCards"/>   
              <Deck class="deck deckContainer mt-3" :cards="deckCards"
                :sideboard="sideboardCards"/>               
              <v-layout row class='mt-4 m-auto'>
                <ManaCurve :manaCurve="deckManaCurve" :id="3"
                  :height="150" :width="250" :showTitle="true"/>
              </v-layout>
              <v-layout class="mt-4 mr-3" column wrap justify-center>
                <span class='subheading'>Total Cost</span>
                <WildcardsCost class="wildcardsCost mt-2" :cost="deckWCCost"/>
              </v-layout>
              <v-layout class="mt-2 mr-3" column wrap v-if="$isUserLogged()" justify-center>
                <span class='subheading'>Build Cost</span>
                <WildcardsCost class="wildcardsCost mt-2" :cost="deckWCMissingCost"/>
              </v-layout>
              <v-layout row class="m-auto mt-4">
                <v-btn flat small color="primary" @click="exportDeckToArena()">Export to Arena</v-btn>
                <v-btn flat small color="primary" @click="exportDeckToText()">Export to Text</v-btn>
              </v-layout>
              <v-layout v-if="isUserDeckOwner" row class="deckActions mt-2 m-auto">
                <v-btn flat small color="primary" @click="editDeck()">Edit</v-btn>
                <v-btn flat small color="primary" @click="deleteConfirmationDialogVisible = true">Delete</v-btn>
              </v-layout>
            </v-layout>
          </v-layout>
        </div>
      </v-flex>
    </v-layout>

    <!-- Dialogs -->
    <v-dialog v-model="deleteConfirmationDialogVisible" width="250">
      <v-card>
        <v-card-title class='subheading'>Are you Sure?</v-card-title>
        <v-card-text>
          <p class="text-md-center" v-if="isLoading">
            <v-progress-circular color="deep-orange" :indeterminate="true"/>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn :disabled="isLoading" color="primary" flat
            @click="deleteConfirmationDialogVisible = false">No</v-btn>
          <v-btn :disabled="isLoading" color="primary" flat
            @click="deleteDeck()">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog class="btExport" v-model="deckExportDialogVisible" width="350">
      <v-card>
        <v-card-text class='subheading'>Deck copied to clipboard.</v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary" flat @click="deckExportDialogVisible = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="needLoginDialogVisible" width="350">
      <v-card>
        <v-card-text class='subheading'>User not logged.</v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary" flat @click="needLoginDialogVisible = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
import Deck from '@/components/mtg/Deck'
import DeckPresenting from '@/components/deck/DeckPresenting'
import DeckVisual from '@/components/deck/DeckVisual'
import Stats from '@/components/deck/Stats'
import Updates from '@/components/deck/Updates'
import PlayTest from '@/components/deck/PlayTest'
import ManaCurve from '@/components/charts/ManaCurve'
import WildcardsCost from '@/components/mtg/WildcardsCost'
import DeckUtils from '@/scripts/deckutils'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'PublicDeck',
  components: {
    Deck, DeckPresenting, DeckVisual, Stats, Updates, PlayTest, ManaCurve, WildcardsCost, VueMarkdown
  },
  data () {
    return {
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Decks',
          href: '/decks'
        }
      ],
      currentTab: 0,
      deckAlias: this.$route.params.alias,
      deckLoader: this.$route.query.loader,
      deckCards: {},
      sideboardCards: {},
      reprintsCards: {},
      deckId: '',
      deckName: '',
      deckArch: '',
      deckColors: '',
      deckManaCurve: {},
      deckWCCost: {},
      deckWCMissingCost: {},
      deckUpdates: [],
      deckGuide: '',
      deckGuideOrg: '',
      deckGuideEditing: false,
      isLoading: false,
      errorMsg: '',
      deckExportDialogVisible: false,
      needLoginDialogVisible: false,
      deckLiked: false,
      deckLikes: 0,
      isUserDeckOwner: false,
      deleteConfirmationDialogVisible: false
    }
  },
  created () {
    this.requestDeck()
    this.$scrollToTop()
  },
  methods: {
    requestDeck: function () {
      this.isLoading = true
      if (this.deckLoader) {
        this.currentTab = 3
        this.getDeckByCards()
      } else {
        this.getDeckByAlias()
      }
    },
    getDeckByAlias: function () {
      this.$api.getPublicDeck(this.deckAlias)
        .then(res => {
          this.isLoading = false
          this.breadcrumbs.push({
            text: res.data.name,
            disabled: true
          })
          this.deckId = res.data.id
          this.deckCards = res.data.cards
          this.sideboardCards = res.data.sideboard
          this.deckName = res.data.name
          this.deckArch = res.data.arch
          this.deckColors = res.data.colors
          this.deckManaCurve = res.data.manaCurve
          this.deckWCCost = DeckUtils.getDeckWCCost(this.deckCards, this.sideboardCards)
          this.deckUpdates = res.data.updates
          this.deckLiked = res.data.liked
          this.deckLikes = res.data.likes
          this.deckGuide = res.data.deckGuide !== undefined ? res.data.deckGuide : 'No **deck guide** yet'
          this.deckGuideOrg = this.deckGuide
          this.isUserDeckOwner = localStorage.getItem('localId').startsWith(res.data.ownerId)
          if (this.$isUserLogged()) {
            this.getDeckMissingCards()
          }
        })
        .catch(error => {
          this.isLoading = false
          console.log(error)
        })
    },
    getDeckByCards: function () {
      const cardsInfo = this.deckAlias.split('_')
      this.$api.convertMtgaIdToCards(cardsInfo[0], cardsInfo[1])
        .then(res => {
          this.isLoading = false
          this.deckCards = res.data.cards
          this.sideboardCards = res.data.sideboard
          this.reprintsCards = res.data.reprints
          this.deckName = res.data.name
          this.deckArch = res.data.arch
          this.deckColors = res.data.colors
          this.deckManaCurve = res.data.manaCurve
          this.deckWCCost = DeckUtils.getDeckWCCost(this.deckCards, this.sideboardCards)
          if (this.$isUserLogged()) {
            this.getDeckMissingCards()
          }
        })
        .catch(error => {
          this.isLoading = false
          console.log(error)
        })
    },
    getDeckMissingCards: function () {
      this.isLoading = false
      this.$api.getUserCollection()
        .then(res => {
          this.isLoading = false
          const userCollection = res.data
          const cardsWithMissingQtd = {}
          Object.keys(this.deckCards).forEach(mtgaId => {
            const card = this.deckCards[mtgaId]
            if (!card.type.includes('Basic Land')) {
              card.missingQtd = this.getCardMissingQtd(mtgaId, card.qtd, userCollection)
            }
            cardsWithMissingQtd[mtgaId] = card
          })
          this.deckCards = cardsWithMissingQtd
          const userCollectionWithoutMainDeck = this.getUserCollectionWithoutMainDeck(userCollection)
          const sideboardWithMissingQtd = {}
          Object.keys(this.sideboardCards).forEach(mtgaId => {
            const card = this.sideboardCards[mtgaId]
            if (!card.type.includes('Basic Land')) {
              card.missingQtd = this.getCardMissingQtd(mtgaId, card.qtd, userCollectionWithoutMainDeck)
            }
            sideboardWithMissingQtd[mtgaId] = card
          })
          this.sideboardCards = sideboardWithMissingQtd
          this.deckWCMissingCost = DeckUtils.getDeckWCMissingCost(userCollection,
            this.deckCards, this.sideboardCards, this.reprintsCards)
        })
        .catch(error => {
          this.isLoading = false
          console.log(error)
        })
    },
    getCardMissingQtd: function (mtgaId, cardQtd, userCollection) {
      let qtdOwned = userCollection[mtgaId] !== undefined ? userCollection[mtgaId] : 0
      if (this.reprintsCards !== undefined && this.reprintsCards[mtgaId] !== undefined) {
        this.reprintsCards[mtgaId].forEach(reprintCard => {
          qtdOwned += userCollection[reprintCard.mtgaid] !== undefined ? userCollection[reprintCard.mtgaid] : 0
        })
      }
      const missingQtd = cardQtd - qtdOwned
      return missingQtd > 0 ? missingQtd : 0
    },
    getUserCollectionWithoutMainDeck: function (userCollection) {
      const data = {}
      Object.assign(data, userCollection)
      Object.keys(this.deckCards).forEach(mtgaId => {
        const card = this.deckCards[mtgaId]
        const owned = data[mtgaId] !== undefined ? data[mtgaId] : 0
        const qtdWithoutMainDeck = owned - card.qtd
        data[mtgaId] = qtdWithoutMainDeck > 0 ? qtdWithoutMainDeck : 0
      })
      return data
    },
    exportDeckToArena: function () {
      this.deckExportDialogVisible = true
      DeckUtils.exportDeckToArena(this.deckCards, this.sideboardCards)
    },
    exportDeckToText: function () {
      this.deckExportDialogVisible = true
      DeckUtils.exportDeckToText(this.deckCards, this.sideboardCards)
    },
    cardsTotal: function (cards) {
      const cardsQtd = Object.keys(cards).map(mtgaId => cards[mtgaId].qtd)
      return cardsQtd.length > 0 ? cardsQtd.reduce((p, n) => p + n) : 0
    },
    like: function () {
      if (!this.$isUserLogged()) {
        this.needLoginDialogVisible = true
        return
      }
      if (this.deckLiked) {
        this.$api.deleteUserDeckLike(this.deckId)
          .then(res => {
            this.isLoading = false
            this.deckLiked = false
            this.deckLikes -= 1
          })
          .catch(error => {
            this.isLoading = false
            console.log(error)
          })
      } else {
        this.$api.postUserDeckLike(this.deckId)
          .then(res => {
            this.isLoading = false
            this.deckLiked = true
            this.deckLikes += 1
          })
          .catch(error => {
            this.isLoading = false
            console.log(error)
          })
      }
    },
    editDeck: function () {
      this.$router.replace(`/decks/${this.deckAlias}/edit?public=true`)
    },
    deleteDeck: function () {
      this.isLoading = true
      this.$api.deletePublicDeck(this.deckId)
        .then(res => {
          this.isLoading = false
          this.deleteConfirmationDialogVisible = false
          this.$router.replace('/decks')
        })
        .catch(error => {
          this.isLoading = false
          this.deleteConfirmationDialogVisible = false
          console.log(error)
        })
    },
    onDeckGuideCancel: function () {
      this.deckGuide = this.deckGuideOrg
      this.deckGuideEditing = false
    },
    onDeckGuideSave: function () {
      this.isLoading = true
      this.$api.postUserDeckGuide(this.deckId, this.deckGuide)
        .then(res => {
          this.isLoading = false
          this.deckGuideOrg = this.deckGuide
          this.deckGuideEditing = false
        })
        .catch(error => {
          this.isLoading = false
          console.log(error)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .line {
    height: 50%;
  }
  .deckTitle {
    justify-content: center;
  }
  .deckInfo {
    height: 100px;
  }
  .btExport {
    padding-right: 3%;
  }
  .mana {
    white-space: nowrap;
  }
  .mana img {
    height: 25px;
    width: 25px;
  }
  .manaCurve {
    width: 156px;
  }
  .wildcardsCost {
    transform: translateX(-5px);
  }
  .headerContainer {
    position: relative;
  }
  .column-reverse {
    flex-direction: column-reverse;
  }
  .overlay {
    position: absolute;
    margin-top: 0;
    top: 0;
    right: 0;
  }
  .overview {
    min-height: 600px;
    position: relative;
  }
  .deckGuideContainer {
    min-height: 400px;
  }
  .deckGuideButtons {
    position: absolute;
    top: -24px;
    left: calc(100% - 40px);
  }
  .deckGuideEditingButtons {
    position: absolute;
    top: -24px;
    left: calc(100% - 150px);
  }
  .likeButton {
    min-width: 50px;
    margin-left: 0px;
    margin-right: 0px;
    transform: translateX(-8px);
  }
</style>
