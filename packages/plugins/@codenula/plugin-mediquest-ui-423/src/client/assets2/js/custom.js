document.querySelector('.btn-toggle').addEventListener('click', function(event) {
    event.preventDefault();
    var target = document.querySelector('.header-navbar .menu-list');
    if (target.classList.contains('show')) {
        target.classList.remove('show');
    } else {
        target.classList.add('show');
    }
});

var accBtn = document.getElementsByClassName("accordion-btn");
var i;

for (i = 0; i < accBtn.length; i++) {
  accBtn[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}


var modals = document.querySelectorAll("[data-modal]");
modals.forEach(function (trigger) {
  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    var modal = document.getElementById(trigger.dataset.modal);
    modal.classList.add("open");     
    var exits = modal.querySelectorAll(".modal-exit");
    exits.forEach(function (exit) {
      exit.addEventListener("click", function (event) {
        event.preventDefault();
        modal.classList.remove("open");
      });
    });
  });
});

$(document).ready(function () {


});

$(window).resize(function () {
    

});

$(window).scroll(function () {
  
  
});