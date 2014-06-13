Game = {
  disks: 3,
  steps: 0,
  gui: null,
  // GUI options
  options: { creation_effect: true, revert_duration: 500 },
  init: function() {
    Game.gui = new dat.GUI();
    Game.gui.add(Game, 'disks', 1, 16).step(1).name('Disk count').onFinishChange(function(value) {
      Game.reset_game();
    });
    Game.gui.add(Game, 'reset_game').name('Restart Game');
    Game.gui.add(Game.options, 'creation_effect').name('Creation Effect');
    $('.drop_peg').droppable({
      drop: Game.handleDiskDrop
    });
  },
  handleDiskDrop: function(event, ui) {
    var top_element = $(this).find('.inner div:first-child');
    var top_number = top_element.data('disknumber'); 
    var source_number = ui.draggable.data('disknumber');
    
    // se tiver um elemento lá na torre alvo, a torre que recebeu o drop
    if (top_element) {
      // se não tiver um número de disco, ou se o disco lá for maior que esse aqui que tá no drag, então move
      if (!top_number || top_number > source_number) {
        // desabilita o revert pra que o DOM ele não possa voltar pra onde ele tava antes 
        ui.draggable.draggable('option', 'revert', false);
        // move o DOM ele, pra lá, a prepend vai mover, se ele já for filho de outro DOM ele.
        $(this).find('.inner').prepend(ui.draggable);
        // altera a posição dele pra na ponta da torre
        ui.draggable.position( { of: $(this), my: 'center top', at: 'center top'});
        // ativa o revert, sendo assim ele vai desligar pra baixo por causa das regras CSS (more refs?!)
        ui.draggable.draggable('option', 'revert', true);
        // incrementa o contador de passos realizados
        $('#count').html(++Game.steps);
        // checa se o jogo terminou
        if ($('#peg3 .inner').children().length == Game.disks) {
          // só mostra a msg quando o revert da última peça acabar
          // dispara uma callback que na primeira vez que ela terminar vai se matar.
          // @TODO: fix this, its not working poperly, dunno why yet.
          var timer;
          timer = setInterval(function () {
            confirm('Yay!!! You solved in '+Game.steps+' steps!');
            Game.reset_game();
            console.log('Func executing...');
            clearInterval(timer);
          }, Game.options.revert_duration);
        }
      }       
    }
    
    //alert('top_element: '+typeof(top_element)+'\ntop_number: '+top_number+'\nsource_number: '+source_number);
    
    // se tem um topo onde ele tá arrastando o disco e o número do disco lá é maior que esse que ele tá arrastando
    /*// então joga pra cima do peg
    if (top_element && target.) {
      top_element.draggable('disable');
          
    }
    alert(ui.draggable.data('disknumber') + ' was dropped onto me!');*/	
  },
  reset_game: function () {
    $('#peg2').find('.inner').html('');
    $('#peg3').find('.inner').html('');
    Game.create_disks();
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
      	 revertDuration: Game.options.revert_duration,
      	 // what should be done when the drag stops
      	 end: function(event, ui) {
      	  alert(ui.draggable.data('disknumber') + ' was moved!');	
      	 }
      });
      
      // just the top disks will be draggable
     /* if (k != 1)
        e.draggable('disable');*/

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
  Game.reset_game();
});