// import axios from 'axios-es6';
import Vue from 'vue';
const init = () => {
  // Setup the data for the to do list (and and attach to index.html)

  axios
    .get('https://api.mocki.io/v2/561baaaa')
    .then((response) => {
      console.log(response.data.services);
      // response.data.forEach((movie) => console.log(movie.title));
    })
    .catch((err) => console.error(err.message));
};

export { init };
