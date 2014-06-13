Game = {
  disks: 3,
  steps: 0,
  max_steps: 0,
  gui: null,
  // GUI options
  options: { creation_effect: true, revert_duration: 500, auto_solve_speed: 500 },
  init: function() {
    Game.gui = new dat.GUI();
    Game.gui.add(Game, 'disks', 1, 16).step(1).name('Disk count').onFinishChange(function(value) {
      Game.reset_game();
    });
    Game.gui.add(Game, 'reset_game').name('Restart Game');
    Game.gui.add(Game, 'autoSolve').name('Teach me');
    Game.gui.add(Game.options, 'creation_effect').name('Creation Effect');
    Game.gui.add(Game.options, 'auto_solve_speed').step(1).name('Auto Solve Speed');
    $('.drop_peg').droppable({
      drop: Game.handleDiskDrop
    });
  },
  handleDiskDrop: function(event, ui) {
    var other_element = $(this).find('.inner div:first-child').eq(0);
    var other_disknumber = other_element ? other_element.data('disknumber') : 0;
    var source_disknumber = ui.draggable.data('disknumber');
    var source_parent = ui.draggable.parent();
    
    if (!other_disknumber || other_disknumber > source_disknumber) { 
      ui.draggable.draggable('option', 'revert', false);
      // corrige no caso de já ter um disco lá
      if (other_disknumber)
        $('#disk'+other_disknumber).draggable('disable');
      $(this).find('.inner').prepend(ui.draggable);
      // corrige, coloca o topo do peg antigo desse source_disknumber pra ser draggable
      // tenha em mente que source_parent vai ser o div .inner e não o div #pegN
      source_top_disk = source_parent.find('div:first-child');
      if(source_top_disk.data('disknumber'))
        source_top_disk.draggable('enable');
      ui.draggable.position( { of: $(this), my: 'center top', at: 'center top'});
      ui.draggable.draggable('option', 'revert', true);
      $('#count').html(++Game.steps);
      $('body').css('cursor', 'default');
      if ($('#peg3 .inner').children().length == Game.disks) {
        var timer;
        timer = setInterval(function () {
          confirm('Yay!!! You solved in '+Game.steps+' steps!');
          Game.reset_game();
          clearInterval(timer);
        }, Game.options.revert_duration);
      }
    }
  },
  autoSolve: function () {
    Game.options.creation_effect = false;
    Game.reset_game();
    Game.options.creation_effect = true;
    $('#disk1').draggable('disable');
    // Dá uma pequena pausa antes de começar.
    timer = setInterval(function () {
      Game.autoSolveCore(Game.disks, 1, 3);
      clearInterval(timer);
    }, Game.options.auto_solve_speed);
  },
  /**
   * @todo Find a way that this function may be stopped, i.e. user can request to stop it. Problem brought up by extensive use of JS function setInterval().
   */
  autoSolveCore: function(numberOfDisks, sPeg, dPeg) {
    if (numberOfDisks > 0) {
      var tmpPeg = 6 - sPeg - dPeg;

      // resolve a primeira parte recursiva
      Game.autoSolveCore(numberOfDisks-1, sPeg, tmpPeg);
      // dispara a ação de mover o disco daqui (Game.steps*Game.options.auto_solve_speed) milisegundos, explicando:
      // tendo auto_solve_speed como 500 ms,
      // vai começar a mover o primeiro disco daqui 500ms, o segundo disco daqui 1000ms, terceiro daqui 1500ms, sendo assim
      // um disco só vai mover quando o outro já tiver terminado.
      var timer = setInterval(function () {
        // vai ter três partes quando mover, e cada uma tem que pegar uma fatia do tempo total descrito acima
        var timer_pt1 = setInterval(function () {
          $('#disk'+numberOfDisks).fadeOut(Game.options.auto_solve_speed / 3);
          clearInterval(timer_pt1);
        }, Game.options.auto_solve_speed / 3);
        var timer_pt2 = setInterval(function () {
          $('#peg'+dPeg).find('.inner').prepend($('#peg'+sPeg+' .inner div:first-child'));
          clearInterval(timer_pt2);
        }, 2*(Game.options.auto_solve_speed / 3));
        var timer_pt3 = setInterval(function () {
          $('#disk'+numberOfDisks).fadeIn(Game.options.auto_solve_speed / 3);
          $('#count').html(Game.max_steps+1-(Game.steps--));
          clearInterval(timer_pt3);
        }, Game.options.auto_solve_speed);
        clearInterval(timer);
      }, Game.steps*Game.options.auto_solve_speed);
      Game.steps++;
      // resolve a segunda parte resursiva
      Game.autoSolveCore(numberOfDisks-1, tmpPeg, dPeg);
    }
  },
  reset_game: function (init) {
    $('#peg2').find('.inner').html('');
    $('#peg3').find('.inner').html('');
    Game.create_disks();
    Game.max_steps = Math.pow(2, Game.disks) - 1;
    $('#count').html(Game.steps = 0);
  },
  create_disks: function () {
    peg1 = $('#peg1').find('.inner');
    peg1.html('');
    width = 40;
    for(var k = 1; k <= Game.disks; k++) {
      e = $('<div class="disk" id="disk'+k+'"></div>').data('disknumber', k);
      e.css('width', width);
      peg1.append(e);
      if (Game.options.creation_effect) {
        e.css('opacity', '0');
      }

      e.draggable({
         cursor: 'move', 
         stack: '.main_area', // brings elements to front.
         revert: true, // sets the element to return to its start location
         revertDuration: Game.options.revert_duration
      });
      
      // just the top disks will be draggable
      if (k != 1)
        e.draggable('disable');

      width += 20;
    }
    // animate disk creation through timer each 500 ms
    if (Game.options.creation_effect) {
      var k = Game.disks;
      var timer;
      timer = setInterval(function () {
        $('#disk'+k+'').animate({opacity: '1'});
        k--;
        if (k == 0)
          clearInterval(timer);
        console.log('animating...');
      }, 250);
    }
    // end
    // scale elements
    $('.drop_peg').css('width', width);
    $('.drop_peg').css('height', Game.disks*24);
    $('.base').css('width', width*3 + 10);
    $('.inner').css('width', width);
    // se eu colocar a altura de .box como sendo o mesmo que o pai dele, que é .drophere, os elementos não vão
    // 'grudar no fundo, eles vão 'grudar' em cima.
    //alert($('#peg1 .inner div:first').data('disknumber') + ' is on top of peg1');
  }
}

$(document).ready(function() {
  Game.init();
  Game.reset_game(true);
});