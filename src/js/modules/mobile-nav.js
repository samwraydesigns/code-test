const init = () => {
  $('.js-nav-btn').click(function() {
    $('body').toggleClass('body--nav-open');
  });
};

export { init };
