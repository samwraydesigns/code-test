import Vue from 'vue';
import * as polyfills from './modules/polyfills';
import * as mobileNav from './modules/mobile-nav';
import servicesVue from './modules/services.vue'; // booking centre

$(function() {
  polyfills.init();
  mobileNav.init();
});

// Setup vue for Services
const servicesElement = document.querySelector('services');
if (servicesElement) {
  new Vue({
    el: servicesElement,
    components: {
      services: servicesVue
    }
  });
}
