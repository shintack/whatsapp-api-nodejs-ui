<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title> Whastapp API </q-toolbar-title>

        <div class="row q-col-gutter-sm">
          <!-- <q-input
            v-if="!isLoggedin()"
            class="col"
            color="white"
            outlined
            label="API URL"
            dense
            v-model="url"
            type="url"
          ></q-input>
          <q-input
            v-if="!isLoggedin()"
            class="col"
            color="white"
            outlined
            label="TOKEN"
            dense
            v-model="token"
          ></q-input> -->
          <div class="col-auto">
            <q-btn
              v-if="isLoggedin()"
              icon="logout"
              color="red"
              @click="confirmLogout()"
              label="logout"
            >
              <q-tooltip>Logout</q-tooltip>
            </q-btn>
            <!-- <q-btn
              v-else
              icon="login"
              color="white"
              logout
              flat
              @click="setToken(token, url)"
            >
              <q-tooltip>Login</q-tooltip>
            </q-btn> -->
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <div class="row q-ma-xl" v-if="!isLoggedin()">
        <div class="col-12 col-md-4"></div>
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <q-input
                outlined
                label="API URL"
                v-model="url"
                type="url"
                class="q-mb-md"
              ></q-input>
              <q-input outlined label="TOKEN" v-model="token"></q-input>
            </q-card-section>
            <q-card-actions align="center">
              <q-btn
                color="primary"
                icon="login"
                label="login"
                logout
                @click="setToken(token, url)"
              >
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="col-12 col-md-4"></div>
      </div>
      <div v-if="isLoggedin()" class="q-pa-md">
        <div class="text-h6">Connected to: {{ store.baseUrlApi }}</div>
        <div class="text-caption text-italic text-red">
          Silahkan <span class="text-bold">LOGOUT</span> jika sudah tidak
          dipergunakan, aplikasi akan tetap login selama cache pada local
          storage masih ada!
        </div>
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
// import EssentialLink from "components/EssentialLink.vue";
import { useSessionStore } from "src/stores/session-store";

const linksList = [
  // {
  //   title: "Docs",
  //   caption: "quasar.dev",
  //   icon: "school",
  //   link: "https://quasar.dev",
  // },
  // {
  //   title: "Github",
  //   caption: "github.com/quasarframework",
  //   icon: "code",
  //   link: "https://github.com/quasarframework",
  // },
  // {
  //   title: "Discord Chat Channel",
  //   caption: "chat.quasar.dev",
  //   icon: "chat",
  //   link: "https://chat.quasar.dev",
  // },
  // {
  //   title: "Forum",
  //   caption: "forum.quasar.dev",
  //   icon: "record_voice_over",
  //   link: "https://forum.quasar.dev",
  // },
  // {
  //   title: "Twitter",
  //   caption: "@quasarframework",
  //   icon: "rss_feed",
  //   link: "https://twitter.quasar.dev",
  // },
  // {
  //   title: "Facebook",
  //   caption: "@QuasarFramework",
  //   icon: "public",
  //   link: "https://facebook.quasar.dev",
  // },
  // {
  //   title: "Quasar Awesome",
  //   caption: "Community Quasar projects",
  //   icon: "favorite",
  //   link: "https://awesome.quasar.dev",
  // },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    // EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const store = useSessionStore();
    const setToken = (token, url) => store.login(token, url); // use action
    const removeToken = (token, url) => store.logout(token, url); // use action
    const isLoggedin = () => store.isLoggedin(); // use action

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      store,
      setToken,
      removeToken,
      isLoggedin,
    };
  },

  data() {
    return {
      token: null,
      url: "",
      instances: [],
      qrcode: null,
      messageQrcode: "",
      currentKey: null,
    };
  },
  methods: {
    confirmLogout() {
      this.$q
        .dialog({
          title: "Konfirmasi!",
          message:
            "Semua cache terkait aplikasi ini pada local storage browser anda akan dihapus",
          // prompt: {
          //   model: "",
          // },
          cancel: true,
          persistent: true,
        })
        .onOk((data) => {
          this.removeToken();
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
  },
});
</script>
