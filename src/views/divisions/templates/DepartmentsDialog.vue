<template>
  <v-layout row justify-center>
    <v-dialog width="500" :value="dialog" persistent>
      <v-card>
        <v-card-title>
          <div>
            <div class="headline">{{ divisionItem.name }}</div>
            <span class="grey--text">Departments</span>
          </div>
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-chip
              class="ma-1"
              color="primary darken-2"
              small
              v-for="department in divisionItem.departments"
              :key="department.id"
              >{{ department.name }}</v-chip
            >
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog(divisionItem)">
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
      dialog: "division/getDeptDialog",
      divisionItem: "division/getDivisionItem"
    })
  },

  methods: {
    closeDialog(item) {
      let payload = {
        dialog: false,
        item: item
      };
      this.$store.commit("division/SET_DIVISION_ITEM", payload);
    }
  }
};
</script>