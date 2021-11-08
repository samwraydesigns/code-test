const init = () => {
  //  ===========================================
  //  = Load scripts based on modernizer tests  =
  //  ===========================================

  if (!Modernizr.picture) {
    $.getScript('/build/js/picturefill.min.js');
  }

  // exammple of a method being invoked after a script

  // if(!Modernizr.input.placeholder) {
  //   $.getScript('/Static/build/js/jquery.placeholder.min.js')
  //     .done(() => {
  //       $('input, textarea').placeholder();
  //     });
  // }
};

export { init };
