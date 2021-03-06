(function(Konva) {
  'use strict';
  Konva.Resizer = function(config) {
    this.____init(config);
  };

  Konva.Resizer.prototype = {
    _centroid: false,
    ____init: function(config) {
      // call super constructor
      Konva.Group.call(this, config);
      this.className = 'Resizer';
      this._createElements();
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this._update = this._update.bind(this);
    },

    attachTo: function(node) {
      this._el = node;
      this._update();
      this._el.on('dragmove.resizer', this._update);
      //     this._set();
    },

    _createElements: function() {
      this._createAnchor('top-left');
      this._createAnchor('top-center');
      this._createAnchor('top-right');

      this._createAnchor('middle-right');
      this._createAnchor('middle-left');

      this._createAnchor('bottom-left');
      this._createAnchor('bottom-center');
      this._createAnchor('bottom-right');

      this._createAnchor('rotater');
    },

    _createAnchor: function(name) {
      var anchor = new Konva.Rect({
        stroke: 'rgb(0, 161, 255)',
        fill: 'white',
        strokeWidth: 1,
        name: name,
        width: 10,
        height: 10,
        offsetX: 5,
        offsetY: 5
      });
      var self = this;
      anchor.on('mousedown touchstart', function(e) {
        self.handleResizerMouseDown(e);
      });

      // add hover styling
      anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
      });
      anchor.on('mouseout', function() {
        var layer = this.getLayer();
        if (!layer) {
          return;
        }
        document.body.style.cursor = 'default';
        this.setStrokeWidth(1);
        layer.draw();
      });
      this.add(anchor);
    },

    handleResizerMouseDown: function(e) {
      this.movingResizer = e.target.name();

      var width = this._el.width() * this._el.scaleX();
      var height = this._el.height() * this._el.scaleY();
      var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.sin = height / hypotenuse;
      this.cos = width / hypotenuse;

      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('touchmove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('touchend', this.handleMouseUp);
    },

    handleMouseMove: function(e) {
      var x, y, newHypotenuse;
      var resizerNode = this.findOne('.' + this.movingResizer);
      var stage = resizerNode.getStage();

      var box = stage.getContent().getBoundingClientRect();
      var zeroPoint = {
        x: box.left,
        y: box.top
      };
      var pointerPos = {
        left: e.clientX !== undefined ? e.clientX : e.touches[0].clientX,
        top: e.clientX !== undefined ? e.clientY : e.touches[0].clientY
      };
      var newAbsPos = {
        x: pointerPos.left - zeroPoint.x,
        y: pointerPos.top - zeroPoint.y
      };

      resizerNode.setAbsolutePosition(newAbsPos);

      if (this.movingResizer === 'top-left') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-right').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.top-left').x(this.findOne('.bottom-right').x() - x);
        this.findOne('.top-left').y(this.findOne('.bottom-right').y() - y);
      } else if (this.movingResizer === 'top-center') {
        this.findOne('.top-left').y(resizerNode.y());
      } else if (this.movingResizer === 'top-right') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-left').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-left').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.top-right').x(x);
        this.findOne('.top-right').y(this.findOne('.bottom-left').y() - y);
        var pos = resizerNode.position();

        this.findOne('.top-left').y(pos.y);
        this.findOne('.bottom-right').x(pos.x);
      } else if (this.movingResizer === 'middle-left') {
        this.findOne('.top-left').x(resizerNode.x());
      } else if (this.movingResizer === 'middle-right') {
        this.findOne('.bottom-right').x(resizerNode.x());
      } else if (this.movingResizer === 'bottom-left') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.top-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.top-right').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.bottom-left').x(this.findOne('.top-right').x() - x);
        this.findOne('.bottom-left').y(y);

        pos = resizerNode.position();

        this.findOne('.top-left').x(pos.x);
        this.findOne('.bottom-right').y(pos.y);
      } else if (this.movingResizer === 'bottom-center') {
        this.findOne('.bottom-right').y(resizerNode.y());
      } else if (this.movingResizer === 'bottom-right') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x(), 2) +
            Math.pow(this.findOne('.bottom-right').y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.bottom-right').x(x);
        this.findOne('.bottom-right').y(y);
      } else if (this.movingResizer === 'rotater') {
        x = resizerNode.x() - this._el.width() * this._el.scaleX() / 2;
        y = -resizerNode.y() + this._el.height() * this._el.scaleY() / 2;

        var dAlpha = Math.atan2(-y, x) + Math.PI / 2;
        var attrs = this._getAttrs();

        var rot = Konva.getAngle(this.rotation());

        var newRotation =
          Konva.Util._radToDeg(rot) + Konva.Util._radToDeg(dAlpha);

        var alpha = Konva.getAngle(this._el.rotation());
        var newAlpha = Konva.Util._degToRad(newRotation);

        this._setElementAttrs(
          Object.assign(attrs, {
            rotation: Konva.angleDeg
              ? newRotation
              : Konva.Util._degToRad(newRotation),
            x:
              attrs.x +
              attrs.width / 2 * (Math.cos(alpha) - Math.cos(newAlpha)) +
              attrs.height / 2 * (Math.sin(-alpha) - Math.sin(-newAlpha)),
            y:
              attrs.y +
              attrs.height / 2 * (Math.cos(alpha) - Math.cos(newAlpha)) +
              attrs.width / 2 * (Math.sin(alpha) - Math.sin(newAlpha))
          })
        );
      } else {
        console.error(
          new Error(
            'Wrong position argument of selection resizer: ',
            this.movingResizer
          )
        );
      }

      if (this.movingResizer === 'rotater') {
        return;
      }

      var absPos = this.findOne('.top-left').getAbsolutePosition();

      x = absPos.x;
      y = absPos.y;
      var width =
        this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

      var height =
        this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

      this._setElementAttrs({
        absX: this._el._centroid ? x + width / 2 : x,
        absY: this._el._centroid ? y + height / 2 : y,
        width: width,
        height: height
      });
    },

    handleMouseUp: function() {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);
    },

    _getAttrs: function() {
      if (this._el._centroid) {
        var topLeftResizer = this.findOne('.top-left');
        var absPos = topLeftResizer.getAbsolutePosition();

        return {
          x: absPos.x,
          y: absPos.y,
          width: this._el.width() * this._el.scaleX(),
          height: this._el.height() * this._el.scaleY()
        };
      }
      return {
        x: this._el.x(),
        y: this._el.y(),
        width: this._el.width() * this._el.scaleX(),
        height: this._el.height() * this._el.scaleY()
      };
    },

    _setElementAttrs: function(attrs) {
      if (attrs.rotation) {
        this._el.setAttrs({
          rotation: attrs.rotation,
          x: attrs.x,
          y: attrs.y
        });
      } else {
        var scaleX = attrs.width / this._el.width();
        var scaleY = attrs.height / this._el.height();

        this._el.setAttrs({
          scaleX: scaleX,
          scaleY: scaleY
        });

        this._el.setAbsolutePosition({
          x: attrs.absX,
          y: attrs.absY
        });
      }
      this._update();
      this.getLayer().batchDraw();
    },
    _update: function() {
      var x = this._el.x();
      var y = this._el.y();
      var width = this._el.width() * this._el.scaleX();
      var height = this._el.height() * this._el.scaleY();
      this.x(x);
      this.y(y);
      this.rotation(this._el.rotation());

      if (this._el._centroid) {
        this.offset({
          x: width / 2,
          y: height / 2
        });
      }

      this.findOne('.top-left').position({
        x: 0,
        y: 0
      });
      this.findOne('.top-center').position({
        x: width / 2,
        y: 0
      });
      this.findOne('.top-right').position({
        x: width,
        y: 0
      });
      this.findOne('.middle-left').position({
        x: 0,
        y: height / 2
      });
      this.findOne('.middle-right').position({
        x: width,
        y: height / 2
      });
      this.findOne('.bottom-left').position({
        x: 0,
        y: height
      });
      this.findOne('.bottom-center').position({
        x: width / 2,
        y: height
      });
      this.findOne('.bottom-right').position({
        x: width,
        y: height
      });

      this.findOne('.rotater').position({
        x: width / 2,
        y: -50
      });
    },
    destroy: function() {
      Konva.Group.prototype.destroy.call(this);
      this._el.off('.resizer');
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);
    }
  };
  Konva.Util.extend(Konva.Resizer, Konva.Group);

  Konva.Collection.mapMethods(Konva.Resizer);
})(Konva);
