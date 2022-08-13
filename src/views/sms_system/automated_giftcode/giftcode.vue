<template>
  <div>
    <v-container grid-list-md text-xs-center>
        <template>
  <v-card
    color="dark lighten-2"
    dark
  >
    <v-card-title class="text-h5 dark lighten-3">
      Validate GiftCode 
    </v-card-title>
    <v-card-text>
      EX: HBDSUKIABCD1234
 
    </v-card-text>
    <v-card-text>
      <v-autocomplete
        v-model="model"
        :items="entries"
        :loading="isLoading"
        :search-input.sync="search"
        color="white"
        hide-no-data
        hide-selected
        item-text="code"
        item-value="code"
        label="Validate Your Customer Gift Code"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
        return-object
      ></v-autocomplete>
    </v-card-text>
    <v-divider></v-divider>
    <v-expand-transition>
      <v-list
        v-if="model"
        class="dark lighten-3"
      >
        <v-list-item
          v-for="(field, i) in fields"
          :key="i"
        >
          
        <label><strong>NAME:</strong> <strong style="text-decoration: underline;">{{field.name}}</strong><br>
        <strong>GIFT CODE:</strong> <strong style="text-decoration: underline; color: green;">{{field.code}}</strong><br>
        <strong>DATE SENT:</strong> <strong>{{new Date(field.created_at)}}</strong><br>
        <strong>BIRTHDAY:</strong> <strong>{{new Date(field.birthday).toDateString()}}</strong><br><br>
        <strong>MESSAGE:</strong><br> <small>{{ field.message}}</small><br>
        <strong>STATUS:</strong><br> <div :style='field.status == "VALID"? "color: green; font-weight: bold;":"color: red; font-weight: bold;"'>{{ field.status}}</div>
        </label>
         
        </v-list-item>
      </v-list>
    </v-expand-transition>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="!model"
        color="grey darken-3"
        @click="model = null"
      >
        Clear
        <v-icon right>
          mdi-close-circle
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template> 
    </v-container>
  </div>
</template>

 <script>
  export default {
    data: () => ({
      descriptionLimit: 60,
      entries: [],
      isLoading: false,
      model: null,
      search: null,
    }),

    computed: {
      fields () {
         return [this.model];
      },
 
    },

    watch: {
      search (val) {
        // Items have already been loaded
        
         
        // Items have already been requested
        if (this.isLoading) return

        this.isLoading = true

        // Lazily load input items
        fetch('http://127.0.0.1:8000/api/sms/giftcode/fetch?search='+val)
          .then(res => res.json())
          .then(res => {
            const { count, entries } = res
            this.count = count
            this.entries = entries
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.isLoading = false))
      },
    },
  }
</script>