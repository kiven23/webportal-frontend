<template>
  <v-layout row justify-center>
    <v-dialog width="500" :value="dialog" persistent>
      <v-card>
        <v-card-title>
          <div>
            <div class="headline">{{ regionItem.name }}</div>
            <span class="grey--text">Branches</span>
          </div>
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-chip
              class="ma-1"
              color="primary darken-2"
              small
              v-for="branch in regionItem.branches"
              :key="branch.id"
              >{{ branch.name }}</v-chip
            >
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog(regionItem)">
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
      dialog: "region/getBranchDialog",
      regionItem: "region/getRegionItem"
    })
  },

  methods: {
    closeDialog(item) {
      let payload = {
        dialog: false,
        item: item
      };
      this.$store.commit("region/SET_REGION_ITEM", payload);
    }
  }
};
</script>
