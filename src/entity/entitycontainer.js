/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier Biot, Jason Oster
 * http://www.melonjs.org
 *
 */

(function(window) {

	/**
	 * EntityContainer represents a collection of entity objects.<br>	 *
	 * @class
	 * @extends me.Renderable
	 * @memberOf me
	 * @constructor
	 * @param {Number} [x=0] position of the container
	 * @param {Number} [y=0] position of the container
	 * @param {Number} [w=me.game.viewport.width] width of the container
	 * @param {number} [h=me.game.viewport.height] height of the container
	 */

	me.EntityContainer = me.Renderable.extend(
		/** @scope me.EntityContainer.prototype */ {

		/**
		 * The property of entity that should be used to sort on <br>
		 * value : "x", "y", "z" (default: me.game.sortOn)
		 * @public
		 * @type String
		 * @name sortOn
		 * @memberOf me.EntityContainer
		 */
		sortOn : "z",
		
		/** 
		 * Specify if the entity list should be automatically sorted when adding a new child
		 * @public
		 * @type String
		 * @name autoSort
		 * @memberOf me.EntityContainer
		 */
		autoSort : true,
		
		/** 
		 * keep track of pending sort
		 * @private
		 */
		pendingSort : null,

		/**
		 * [read-only] The array of children of this container.
		 * @property children {Array}
		 */	
		children : null,
		

		// constructor
		init : function(x, y, width, height) {
			// call the parent constructor
			this.parent(
				new me.Vector2d(x || 0, y || 0),
				width || me.game.viewport.width,  // which default value here ?
				height || me.game.viewport.height 
			);
			this.children = [];
			// by default reuse the global me.game.setting
			this.sortOn = me.game.sortOn;
			this.autoSort = true;

		},


		/**
		 * Add a child to the container <br>
		 * if auto-sort is disable, the object will be appended at the bottom of the list
		 * @name addChild
		 * @memberOf me.EntityContainer
		 * @function
		 * @param {me.ObjectEntity} child
		 */
		addChild : function(child) {
			if(typeof(child.ancestor) !== 'undefined') {
				child.ancestor.removeChild(child);
			}

			child.ancestor = this;
			
			this.children[this.children.length] = child;
			
			this.sort(this.autoSort===false);
		},
		
		/**
		 * Add a child to the container at the specified index<br>
		 * (the list won't be sorted after insertion)
		 * @name addChildAt
		 * @memberOf me.EntityContainer
		 * @function
		 * @param {me.ObjectEntity} child
		 */
		addChildAt : function(child, index) {
			if((index >= 0) && (index < this.children.length)) {
				
				if(typeof(child.ancestor) !== 'undefined') {
					child.ancestor.removeChild(child);
				}
				
				child.ancestor = this;
				
				this.children.splice(index, 0, child);
			
			} else {
				throw "melonJS (me.EntityContainer): Index (" + index + ") Out Of Bounds for addChildAt()";
			}
		},

		/**
		 * Swaps the depth of 2 childs
		 * @name swapChildren
		 * @memberOf me.EntityContainer
		 * @function
		 * @param {me.ObjectEntity} child
		 * @param {me.ObjectEntity} child
		 */
		swapChildren : function(child, child2) {
			var index = this.getChildIndex( child );
			var index2 = this.getChildIndex( child2 );
			
			if ((index !== -1) && (index2 !== -1)) {
				
				// swap z index
				var _z = child.z;
				child.z = child2.z;
				child2.z = _z;
				// swap the positions..
				this.children[index] = child2;
				this.children[index2] = child;
				
			} else {
				throw "melonJS (me.EntityContainer): " + child + " Both the supplied entities must be a child of the caller " + this;
			}
		},

		/**
		 * Returns the Child at the specified index
		 * @name getChildAt
		 * @memberOf me.EntityContainer
		 * @function
		 * @param {Number} index
		 */
		getChildAt : function(index) {
			if((index >= 0) && (index < this.children.length)) {
				return this.children[index];
			} else {
				throw "melonJS (me.EntityContainer): Index (" + index + ") Out Of Bounds for getChildAt()";
			}
		},
		
		/**
		 * Returns the index of the Child
		 * @name getChildAt
		 * @memberOf me.EntityContainer
		 * @function
		 * @param {me.ObjectEntity} child
		 */
		getChildIndex : function(child) {
			return this.children.indexOf( child );
		},

		/**
		 * Returns true if contains the specified Child
		 * @name hasChild
		 * @memberOf me.EntityContainer
		 * @function
		 * @return {Boolean}
		 */
		hasChild : function(child) {
			return (this.children.indexOf( child ) !== -1);
		},

		/**
		 * Returns the Parent of the specified Child
		 * @name getParent
		 * @memberOf me.EntityContainer
		 * @function
		 * @return {me.ObjectEntity}
		 */
		getParent : function(child) {
			return child.ancestor;
		},
		
		/**
		 * return the entity corresponding to the property and value<br>
		 * note : avoid calling this function every frame since
		 * it parses the whole object tree each time
		 * @name getEntityByProp
		 * @memberOf me.EntityContainer
		 * @public
		 * @function
		 * @param {String} prop Property name
		 * @param {String} value Value of the property
		 * @return {me.ObjectEntity[]} Array of object entities
		 */
		getEntityByProp : function(prop, value)	{
			var objList = [];	
			// for string comparaisons
			var _regExp = new RegExp(value, "i");
			for (var i = this.children.length, obj; i--, obj = this.children[i];) {
				if (obj instanceof me.EntityContainer) {
					objList = objList.concat(obj.getEntityByProp(prop, value));
				} else if (obj.isEntity) {
					if (typeof (obj[prop]) === 'string') {
						if (obj[prop].match(_regExp)) {
							objList.push(obj);
						}
					} else if (obj[prop] == value) {
						objList.push(obj);
					}
				}
			}
			return objList;
		},
		
		/**
		 * Removes a child from the container.
		 * @name removeChild
		 * @memberOf me.EntityContainer
		 * @function
		 * @param  {me.ObjectEntity} child
		 */
		removeChild : function(child) {
			var index = this.children.indexOf( child );
			
			
			if  ( index !== -1 ) {
				
				child.ancestor = undefined;
				
				if (typeof (child.destroy) == 'function') {
					child.destroy();
				}
				
				this.children.splice( index, 1 );
				
				me.entityPool.freeInstance(child);
			
			} else {
				throw "melonJS (me.EntityContainer): " + child + " The supplied entity must be a child of the caller " + this;
			}
		},
		
		/**
		 * Move the child in the group one step forward (z depth).
		 * @name moveUp
		 * @memberOf me.EntityContainer
		 * @function
		 * @param  {me.ObjectEntity} child
		 */
		moveUp : function(child) {
			var childIndex = getChildIndex(child);
			if (childIndex -1 >= 0) {
				// note : we use an inverted loop
				this.swapChildren(child, this.getChildAt(childIndex-1));
			}
		},

		/**
		 * Move the child in the group one step backward (z depth).
		 * @name moveDown
		 * @memberOf me.EntityContainer
		 * @function
		 * @param  {me.ObjectEntity} child
		 */
		moveDown : function(child) {
			var childIndex = getChildIndex(child);
			if (childIndex+1 < this.children.length) {
				// note : we use an inverted loop
				this.swapChildren(child, this.getChildAt(childIndex+1));
			}
		},

		/**
		 * Move the specified child to the top(z depth).
		 * @name moveToTop
		 * @memberOf me.EntityContainer
		 * @function
		 * @param  {me.ObjectEntity} child
		 */
		moveToTop : function(child) {
			var childIndex = getChildIndex(child);
			if (childIndex > 0) {
				// note : we use an inverted loop
				this.splice(0, 0, this.splice(childIndex, 1)[0]);
				// increment our child z value based on the previous child depth
				child.z = this.children[1].z + 1;
			}
		},

		/**
		 * Move the specified child the bottom (z depth).
		 * @name moveToBottom
		 * @memberOf me.EntityContainer
		 * @function
		 * @param  {me.ObjectEntity} child
		 */
		moveToBottom : function(child) {
			var childIndex = getChildIndex(child);
			if (childIndex < (this.children.length -1)) {
				// note : we use an inverted loop
				this.splice((this.children.length -1), 0, this.splice(childIndex, 1)[0]);
				// increment our child z value based on the next child depth
				child.z = this.children[(this.children.length -2)].z - 1;
			}
		},
		
		/**
		 * Sort the object list in the current container
		 * @name add
		 * @memberOf me.game
		 * @param {me.ObjectEntity} obj Object to be added
		 * @param {int} [z="obj.z"] z index
		 * @public
		 * @function
		 * @example
		 * // create a new object
		 * var obj = new MyObject(x, y)
		 * // add the object and give the z index of the current object
		 * me.game.add(obj, this.z);
		 * // sort the object list (to ensure the object is properly displayed)
		 * me.game.sort();
		 */
		sort : function(force) {
			if (force===false && this.autoSort===true) {
				// don't do anything if not an "internal" call
				// and if auto-sort is enabled
				return;
			}
			// do nothing if there is already 
			// a previous pending sort
			if (this.pendingSort === null) {
				/** @ignore */
				this.pendingSort = (function (self) {
					// sort everything
					self.children.sort(self["_sort"+self.sortOn.toUpperCase()]);
					// clear the defer id
					self.pendingSort = null;
					// make sure we redraw everything
					me.game.repaint();
				}).defer(this);
			};
		},
		
		/**
		 * Z Sorting function
		 * @private
		 */
		_sortZ : function (a,b) {
			return (b.z) - (a.z);
		},
		/**
		 * X Sorting function
		 * @private
		 */
		_sortX : function(a,b) { 
			/* ? */
			var result = (b.z - a.z);
			return (result ? result : ((b.pos && b.pos.x) - (a.pos && a.pos.x)) || 0);
		},
		/**
		 * Y Sorting function
		 * @private
		 */
		_sortY : function(a,b) {
			var result = (b.z - a.z);
			return (result ? result : ((b.pos && b.pos.y) - (a.pos && a.pos.y)) || 0);
		},
		
		
		/**
		 * Destroy function<br>
		 * @ignore
		 */
		destroy : function() {
			// cancel any sort operation
			if (this.pendingSort) {
				clearTimeout(this.pendingSort);
				this.pendingSort = null;
			}
			// delete all childs
			for ( var i = this.children.length, obj; i--, obj = this.children[i];) {
				// don't remove it if a persistent object
				if ( !obj.isPersistent ) {
					this.removeChild(obj);
				}	
			}
		},
		

		/**
		 * @private
		 */
		update : function() {
			var isDirty = false;

			if (me.state.isPaused()) {
				// game is paused so include an extra check
				for ( var i = this.children.length, obj; i--, obj = this.children[i];) {
					if (obj.updateWhenPaused)
						continue;
			
					// check if object is visible
					obj.inViewport = obj.visible && (
						obj.floating || (obj.getRect && me.game.viewport.isVisible(obj))
					);

					// update our object
					isDirty |= (obj.inViewport || obj.alwaysUpdate) && obj.update();
				}
			} else {
				// normal loop, game isn't paused
				for ( var i = this.children.length, obj; i--, obj =this.children[i];) {

					// check if object is visible
					obj.inViewport = obj.visible && (
						obj.floating || (obj.getRect && me.game.viewport.isVisible(obj))
					);

					// update our object
					isDirty |= (obj.inViewport || obj.alwaysUpdate) && obj.update();
				}
			}

			return isDirty;

		},

		/**
		 * @private
		 */
		draw : function(context, rect) {
			this.drawCount = 0;			
			
			// translate to the container position
			context.translate(this.pos.x, this.pos.y);
			
			for ( var i = this.children.length, obj; i--, obj = this.children[i];) {
				
				if (obj.inViewport && obj.isRenderable) {

					if (obj.floating==true) {
						context.save();
						// translate back object
						context.translate(me.game.viewport.screenX -this.pos.x, me.game.viewport.screenY -this.pos.y);
					}

					// draw the object
					obj.draw(context, rect);

					if (obj.floating==true) {
						context.restore();
					}

					this.drawCount++;
				}
			}
			
			// translate back to origin
			context.translate(-this.pos.x, -this.pos.y);
		}

	});
	/*---------------------------------------------------------*/
	// END END END
	/*---------------------------------------------------------*/
})(window);
