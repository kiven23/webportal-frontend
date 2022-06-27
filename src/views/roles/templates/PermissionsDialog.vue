<template>
  <v-layout row justify-center>
    <v-dialog scrollable width="500" :value="dialog" persistent>
      <v-card>
        <v-card-title>
          <div>
            <div class="headline">{{ roleItem.name }}</div>
            <span class="grey--text">Permissions</span>
          </div>
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-chip
              class="ma-1"
              color="primary darken-2"
              small
              v-for="permission in roleItem.permissions"
              :key="permission.id"
              >{{ permission.name }}</v-chip
            >
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog(roleItem)">
            CLOSE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      dialog: "role/getPermDialog",
      roleItem: "role/getRoleItem"
    })
  },

  methods: {
    closeDialog(item) {
      let payload = {
        dialog: false,
        item: item
      };
      this.$store.commit("role/SET_ROLE_ITEM", payload);
    }
  }
};
</script>
