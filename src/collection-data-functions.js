;(function($$){
	
	var borderWidthMultiplier = 2 * 0.5;
	var borderWidthAdjustment = 0;

	$$.fn.eles({

		data: $$.define.data({
			field: "data",
			bindingEvent: "data",
			allowBinding: true,
			allowSetting: true,
			settingEvent: "data",
			settingTriggersEvent: true,
			triggerFnName: "trigger",
			allowGetting: true,
			immutableKeys: {
				"id": true,
				"source": true,
				"target": true,
				"parent": true
			},
			updateMappers: true
		}),

		removeData: $$.define.removeData({
			field: "data",
			event: "data",
			triggerFnName: "trigger",
			triggerEvent: true,
			immutableKeys: {
				"id": true,
				"source": true,
				"target": true,
				"parent": true
			},
			updateMappers: true
		}),

		batchData: $$.define.batchData({
			field: "data",
			event: "data",
			triggerFnName: "trigger",
			immutableKeys: {
				"id": true,
				"source": true,
				"target": true,
				"parent": true
			},
			updateMappers: true
		}),

		scratch: $$.define.data({
			field: "scratch",
			allowBinding: false,
			allowSetting: true,
			settingTriggersEvent: false,
			allowGetting: true
		}),

		removeScratch: $$.define.removeData({
			field: "scratch",
			triggerEvent: false
		}),

		rscratch: $$.define.data({
			field: "rscratch",
			allowBinding: false,
			allowSetting: true,
			settingTriggersEvent: false,
			allowGetting: true
		}),

		removeRscratch: $$.define.removeData({
			field: "rscratch",
			triggerEvent: false
		}),

		id: function(){
			var ele = this[0];

			if( ele ){
				return ele._private.data.id;
			}
		},

		position: $$.define.data({
			field: "position",
			bindingEvent: "position",
			allowBinding: true,
			allowSetting: true,
			settingEvent: "position",
			settingTriggersEvent: true,
			triggerFnName: "rtrigger",
			allowGetting: true,
			validKeys: ["x", "y"]
		}),

		positions: function( pos ){
			if( $$.is.plainObject(pos) ){
				this.position(pos);
				
			} else if( $$.is.fn(pos) ){
				var fn = pos;
				
				for( var i = 0; i < this.length; i++ ){
					var ele = this[i];

					var pos = fn.apply(ele, [i, ele]);

					if( pos && !ele.locked() ){
						var elePos = ele._private.position;
						elePos.x = pos.x;
						elePos.y = pos.y;
					}
				}
				
				this.rtrigger("position");
			}

			return this; // chaining
		},

		// get/set the rendered (i.e. on screen) positon of the element
		renderedPosition: function( dim, val ){
			var ele = this[0];
			var cy = this.cy();
			var zoom = cy.zoom();
			var pan = cy.pan();
			var rpos = $$.is.plainObject( dim ) ? dim : undefined;
			var setting = rpos !== undefined || ( val !== undefined && $$.is.string(dim) );

			if( ele && ele.isNode() ){ // must have an element and must be a node to return position
				if( setting ){
					for( var i = 0; i < this.length; i++ ){
						var ele = this[i];

						if( val !== undefined ){ // set one dimension
							ele._private.position[dim] = ( val - pan[dim] )/zoom;
						} else if( rpos !== undefined ){ // set whole position
							ele._private.position = {
								x: ( rpos.x - pan.x ) /zoom,
								y: ( rpos.y - pan.y ) /zoom
							};
						}
					}

					this.rtrigger("position");
				} else { // getting
					var pos = ele._private.position;
					rpos = {
						x: pos.x * zoom + pan.x,
						y: pos.y * zoom + pan.y
					};

					if( dim === undefined ){ // then return the whole rendered position
						return rpos;
					} else { // then return the specified dimension
						return rpos[ dim ];
					}
				}
			} else if( !setting ){
				return undefined; // for empty collection case
			}

			return this; // chaining
		},

		// convenience function to get a numerical value for the width of the node/edge
		width: function(){
			var ele = this[0];

			if( ele ){
				var w = ele._private.style.width;
				return w.strValue === "auto" ? ele._private.autoWidth : w.pxValue;
			}
		},

		outerWidth: function(){
			var ele = this[0];

			if( ele ){
				var style = ele._private.style;
				var width = style.width.strValue === "auto" ? ele._private.autoWidth : style.width.pxValue;;
				var border = style["border-width"] ? style["border-width"].pxValue * borderWidthMultiplier + borderWidthAdjustment : 0;

				return width + border;
			}
		},

		renderedWidth: function(){
			var ele = this[0];

			if( ele ){
				var width = ele.width();
				return width * this.cy().zoom();
			}
		},

		renderedOuterWidth: function(){
			var ele = this[0];

			if( ele ){
				var owidth = ele.outerWidth();
				return owidth * this.cy().zoom();
			}
		},

		// convenience function to get a numerical value for the height of the node
		height: function(){ 
			var ele = this[0];

			if( ele && ele.isNode() ){
				var h = ele._private.style.height;
				return h.strValue === "auto" ? ele._private.autoHeight : h.pxValue;
			}
		},

		outerHeight: function(){
			var ele = this[0];

			if( ele ){
				var style = ele._private.style;
				var height = style.height.strValue === "auto" ? ele._private.autoHeight : style.height.pxValue;
				var border = style["border-width"] ? style["border-width"].pxValue * borderWidthMultiplier + borderWidthAdjustment : 0;

				return height + border;
			}
		},

		renderedHeight: function(){
			var ele = this[0];

			if( ele ){
				var height = ele.height();
				return height * this.cy().zoom();
			}
		},

		renderedOuterHeight: function(){
			var ele = this[0];

			if( ele ){
				var oheight = ele.outerHeight();
				return oheight * this.cy().zoom();
			}
		},

		// get the position of the element relative to the container (i.e. not relative to parent node)
		offset: function(){
			var ele = this[0];

			if( ele && ele.isNode() ){
				var offset = {
					x: ele._private.position.x,
					y: ele._private.position.y
				};

				var parents = ele.parents();
				for( var i = 0; i < parents.length; i++ ){
					var parent = parents[i];
					var parentPos = parent._private.position;

					offset.x += parentPos.x;
					offset.y += parentPos.y;
				}

				return offset;
			}
		},

		renderedOffset: function(){
			var ele = this[0];

			if( ele && ele.isNode() ){
				var offset = this.offset();
				var cy = this.cy();
				var zoom = cy.zoom();
				var pan = cy.pan();

				return {
					x: offset.x * zoom + pan.x,
					y: offset.y * zoom + pan.y
				};
			}
		},

		renderedBoundingBox: function( options ){
			var bb = this.boundingBox( options );
			var cy = this.cy();
			var zoom = cy.zoom();
			var pan = cy.pan();

			var x1 = bb.x1 * zoom + pan.x;
			var x2 = bb.x2 * zoom + pan.x;
			var y1 = bb.y1 * zoom + pan.y;
			var y2 = bb.y2 * zoom + pan.y;

			return {
				x1: x1,
				x2: x2,
				y1: y1,
				y2: y2,
				w: x2 - x1,
				h: y2 - y1
			};
		},

		// get the bounding box of the elements (in raw model position)
		boundingBox: function( options ){
			var eles = this;

			options = $$.util.extend({
				includeNodes: true,
				includeEdges: true,
				includeLabels: true
			}, options);

			// recalculate projections etc
			this.cy().recalculateRenderedStyle();

			var x1 = Infinity;
			var x2 = -Infinity;
			var y1 = Infinity;
			var y2 = -Infinity;

			// find bounds of elements
			for( var i = 0; i < eles.length; i++ ){
				var ele = eles[i];
				var ex1, ex2, ey1, ey2, x, y;
				var includedEle = false;

				if( ele.css("display") === "none" ){ continue; } // then ele doesn't take up space			

				if( ele.isNode() && options.includeNodes ){
					includedEle = true;

					var pos = ele._private.position;
					x = pos.x;
					y = pos.y;
					var w = ele.outerWidth();
					var halfW = w/2;
					var h = ele.outerHeight();
					var halfH = h/2;

					// handle node dimensions
					/////////////////////////

					ex1 = x - halfW;
					ex2 = x + halfW;
					ey1 = y - halfH;
					ey2 = y + halfH;

					x1 = ex1 < x1 ? ex1 : x1;
					x2 = ex2 > x2 ? ex2 : x2;
					y1 = ey1 < y1 ? ey1 : y1;
					y2 = ey2 > y2 ? ey2 : y2;

				} else if( ele.isEdge() && options.includeEdges ){ 
					includedEle = true;

					var n1pos = ele.source()[0]._private.position;
					var n2pos = ele.target()[0]._private.position;

					// handle edge dimensions (rough box estimate)
					//////////////////////////////////////////////

					var rstyle = ele._private.rstyle || {};

					ex1 = n1pos.x;
					ex2 = n2pos.x;
					ey1 = n1pos.y;
					ey2 = n2pos.y;

					if( ex1 > ex2 ){
						var temp = ex1;
						ex1 = ex2;
						ex2 = temp;
					}

					if( ey1 > ey2 ){
						var temp = ey1;
						ey1 = ey2;
						ey2 = temp;
					}

					x1 = ex1 < x1 ? ex1 : x1;
					x2 = ex2 > x2 ? ex2 : x2;
					y1 = ey1 < y1 ? ey1 : y1;
					y2 = ey2 > y2 ? ey2 : y2;

					// handle points along edge (sanity check)
					//////////////////////////////////////////

					var bpts = rstyle.bezierPts || [];
					var w = ele._private.style['width'].pxValue;
					for( var j = 0; j < bpts.length; j++ ){
						var bpt = bpts[j];

						x1 = bpt.x - w < x1 ? bpt.x - w : x1;
						x2 = bpt.x + w > x2 ? bpt.x + w : x2;
						y1 = bpt.y - w < y1 ? bpt.y - w : y1;
						y2 = bpt.y + w > y2 ? bpt.y + w : y2;
					}

				}

				// handle label dimensions
				//////////////////////////

				var style = ele._private.style;
				var rstyle = ele._private.rstyle;
				var label = style['content'].strValue;
				var fontSize = style['font-size'];
				var halign = style['text-halign'];
				var valign = style['text-valign'];
				var labelWidth = rstyle.labelWidth;
				var labelHeight = rstyle.labelHeight || fontSize.pxValue;
				var labelX = rstyle.labelX;
				var labelY = rstyle.labelY;

				if( includedEle && options.includeLabels && label && fontSize && labelHeight != undefined && labelWidth != undefined && labelX != undefined && labelY != undefined && halign && valign ){
					var lh = labelHeight;
					var lw = labelWidth;
					var lx1, lx2, ly1, ly2;

					if( ele.isEdge() ){
						lx1 = labelX - lw/2;
						lx2 = labelX + lw/2;
						ly1 = labelY - lh/2;
						ly2 = labelY + lh/2;
					} else {
						switch( halign.value ){
							case "left":
								lx1 = labelX - lw;
								lx2 = labelX;
								break;

							case "center":
								lx1 = labelX - lw/2;
								lx2 = labelX + lw/2;
								break;

							case "right":
								lx1 = labelX;
								lx2 = labelX + lw;
								break;
						}

						switch( valign.value ){
							case "top":
								ly1 = labelY - lh;
								ly2 = labelY;
								break;

							case "center":
								ly1 = labelY - lh/2;
								ly2 = labelY + lh/2;
								break;

							case "bottom":
								ly1 = labelY;
								ly2 = labelY + lh;
								break;
						}
					}

					x1 = lx1 < x1 ? lx1 : x1;
					x2 = lx2 > x2 ? lx2 : x2;
					y1 = ly1 < y1 ? ly1 : y1;
					y2 = ly2 > y2 ? ly2 : y2;
				}
			} // for

			return {
				x1: x1,
				x2: x2,
				y1: y1,
				y2: y2,
				w: x2 - x1,
				h: y2 - y1
			};
		}
	});

	
})( cytoscape );
