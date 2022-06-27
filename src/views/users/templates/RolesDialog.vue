<template>
  <v-layout row justify-center>
    <v-dialog persistent scrollable :value="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <div>
            <div class="headline">
              {{ userItem.first_name }} {{ userItem.last_name }}
            </div>
            <span class="grey--text">Roles</span>
          </div>
        </v-card-title>

        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel v-for="(role, i) in userItem.roles" :key="i">
              <v-expansion-panel-header>{{
                role.name
              }}</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-list>
                  <v-chip
                    class="ma-1"
                    color="primary darken-2"
                    small
                    v-for="permission in role.permissions"
                    :key="permission.id"
                    >{{ permission.name }}</v-chip
                  >
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog(userItem)">
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
      dialog: "user/openRoleDialog",
      userItem: "user/getUserItem"
    })
  },

  methods: {
    closeDialog(item) {
      let payload = {
        dialog: false,
        item: item
      };
      this.$store.commit("user/SET_USER_ITEM", payload);
    }
  }
};
</script>
