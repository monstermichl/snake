SNAKE_DIRECTIONS =
{
   NONE  : 0,
   UP    : 1,
   DOWN  : 2,
   LEFT  : 3,
   RIGHT : 4
};

function snake_tile(size, x, y, class_id)
{
   if ((class_id === null) || (class_id === undefined)) {
      class_id = 'tile';
   }
   this._size = size;
   this._node = document.createElement('div');
   
   /* set node attributes */
   this._node.setAttribute('class' , class_id);
   this._node.style.position = 'absolute';
   this._node.style.height   = this._size + 'px';
   this._node.style.width    = this._size + 'px';
   
   /* define public methods */
   this.setX = function(x)
   {
      this._x = x;
      this._node.style.left = (this._size * this._x) + 'px';
   };
   
   this.setY = function(y)
   {
      this._y = y;
      this._node.style.top = (this._size * this._y) + 'px';
   };
   this.getX    = function() { return this._x;    };
   this.getY    = function() { return this._y;    };
   this.getNode = function() { return this._node; };
   
   /* set positon */
   this.setX(x);
   this.setY(y);
}

function snake_food(size, x, y)
{
   FOODS =
   [
      'apple',
      'banana',
      'pear'
   ];
   food_class = FOODS[Math.floor(Math.random() * FOODS.length)];
   
   /* inherit from snake_tile */
   snake_tile.call(this, size, x, y, food_class);
   snake_food.prototype = Object.create(snake_tile.prototype);
   snake_food.prototype.constructor = snake_food;
}

function snake_brick(size, x, y)
{
   /* inherit from snake_tile */
   snake_tile.call(this, size, x, y, 'brick');
   snake_brick.prototype = Object.create(snake_tile.prototype);
   snake_brick.prototype.constructor = snake_brick;
}

function snake_bodyPart(size, x, y)
{
   /* inherit from snake_tile */
   snake_tile.call(this, size, x, y, 'snakepart');
   snake_bodyPart.prototype = Object.create(snake_tile.prototype);
   snake_bodyPart.prototype.constructor = snake_bodyPart;
 
   MOVE_WIDTH = 1;
   this._direction  = SNAKE_DIRECTIONS.NONE;
   
   this._lookAhead = function(look_at_x, look_at_y)
   {
      if ((look_at_x === undefined) || (look_at_x === null)) {
         look_at_x = this.getX();
      }
      
      if ((look_at_y === undefined) || (look_at_y === null)) {
         look_at_y = this.getY();
      }
      return { x : look_at_x, y : look_at_y };
   };
   
   this.getDirection = function() {
      return this._direction;
   };
   
   this.moveTo = function(x, y)
   {
      this._last_y = this.getY(); /* refresh y-position as well */
      this._last_x = this.getX(); /* refresh x-position as well */
      
      if ((x !== undefined) && (x !== null))
      {
         if (this._x < x) {
            this._direction = SNAKE_DIRECTIONS.RIGHT;
         }
         else if (this._x > x) {
            this._direction = SNAKE_DIRECTIONS.LEFT;
         }
         this.setX(x);
      }
      
      if ((y !== undefined) && (y !== null))
      {
         if (this._y < y) {
            this._direction = SNAKE_DIRECTIONS.DOWN;
         }
         else if (this._y > y) {
            this._direction = SNAKE_DIRECTIONS.UP;
         }
         this.setY(y);
      }
      return { x : this.getX(), y : this.getY() };
   };
   
   this.moveLeft       = function() { return this.moveTo(this.getX() - MOVE_WIDTH, null); };
   this.moveRight      = function() { return this.moveTo(this.getX() + MOVE_WIDTH, null); };
   this.moveUp         = function() { return this.moveTo(null, this.getY() - MOVE_WIDTH); };
   this.moveDown       = function() { return this.moveTo(null, this.getY() + MOVE_WIDTH); };
   this.lookAheadLeft  = function() { return this._lookAhead(this.getX() - MOVE_WIDTH, null); };
   this.lookAheadRight = function() { return this._lookAhead(this.getX() + MOVE_WIDTH, null); };
   this.lookAheadUp    = function() { return this._lookAhead(null, this.getY() - MOVE_WIDTH); };
   this.lookAheadDown  = function() { return this._lookAhead(null, this.getY() + MOVE_WIDTH); };
   this.getLastX       = function() { return this._last_x; };
   this.getLastY       = function() { return this._last_y; };
   
   this.moveTo(this.getX(), this.getY());
}

function snake_snake(part_size, start_length, start_x, start_y, tiles_cb, die_cb, grow_by)
{
   if ((start_length > 0) && (typeof tiles_cb === 'function') && (typeof die_cb === 'function'))
   {
      this._parts     = [];
      this._part_size = part_size;
      this._tiles_cb  = tiles_cb;
      this._die_cb    = die_cb;
      this._dead      = false;
      
      if (grow_by > 0) {
         this._grow_by = grow_by;
      }
      else {
         this._grow_by = 2;
      }
      
      this._grow = function()
      {
         last_part = this._parts[this._parts.length - 1];
         
         for (i = 0; i < this._grow_by; ++i) {
            this._parts.push(new snake_bodyPart(this._part_size, last_part.getX(), last_part.getY()));
         }
      };
      
      this._die = function()
      {
         this._dead = true;
         this._die_cb(); /* call die-callback to inform environment */
      };
      
      this._refresh = function()
      {
         last_x = 0;
         last_y = 0;
         
         for (i = 1; i < this._parts.length; ++i)
         {
            last_x = this._parts[i - 1].getLastX();
            last_y = this._parts[i - 1].getLastY();
            
            this._parts[i].moveTo(last_x, last_y);
         }
      };
      
      this._refreshPosition = function(direction)
      {
         consumed_tiles = [];
         
         if (this._dead === false)
         {
            switch (direction)
            {
               case SNAKE_DIRECTIONS.UP   : look_ahead_info = this._parts[0].lookAheadUp()   ; break;
               case SNAKE_DIRECTIONS.DOWN : look_ahead_info = this._parts[0].lookAheadDown() ; break;
               case SNAKE_DIRECTIONS.LEFT : look_ahead_info = this._parts[0].lookAheadLeft() ; break;
               case SNAKE_DIRECTIONS.RIGHT: look_ahead_info = this._parts[0].lookAheadRight(); break;

               default: look_ahead_info = null; break;
            }

            if (look_ahead_info !== null)
            {
               if (this._occupies(look_ahead_info.x, look_ahead_info.y, true) === null)
               {
                  tiles = this._tiles_cb(look_ahead_info.x, look_ahead_info.y); /* request tiles at position from environment */

                  for (i = 0; i < tiles.length; ++i)
                  {
                     tile = tiles[i];
                     switch(tile.constructor)
                     {
                        case snake_food:
                        {
                           this._grow();
                           consumed_tiles.push(tile);

                           break;
                        }
                        case snake_brick:
                        {
                           this._die();
                           break;
                        }
                     }
                  }
                  
                  if (this._dead !== true)
                  {
                     switch (direction)
                     {
                        case SNAKE_DIRECTIONS.UP   : this._parts[0].moveUp()   ; break;
                        case SNAKE_DIRECTIONS.DOWN : this._parts[0].moveDown() ; break;
                        case SNAKE_DIRECTIONS.LEFT : this._parts[0].moveLeft() ; break;
                        case SNAKE_DIRECTIONS.RIGHT: this._parts[0].moveRight(); break;
                     }
                     this._refresh();
                  }
               }
               else {
                  this._die();
               }
            }
         }
         return consumed_tiles;
      };
      
      this._occupies = function(x, y, except_head)
      {
         occupied_by = null;
         for (i = ((except_head === true) ? 1 : 0); i < this._parts.length; ++i)
         {
            if ((this._parts[i].getX() === x) && (this._parts[i].getY() === y))
            {
               occupied_by = this._parts[i];
               break;
            }
         }
         return occupied_by;
      };
      
      this.occupies = function(x, y) {
         return this._occupies(x, y, false);
      };
            
      this.reanimate = function() {
         this._dead = false;
      };
      
      this.getParts = function() {
         return this._parts;
      };
      
      this.getNodes = function()
      {
         nodes = [];
         
         for (i = 0; i < this._parts.length; ++i) {
            nodes[i] = this._parts[i].getNode();
         }
         return nodes;
      };
      
      this.moveLeft = function() {
         return this._refreshPosition(SNAKE_DIRECTIONS.LEFT); /* just move head, body is following head when 'refresh' is called */
      };
      
      this.moveRight = function() {
         return this._refreshPosition(SNAKE_DIRECTIONS.RIGHT); /* just move head, body is following head when 'refresh' is called */
      };
      
      this.moveUp = function() {
         return this._refreshPosition(SNAKE_DIRECTIONS.UP); /* just move head, body is following head when 'refresh' is called */
      };
      
      this.moveDown = function() {
         return this._refreshPosition(SNAKE_DIRECTIONS.DOWN); /* just move head, body is following head when 'refresh' is called */
      };
      
      for (i = 0; i < start_length; ++i) {
         this._parts[i] = new snake_bodyPart(this._part_size, start_x - i, start_y);
      }
   }
}

function snake_container(div_id, size_x, size_y, start_length, speed_ms, score_cb)
{
   this._container = document.getElementById(div_id);
   if (this._container !== null)
   {
      if ((start_length <= size_x) || (start_length <= size_y))
      {
         this._start_length = start_length;
         this._tile_size    = 0;
         this._tiles        = [];
         this._snake        = null;
         this._speed_ms     = speed_ms;
         this._score_cb     = score_cb;
         this._direction    = SNAKE_DIRECTIONS.NONE;
         this._move_ticker  = null;
         this._food         = null;
         this._score        = 0;

         this._container.style.position = 'relative';
         this._container.style.margin   = 'auto';

         tile_size_x = this._container.offsetWidth  / size_x;
         tile_size_y = this._container.offsetHeight / size_y;

         if (tile_size_y < tile_size_x) {
            this._tile_size = tile_size_y;
         }
         else {
            this._tile_size = tile_size_x;
         }
         
         this._updateSnakeNodes = function()
         {
            if (this._snake !== null)
            {
               nodes    = this._snake.getNodes();                                 /* retrieve actual snake DOM-nodes */
               children = Array.prototype.slice.call(this._container.childNodes); /* convert nodelist to array to use indexOf (this is not done
                                                                                     each time in the for-loop since it would decrease performance
                                                                                     extensively after the snake is getting bigger) */
               
               for (i = 0; i < nodes.length; ++i)
               {
                  if (children.indexOf(nodes[i]) < 0) { /* add only new nodes */
                     this._container.appendChild(nodes[i]);
                  }
               }
            }
         };
         
         this._updateScore = function(score)
         {
            this._score = score;
            
            if (typeof this._score_cb === 'function') {
               this._score_cb(this._score);
            }
         };
         
         object_reference = this; /* refer to actual object (this) since _move is executed by the interval-method which changes the 'this'-context */
         this._move = function()
         {
            if (object_reference._snake !== null)
            {
               consumed = [];
               switch(object_reference._direction)
               {
                  case SNAKE_DIRECTIONS.UP   : consumed = object_reference._snake.moveUp()   ; break;
                  case SNAKE_DIRECTIONS.DOWN : consumed = object_reference._snake.moveDown() ; break;
                  case SNAKE_DIRECTIONS.LEFT : consumed = object_reference._snake.moveLeft() ; break;
                  case SNAKE_DIRECTIONS.RIGHT: consumed = object_reference._snake.moveRight(); break;
               }
               
               if (consumed.length > 0)
               {
                  object_reference._updateSnakeNodes();
                  if (consumed.indexOf(object_reference._food) >= 0)
                  {
                     object_reference._updateScore(object_reference._score + 1); /* increment score */
                     object_reference.refreshFood();                             /* remove and update food */
                  }
               }
            }
         };
         
         this._snake_died = function() {
            object_reference.stop();
         };
         
         this._tiles_at_pos = function(x, y, include_snake) /* this function shall return tiles and its deductions at a specific position */
         {
            tiles = [];
            
            if (object_reference._food !== null) /* check if requested position contains food */
            {
               if ((object_reference._food.getX() === x) && (object_reference._food.getY() === y)) {
                  tiles.push(object_reference._food);
               }
            }
            
            if (object_reference._tiles !== null) /* check if requested position contains tile */
            {
               for (i = 0; i < object_reference._tiles.length; ++i)
               {
                  if ((object_reference._tiles[i].getX() === x) && (object_reference._tiles[i].getY() === y)) {
                    tiles.push(object_reference._tiles[i]);
                  }
               }
            }
            
            if ((include_snake === true) && (this._snake !== null))
            {
               occupied_by = this._snake.occupies(x, y);
               
               if (occupied_by !== null) {
                  tiles.push(occupied_by);
               }
            }
            return tiles;
         };
         
         this._tile_at_pos = function(type, x, y, include_snake)
         {
            contains = false;
            tiles    = this._tiles_at_pos(x, y, include_snake);
            
            for (i = 0; (i < tiles.length) && (contains === false); ++i)
            {
               tile = tiles[i];
               if (tile !== null)
               {
                  if (tile.constructor === type) {
                     contains = true;
                  }
               }
            }
            return contains;
         };
         
         this.moveUp = function() {
            this._direction = SNAKE_DIRECTIONS.UP;
         };
         
         this.moveDown = function() {
            this._direction = SNAKE_DIRECTIONS.DOWN;
         };
         
         this.moveLeft = function() {
            this._direction = SNAKE_DIRECTIONS.LEFT;
         };
         
         this.moveRight = function() {
            this._direction = SNAKE_DIRECTIONS.RIGHT;
         };
         
         this.start = function()
         {
            if (this._move_ticker === null) /* ticker yet not started */
            {
               this._updateScore(0); /* reset score */
               this._move_ticker = setInterval(this._move, this._speed_ms);
            }
         };
         
         this.stop = function()
         {
            if (this._move_ticker !== null) /* ticker is running */
            {
               clearInterval(this._move_ticker);
               this._move_ticker = null;
            }
         };
         
         this.getHeight = function() {
            return this._height;
         };
         
         this.getWidth = function() {
            return this._width;
         };

         this.refreshTiles = function()
         {
            i = 0;
            for (y = 0; y < size_y; ++y)
            {
               for (x = 0; x < size_x; ++x)
               {
                  if ((x === 0) || (x === (size_x - 1)) || (y === 0) || (y === (size_y - 1))) {
                     this._tiles[i] = new snake_brick(this._tile_size, x, y);
                  }
                  else {
                     this._tiles[i] = new snake_tile(this._tile_size, x, y);
                  }
                  this._container.appendChild(this._tiles[i].getNode());
                  i++;
               }
            }
         };
         
         this.refreshSnake = function()
         {
            if (this._snake !== null)
            {
               nodes = this._snake.getNodes();
               for (i = 0; i < nodes.length; ++i) {
                  this._container.removeChild(nodes[i]);
               }
               this._snake = null;
            }
            this._snake = new snake_snake(this._tile_size, this._start_length, size_x / 2, size_y / 2, this._tiles_at_pos, this._snake_died); /* positions may be replaced by random directions */
            this._updateSnakeNodes();
         };
         
         this.refreshFood = function()
         {
            if (this._food !== null) {
               this._container.removeChild(this._food.getNode());
            }
            
            object_reference = this;
            setTimeout(function() /* start seperate 'thread', since generating new food position may take some time */
            {
               timeout  =  0;
               random_x = -1;
               random_y = -1;

               while ((object_reference._tile_at_pos(snake_tile, random_x, random_y, true) === false) && (timeout <= 500))
               {
                  random_x = Math.floor(Math.random() * size_x);
                  random_y = Math.floor(Math.random() * size_y);

                  timeout++;
               }

               object_reference._food = new snake_food(object_reference._tile_size, random_x, random_y); /* food test */
               object_reference._container.appendChild(object_reference._food.getNode());
            }, 0);
         };
         
         /* set container to fixed size */
         this._height                 = this._tile_size * size_y;
         this._width                  = this._tile_size * size_x;
         this._container.style.height = this._height + 'px';
         this._container.style.width  = this._width  + 'px';
         
         /* refresh everything */
         this.refreshTiles();
         this.refreshSnake();
         this.refreshFood();
      }
   }
}