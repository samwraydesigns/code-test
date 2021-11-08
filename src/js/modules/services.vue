<template>
  <div class="row">
    <div class="col-md-4 services__item" v-for="(item) in resultData" :key="item.id">
      <img :src="item.image" :alt="item.name" />
      <h3>{{item.name}}</h3>
      <p>{{item.description}}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios-es6';

export default {
  name: 'Services',

  data: function() {
    return {
      resultData: []
    };
  },
  created: function() {
    axios
      .get('https://api.mocki.io/v2/561baaaa')
      .then((response) => {
        this.resultData = response.data.services;
        console.log(response.data.services);
        // response.data.forEach((movie) => console.log(movie.title));
      })
      .catch((err) => console.error(err.message));
  }
};
</script>
