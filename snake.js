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
         
         for (grow_i = 0; grow_i < this._grow_by; ++grow_i) {
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
         
         for (refresh_i = 1; refresh_i < this._parts.length; ++refresh_i)
         {
            last_x = this._parts[refresh_i - 1].getLastX();
            last_y = this._parts[refresh_i - 1].getLastY();
            
            this._parts[refresh_i].moveTo(last_x, last_y);
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

                  for (refresh_pos_i = 0; refresh_pos_i < tiles.length; ++refresh_pos_i)
                  {
                     tile = tiles[refresh_pos_i];
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
         for (occupies_i = ((except_head === true) ? 1 : 0); occupies_i < this._parts.length; ++occupies_i)
         {
            if ((this._parts[occupies_i].getX() === x) && (this._parts[occupies_i].getY() === y))
            {
               occupied_by = this._parts[occupies_i];
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
      
      this.getFirstPart = function()
      {
         first_part = null;
         if (this._parts.length > 0) {
            first_part = this._parts[0];
         }
         return first_part;
      };
      
      this.getLastPart = function()
      {
         first_part = null;
         length     = this._parts.length;
         
         if (length > 0) {
            first_part = this._parts[length - 1];
         }
         return first_part;
      };
      
      this.getNodes = function()
      {
         nodes = [];
         
         for (get_nodes_i = 0; get_nodes_i < this._parts.length; ++get_nodes_i) {
            nodes[get_nodes_i] = this._parts[get_nodes_i].getNode();
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
      
      /* init parts */
      grow_direction      = SNAKE_DIRECTIONS.LEFT;
      last_target_x       = start_x;
      last_target_y       = start_y;
      get_target_position = function(direction)
      {
         position = { x : last_target_x, y : last_target_y };
         
         switch (direction)
         {
            case SNAKE_DIRECTIONS.LEFT:
            {
               position.x = last_target_x - 1;
               position.y = last_target_y;
               break;
            }
            case SNAKE_DIRECTIONS.RIGHT:
            {
               position.x = last_target_x + 1;
               position.y = last_target_y;
               break;
            }
            case SNAKE_DIRECTIONS.UP:
            {
               position.x = last_target_x;
               position.y = last_target_y - 1;
               break;
            }
            case SNAKE_DIRECTIONS.DOWN:
            {
               position.x = last_target_x;
               position.y = last_target_y + 1;
               break;
            }
         }
         return position;
      };
      
      for (j = 0; j < start_length; ++j)
      {
         found_position = false;
         attempt_index  = 0;
         directions     = [SNAKE_DIRECTIONS.LEFT, SNAKE_DIRECTIONS.UP, SNAKE_DIRECTIONS.DOWN, SNAKE_DIRECTIONS.RIGHT];
         
         while ((attempt_index < directions.length) && (found_position !== true))
         {
            position          = get_target_position(directions[attempt_index]);
            tiles_at_position = this._tiles_cb(position.x, position.y, true);
            
            if (this._occupies(position.x, position.y, false) === null)
            {
               if ((tiles_at_position.length === 0) || ((tiles_at_position.length === 1) && (tiles_at_position[0].constructor === snake_tile))) {
                  found_position = true; /* found free spot */
               }
            }
            
            if (found_position !== true) {
               attempt_index++; /* try next direction */
            }
         }
         
         if (found_position === true)
         {
            this._parts[j] = new snake_bodyPart(this._part_size, position.x, position.y);
            
            last_target_x = position.x;
            last_target_y = position.y;
         }
         else {
            break; /* cancel if no free position found */
         }
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
         SNAKE_KEYS =
         {
            SNAKE     : 'snake',
            DIRECTION : 'direction',
            SCORE     : 'score'
         };
         
         this._start_length = start_length;
         this._tile_size    = 0;
         this._tiles        = [];
         this._snakes       = {};
         this._speed_ms     = speed_ms;
         this._score_cb     = score_cb;
         this._move_ticker  = null;
         this._food         = null;
         this._score        = 0;

         this._container.style.position = 'relative';
         this._container.style.margin   = 'auto';

         tile_size_x      = this._container.offsetWidth  / size_x;
         tile_size_y      = this._container.offsetHeight / size_y;
         object_reference = this; /* refer to actual object (this) since _move is executed by the interval-method which changes the 'this'-context */

         if (tile_size_y < tile_size_x) {
            this._tile_size = tile_size_y;
         }
         else {
            this._tile_size = tile_size_x;
         }
         
         this._updateSnakeNodes = function(name)
         {
            snake = this._snakeGetObject(name);
            if (snake !== null)
            {
               nodes    = snake.getNodes();                                       /* retrieve actual snake DOM-nodes */
               children = Array.prototype.slice.call(this._container.childNodes); /* convert nodelist to array to use indexOf (this is not done
                                                                                     each time in the for-loop since it would decrease performance
                                                                                     extensively after the snake is getting bigger) */
               
               for (snake_nodes_i = 0; snake_nodes_i < nodes.length; ++snake_nodes_i)
               {
                  if (children.indexOf(nodes[snake_nodes_i]) < 0) { /* add only new nodes */
                     this._container.appendChild(nodes[snake_nodes_i]);
                  }
               }
            }
         };
         
         this._updateScore = function(name, score)
         {
            if (object_reference.snakeExists(name) === true)
            {
               object_reference._snakeSetScore(name, score);
               
               if (typeof object_reference._score_cb === 'function') {
                  object_reference._score_cb(name, object_reference._snakeGetScore(name));
               }
            }
         };
         
         this._snakeNames = function() {
            return Object.keys(object_reference._snakes);
         };
         
         this._move = function()
         {
            names = object_reference._snakeNames();
            for (move_i = 0; move_i < names.length; ++move_i)
            {
               snake = object_reference._snakeGetObject(names[move_i]);
               if (snake !== null)
               {
                  consumed = [];
                  switch(object_reference._snakeGetDirection(names[move_i]))
                  {
                     case SNAKE_DIRECTIONS.UP   : consumed = snake.moveUp   (); break;
                     case SNAKE_DIRECTIONS.DOWN : consumed = snake.moveDown (); break;
                     case SNAKE_DIRECTIONS.LEFT : consumed = snake.moveLeft (); break;
                     case SNAKE_DIRECTIONS.RIGHT: consumed = snake.moveRight(); break;
                  }
                  
                  if (consumed.length > 0)
                  {
                     object_reference._updateSnakeNodes(name);
                     if (consumed.indexOf(object_reference._food) >= 0)
                     {
                        object_reference._updateScore(name, object_reference._snakeGetScore(names[move_i]) + 1); /* increment score */
                        object_reference.refreshFood();                                                          /* remove and update food */
                     }
                  }
               }
            }
         };
         
         this._snakeDied = function() {
            object_reference.stop();
         };
         
         this._tilesAtPos = function(x, y, include_snake) /* this function shall return tiles and its deductions at a specific position */
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
               for (tiles_at_pos_i = 0; tiles_at_pos_i < object_reference._tiles.length; ++tiles_at_pos_i)
               {
                  if ((object_reference._tiles[tiles_at_pos_i].getX() === x) && (object_reference._tiles[tiles_at_pos_i].getY() === y)) {
                    tiles.push(object_reference._tiles[tiles_at_pos_i]);
                  }
               }
            }
            
            if (include_snake === true)
            {
               names = object_reference._snakeNames();
               for (tiles_at_pos_i = 0; tiles_at_pos_i < names.length; ++tiles_at_pos_i)
               {
                  snake = object_reference._snakeGetObject(name);
                  if (snake !== null)
                  {
                     occupied_by = snake.occupies(x, y);
                     
                     if (occupied_by !== null) {
                        tiles.push(occupied_by);
                     }
                  }
               }
            }
            return tiles;
         };
         
         this._tileAtPos = function(type, x, y, include_snake)
         {
            contains = false;
            tiles    = this._tilesAtPos(x, y, include_snake);
            
            for (tile_at_pos_i = 0; (tile_at_pos_i < tiles.length) && (contains === false); ++tile_at_pos_i)
            {
               tile = tiles[tile_at_pos_i];
               if (tile !== null)
               {
                  if (tile.constructor === type) {
                     contains = true;
                  }
               }
            }
            return contains;
         };
         
         this._freePlace = function(x, y, exceptions)
         {
            exception = false;
            if (exceptions instanceof Array)
            {
               for (free_place_i = 0; free_place_i < exceptions.length; ++free_place_i)
               {
                  if ((exceptions.x !== undefined) && (exceptions.x === x))
                  {
                     if ((exceptions.y !== undefined) && (exceptions.y === y))
                     {
                        exception = true;
                        break;
                     }
                  }
               }
               return exception;
            }
            return ((object_reference._tileAtPos(snake_tile, x, y, true) === true) && (exception === false));
         };
         
         this._randomFreePlace = function(exceptions)
         {
            timeout    =  0;
            random_x   = -1;
            random_y   = -1;
            free_place = null;

            while ((this._freePlace(random_x, random_y, exceptions) === false) && (timeout <= 500))
            {
               random_x = Math.floor(Math.random() * size_x);
               random_y = Math.floor(Math.random() * size_y);

               timeout++;
            }
            
            if (this._freePlace(random_x, random_y)) {
               free_place = { x : random_x, y : random_y };
            }
            return free_place;
         };
         
         this._snakeGetScore = function(name)
         {
            score = null;
            
            if (object_reference.snakeExists(name) === true) {
               score = object_reference._snakes[name][SNAKE_KEYS.SCORE];
            }
            return score;
         };
         
         this._snakeSetScore = function(name, score)
         {
            if (object_reference.snakeExists(name) === true) {
               object_reference._snakes[name][SNAKE_KEYS.SCORE] = score;
            }
         };
         
         this._snakeGetObject = function(name)
         {
            object = null;
            
            if (object_reference.snakeExists(name) === true) {
               object = object_reference._snakes[name][SNAKE_KEYS.SNAKE];
            }
            return object;
         };
         
         this._snakeSetObject = function(name, object)
         {
            if (object_reference.snakeExists(name) === true) {
               object_reference._snakes[name][SNAKE_KEYS.SNAKE] = object;
            }
         };
         
         this._snakeGetDirection = function(name)
         {
            direction = null;
            
            if (object_reference.snakeExists(name) === true) {
               direction = object_reference._snakes[name][SNAKE_KEYS.DIRECTION];
            }
            return direction;
         };
         
         this._snakeSetDirection = function(name, direction)
         {
            if (object_reference.snakeExists(name) === true) {
               object_reference._snakes[name][SNAKE_KEYS.DIRECTION] = direction;
            }
         };
         
         this.snakeExists = function(name)
         {
            exists = false;
            if (object_reference._snakes[name] !== undefined)
            {
               if ((object_reference._snakes[name][SNAKE_KEYS.SNAKE    ] !== undefined) &&
                   (object_reference._snakes[name][SNAKE_KEYS.DIRECTION] !== undefined) &&
                   (object_reference._snakes[name][SNAKE_KEYS.SCORE    ] !== undefined))
               {
                  exists = true;
               }
            }
            return exists;
         };
         
         this.addSnake = function(name)
         {
            if (this.snakeExists(name) !== true)
            {
               free_place = this._randomFreePlace();
               
               if (free_place !== null)
               {
                  this._snakes[name] = {};
                  this._snakes[name][SNAKE_KEYS.SNAKE    ] = new snake_snake(this._tile_size, this._start_length, free_place.x, free_place.y, this._tilesAtPos, this._snakeDied); /* positions may be replaced by random directions */
                  this._snakes[name][SNAKE_KEYS.DIRECTION] = SNAKE_DIRECTIONS.NONE;
                  this._snakes[name][SNAKE_KEYS.SCORE    ] = 0;
                  
                  this._updateSnakeNodes(name);
                  this._updateScore(name, 0); /* reset score */
               }
            }
         };
         
         this.moveUp = function(name) {
            this._snakeSetDirection(name, SNAKE_DIRECTIONS.UP);
         };
         
         this.moveDown = function(name) {
            this._snakeSetDirection(name, SNAKE_DIRECTIONS.DOWN);
         };
         
         this.moveLeft = function(name) {
            this._snakeSetDirection(name, SNAKE_DIRECTIONS.LEFT);
         };
         
         this.moveRight = function(name) {
            this._snakeSetDirection(name, SNAKE_DIRECTIONS.RIGHT);
         };
         
         this.start = function()
         {
            if (this._move_ticker === null) /* ticker yet not started */
            {
               names = this._snakeNames();
               
               for (start_i = 0; start_i < names.length; ++start_i) {
                  this._updateScore(names[start_i], 0); /* reset score */
               }
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
            refresh_tiles_i = 0;
            for (refresh_tiles_y = 0; refresh_tiles_y < size_y; ++refresh_tiles_y)
            {
               for (refresh_tiles_x = 0; refresh_tiles_x < size_x; ++refresh_tiles_x)
               {
                  if ((refresh_tiles_x === 0) || (refresh_tiles_x === (size_x - 1)) || (refresh_tiles_y === 0) || (refresh_tiles_y === (size_y - 1))) {
                     this._tiles[refresh_tiles_i] = new snake_brick(this._tile_size, refresh_tiles_x, refresh_tiles_y);
                  }
                  else {
                     this._tiles[refresh_tiles_i] = new snake_tile(this._tile_size, refresh_tiles_x, refresh_tiles_y);
                  }
                  this._container.appendChild(this._tiles[refresh_tiles_i].getNode());
                  refresh_tiles_i++;
               }
            }
         };
         
         this.refreshFood = function()
         {
            if (this._food !== null) {
               this._container.removeChild(this._food.getNode());
            }
            
            setTimeout(function() /* start seperate 'thread', since generating new food position may take some time */
            {
               free_place = object_reference._randomFreePlace();

               if (free_place !== null)
               {
                  object_reference._food = new snake_food(object_reference._tile_size, free_place.x, free_place.y); /* food test */
                  object_reference._container.appendChild(object_reference._food.getNode());
               }
            }, 0);
         };
         
         /* set container to fixed size */
         this._height                 = this._tile_size * size_y;
         this._width                  = this._tile_size * size_x;
         this._container.style.height = this._height + 'px';
         this._container.style.width  = this._width  + 'px';
         
         /* refresh everything */
         this.refreshTiles();
         this.refreshFood();
      }
   }
}