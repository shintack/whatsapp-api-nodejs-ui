<template>
  <q-page class="">
    <q-card v-if="!isLoggedin()" class="bg-red text-white">
      <q-card-section>
        <div class="text-h5">
          Silahkan setup <span class="text-bold"> API URL </span> dan
          <span class="text-bold"> TOKEN </span> terlebih dahulu...
        </div>
      </q-card-section>
    </q-card>
    <q-card v-else>
      <q-card-section>
        <q-btn
          class="q-mr-sm"
          @click="restoreInstance"
          icon="refresh"
          color="warning"
          label="Restore Devices"
          size="sm"
        ></q-btn>
        <q-btn
          class="q-mr-sm"
          @click="fetchInstance"
          icon="list"
          color="secondary"
          label="List Devices"
          size="sm"
        ></q-btn>
        <q-btn
          class="q-mr-sm"
          @click="addDeviceDialog"
          icon="add"
          color="primary"
          label="Add Devices"
          size="sm"
        ></q-btn>
      </q-card-section>
      <q-card-section>
        <div v-if="instances.length === 0" class="bg-red text-white q-pa-md">
          <span class="text-h6">
            Belum ada device terdaftar. Silahkan
            <span class="text-bold">ADD DEVICE</span>
          </span>
        </div>
        <q-list bordered v-if="instances.length > 0">
          <q-item v-for="(instance, index) in instances" :key="index">
            <q-item-section>
              <span class="text-bold">{{ instance.instance_key }}</span>
            </q-item-section>
            <q-item-section>
              {{ instance.user }}
            </q-item-section>
            <q-item-section side>
              <div>
                <!-- <q-btn
                  label="detail"
                  @click="fetchDetail(instance.instance_key)"
                ></q-btn> -->
                <q-btn
                  label="delete"
                  @click="fetchDelete(instance.instance_key)"
                ></q-btn>
                <q-btn
                  v-if="instance.user && instance.user.id"
                  label="logout"
                  @click="logoutInstance(instance.instance_key)"
                ></q-btn>
                <q-btn
                  v-else
                  label="Scan QRCode"
                  @click="openQrDialog(instance.instance_key)"
                ></q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog
      ref="scanQr"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 300px">
        <q-card-section class="text-center">
          <div
            :class="
              qrcode
                ? 'bg-primary text-white text-bold q-pa-md'
                : 'bg-red text-white text-bold q-pa-md'
            "
          >
            {{ messageQrcode }}
          </div>
          <q-img :src="qrcode"></q-img>
          <q-btn
            v-if="qrcode"
            icon="refresh"
            :label="`refresh qrcode in: ${counter}`"
            @click="fetchQr(currentKey)"
          ></q-btn>
        </q-card-section>
        <q-card-actions align="center" class="">
          <q-btn icon="close" flat label="close" @click="closeQrcode" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Notify } from "quasar";
import { defineComponent } from "vue";
import { useSessionStore } from "src/stores/session-store";

export default defineComponent({
  name: "IndexPage",
  setup() {
    const store = useSessionStore();
    const setDevices = (devices) => store.setDevices(devices);
    const isLoggedin = () => store.isLoggedin();

    return {
      store,
      setDevices,
      isLoggedin,
    };
  },
  mounted() {
    this.instances = this.store.devices;
  },
  data() {
    return {
      instances: [],
      qrcode: null,
      messageQrcode: "",
      currentKey: null,
      counter: 15,
      limitInterval: 1500,
      interval: null,
    };
  },
  methods: {
    closeQrcode() {
      this.messageQrcode = "";
      this.currentKey = null;
      this.$refs.scanQr.hide();
      this.stopCounter();
    },
    openQrDialog(key) {
      this.$refs.scanQr.show();
      this.fetchQr(key);
      this.startCounter();
    },
    addDeviceDialog() {
      this.$q
        .dialog({
          title: "Add custom key?",
          message:
            "biarkan kosong jika ingin menggunakan random key (recomended)",
          prompt: {
            model: "",
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data) => {
          this.createInstance(data);
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
    async startCounter() {
      this.interval = await setInterval(() => {
        if (this.counter === 0) {
          this.counter = 21;
          this.fetchQr(this.currentKey);
          this.fetchDetail(this.currentKey);
        }
        --this.counter;
      }, this.limitInterval);
    },
    stopCounter() {
      clearInterval(this.interval);
      this.counter = 16;
    },
    async restoreInstance() {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/restore`,
          {
            method: "GET",
            headers: headersList,
          }
        );
        const { data, message, error } = await response.json();
        if (error) {
          Notify.create({
            message,
            color: "red",
          });
        }
        if (data.length > 0) {
          setTimeout(() => {
            this.fetchInstance();
          }, 2000);
        } else {
          Notify.create({
            message:
              "Tidak ada device yang bisa di restore, silahkan ADD DEVICE",
            color: "red",
          });
        }
      } catch (error) {
        Notify.create({
          message: "Gagal load restore device, silahkan coba lagi",
          color: "red",
        });
      }
    },
    async fetchInstance() {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(`${this.store.baseUrlApi}/instance/list`, {
          method: "GET",
          headers: headersList,
        });

        const { data, error, message } = await response.json();
        if (error) {
          Notify.create({
            message,
            color: "red",
          });
        }
        this.instances = data;
        this.setDevices(data);
      } catch (error) {
        Notify.create({
          message: "Gagal mamuat data, silahkan coba beberapa saat lagi",
          color: "red",
        });
      }
    },
    async createInstance(customKey = null) {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/init?key=${customKey}`,
          {
            method: "GET",
            headers: headersList,
          }
        );

        const { error, data, message } = await response.json();
        if (error) {
          Notify.create({
            message,
            color: "red",
          });
        } else {
          this.fetchInstance();
          Notify.create({
            message: "Berhasil menambahkan device, silahkan scan qrcode",
          });
        }
      } catch (error) {
        Notify.create({
          message: "Gagal menambahkan device, silahkan scan qrcode",
          color: "red",
        });
      }
    },
    async fetchDetail(key) {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/info?key=${key}`,
          {
            method: "GET",
            headers: headersList,
          }
        );
        const data = await response.json();
        if (data.instance_data?.user?.id) {
          this.closeQrcode();
          this.fetchInstance();
        }
      } catch (error) {
        Notify.create({
          message: "Gagal memuat data, silahkan coba setelah beberapa saat",
          color: "red",
        });
      }
    },
    async fetchQr(key) {
      try {
        this.messageQrcode = "Sedang memuat qrcode";
        this.qrcode = null;
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/qrbase64?key=${key}`,
          {
            method: "GET",
            headers: headersList,
          }
        );

        const { qrcode } = await response.json();
        if (qrcode === " ") {
          this.messageQrcode =
            "instance is expired. silahkan delete dan create ulang instance";
        } else {
          this.messageQrcode =
            "silahkan scan qr code menggunakan aplikasi Whatsapp";
          this.qrcode = qrcode;
        }
        this.currentKey = key;
        return qrcode;
      } catch (error) {
        Notify.create({
          message: "Gagal memuat data, silahkan coba setelah beberapa saat",
          color: "red",
        });
      }
    },
    async fetchDelete(key) {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/delete?key=${key}`,
          {
            method: "DELETE",
            headers: headersList,
          }
        );

        let data = await response.json();
        this.fetchInstance();
        Notify.create({
          message: "Berhasil menghapus devices.",
          color: "red",
        });
      } catch (error) {
        Notify.create({
          message: "Gagal memuat data, silahkan coba setelah beberapa saat",
          color: "red",
        });
      }
    },
    async logoutInstance(key) {
      try {
        let headersList = {
          Accept: "*/*",
          Authorization: `Bearer ${this.store.token}`,
        };

        let response = await fetch(
          `${this.store.baseUrlApi}/instance/logout?key=${key}`,
          {
            method: "DELETE",
            headers: headersList,
          }
        );

        let data = await response.json();
        this.fetchInstance();
        Notify.create({
          message: "Device berhasil logout.",
        });
      } catch (error) {
        Notify.create({
          message: "Gagal memuat data, silahkan coba setelah beberapa saat",
          color: "red",
        });
      }
    },
  },
});
</script>
