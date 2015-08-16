/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:32:49
 * @version $Id$
 */

/* Draggable plugin for widget dragging in TrueCMS2.0*/
(function($) {
  $.fn.johnDraggable = function(options) {
    var log = function (k, v){
      window.console && (v ? window.console.log(k, v) : window.console.log(k));
    }
    if (options == 'destroy') {
      this.each(function() {
        $(this).off('mousedown').removeData('disX').removeData('disY');
      });
      return this;
    }


    var items = [];
    var opts = $.extend({}, $.fn.johnDraggable.defaluts, options);
    var ctx = opts.context;
    var wrapper = $(ctx).find(opts.targetWrapperClass);
    var targetClass = opts.targetClass;
    var targetElements = $(opts.targetClass);
    //Operate with placeholder
    var placeholderController = {
      _get: function() {
        return $(wrapper).find(opts.placeholder);
      },
      _create: function() {
        var temp = this._get();
        if (temp.size() == 0) {
          var className = opts.placeholder.substring(1);
          var placeholder = $('<div class="' + className + '"></div>').attr({
            style: 'background-color:#FF4400;height:20px;width:100%;border:1px solid #000;'
          });
          return placeholder;
        } else {
          return temp;
        }
      },
      _hasPlaceHodler: function() {
        return wrapper.find('.placeholder').length > 0;
      },
      _destroy: function(callback) {
        var temp = this._get();
        if (temp.size() > 0) {
          temp.fadeOut("slow");
          setTimeout(function() {
            temp.remove();
            if (callback && $.isFunction(callback)) {
              callback();
            }
          }, 1000);
        }
      }
    };

    var buildPosArray = function() {
      var posArray = new Array();
      (function() {
        var targetElements = $(opts.targetClass);
        $.each(targetElements, function(i) {
          var _self = this;
          var pOL = 0,
              pOT = 0;
          
          do {
            pOL += _self.offsetLeft;
            pOT += _self.offsetTop;
          } while(_self = _self.offsetParent);
          
          var elemDesc = {
            elemIndex: 1 + i,
            left: pOL + this.offsetLeft,
            top: pOT + this.offsetTop,
            right: pOL + this.offsetLeft + $(this).outerWidth(),
            bottom: pOT + this.offsetTop + $(this).outerHeight()
          };
          posArray.push(elemDesc);
        });
      })();
      return posArray;
    };

    var getInstance = function (fn){
      var div;
      return function (){
        return div || (div = fn.apply(this, arguments));
      }
    };

    var getPlaceHolderInstance = getInstance(function(){
      var obj = $('<div>').attr('data-emptydiv', true);
      obj.appendTo(wrapper);
      return obj;
    });

    var widgetList = [];
    this.each(function(i, cont) {
      var that = this;
      var Drag = {
        obj: null,
        container: cont,
        init: function(o) {
          Drag.obj = getPlaceHolderInstance();
          $(that).mousedown(Drag.start);
        },
        start: function(ev) {
          ev = ev || window.event;
          if (ev.which != 1)
            return;
          ev.preventDefault();
          $(opts.targetClass).removeClass('highlight');
          var type = $(that).attr('data-type');
          if (type && type == 'drag-layout') {
            // for layout
            var aContainers = $(that).find('.layout-container');
            if (aContainers.length) {
              alert("Please remove the topper object first");
              var layer = 0,
                  target = -1;
              aContainers.each(function(idx) {
                var ll = $(this).data("layer");
                if (ll > layer) {
                  layer = ll;
                  target = idx;
                }
              });
              aContainers.eq(target).addClass('highlight-layout');
              return;
            } else {
              $(that).removeClass('highlight-layout');
            }
          }
          $(that).addClass('widgetHighLight');
          var o = Drag && Drag.obj;
          var l = $(that).offset().left;
          var t = $(that).offset().top;
          $(o).css({
            position: 'absolute',
            left: l,
            top: t,
            width: $(that).outerWidth(),
            height: $(that).outerHeight(),
            'background-color': '#fff',
            'outline': "2px solid #FF0",
            opacity: 0.6,
            cursor: "move"
          }).fadeIn().attr('data-mousemove', 'move');

          $(o).data('disX', ev.pageX - $(o).offset().left);
          $(o).data('disY', ev.pageY - $(o).offset().top);
          $(document).on('mousemove', Drag.drag);
          $(document).on('mouseup', Drag.end);
          return false;
        },
        drag: function(ev) {
          var o = Drag.obj;
          var nx = ev.pageX - $(o).data('disX');
          var ny = ev.pageY - $(o).data('disY');
          $(o).css({
            left: nx,
            top: ny
          });
          var pos = Drag.calcPosition();
          var p = -1;
          var x = ev.pageX,
              y = ev.pageY,
              os = $(that).offset(),
              w = $(that).outerWidth(),
              h = $(that).outerHeight();

          log("POS:"+pos.length, pos);
          //construct the potential targetted cell array
          var preLayoutCellArray = [];
          for (var ii = 0, len = pos.length; ii < len; ii++) {
            var c = pos[ii];
            if (x >= c.left && x <= c.right && y >= c.top && y <= c.bottom) {
              preLayoutCellArray.push(ii);
              p = ii;
            }
          }

          if (preLayoutCellArray.length) {
            var layer = 0;
            var tt = preLayoutCellArray[0];
            for (var j = 0, ll = preLayoutCellArray.length; j < ll; j++) {
              var targetCell = $(opts.targetClass).eq(preLayoutCellArray[j]);
              log('targetCell:'+ preLayoutCellArray.length, targetCell);
              var targetParent = targetCell.closest(".layout-container");
              var t = +targetParent.attr("data-layer");
              if (t > layer) {
                layer = t;
                tt = preLayoutCellArray[j];
              }
            }

            if(tt === -1)return;
            var target = $(opts.targetClass).eq(tt),
                aWidgets = target.find('div[class*=widget]');

            if (aWidgets.length) {
              var sortArray = [];
              aWidgets.each(function() {
                var po = {
                  left: $(this).offset().left,
                  top: $(this).offset().top,
                  right: $(this).offset().left + $(this).outerWidth(),
                  bottom: $(this).offset().top + $(this).outerHeight(),
                  width: $(this).outerWidth(),
                  height: $(this).outerHeight()
                };
                sortArray.push(po);
              });


              var sal = sortArray.length;
              var placeHolder = ($('.widgetPlaceHolder').length && $('.widgetPlaceHolder')) || $(that).clone().removeClass('widgetHighLight').css({
                width: $(that).outerWidth() + 'px',
                height: $(that).outerHeight() + 'px'
              }).addClass('widgetPlaceHolder');
              if (sal) {
                if (sal == 1) {
                  // fix only one item's bug
                  var c = sortArray[0];
                  if (x >= c.left + c.width / 2) {
                    // check offset x
                    placeHolder.appendTo(target);
                  } else if(y >= c.top + c.height/2) {
                    // check offset y
                    placeHolder.appendTo(target);
                  } else {
                    placeHolder.prependTo(target);
                  }
                } else {
                  //find a place to insert
                  var p = -1,
                    fixed = false;

                  for (var i = 0; i < sal; i++) {
                    var c = sortArray[i];
                    if (y >= c.top && y <= c.bottom) {
                      var half = c.left + c.width / 2;
                      if (x >= half && ((i + 1 < sal && x < (sortArray[i + 1].left + sortArray[i + 1].width / 2)) || x < c.right)) {
                        p = i;
                        break;
                      } else if (x < half) {
                        p = i;
                        fixed = true;
                        break;
                      }
                    }
                  }

                  if (p != -1) {
                    if (!fixed) {
                      placeHolder.insertAfter(aWidgets.eq(p));
                    } else {
                      placeHolder.insertBefore(aWidgets.eq(p));
                    }
                  }
                }
              }
            } else {
              if (!$('.widgetPlaceHolder').length) {
                $('<div>').attr({
                  width: target.outerHeight() + 'px',
                  height: target.outerWidth() + 'px'
                }).addClass('widgetPlaceHolder').appendTo(target);
              } else {
                $('.widgetPlaceHolder').remove();
              }
            }

            // for the container layout
            $(opts.targetClass).removeClass('highlight');
            target.addClass('highlight');
          } else {
            $('.widgetPlaceHolder').remove();
          }

          return false;
        },
        end: function(ev) {
          $(that).removeClass('widgetHighLight');
          var o = Drag.obj;
          $(document).off('mousemove');
          $(document).off('mouseup');
          $(o).fadeOut().removeAttr('data-mousemove');

          var type = $(that).attr('data-type');
          if (type && type == 'drag-layout') {
            // for layout
            var pos = Drag.calcPosition();
            var p = -1;
            var x = ev.pageX,
              y = ev.pageY,
              os = $(that).offset(),
              w = $(that).outerWidth(),
              h = $(that).outerHeight();
            var preLayoutCellArray = [];
            for (var ii = 0, len = pos.length; ii < len; ii++) {
              var c = pos[ii];
              if (x > c.left && x < c.right && y > c.top && y < c.bottom) {
                preLayoutCellArray.push(ii);
                p = ii;
              }
            }

            if (p != -1) {
              if (preLayoutCellArray.length) {
                //log('layoutcell : ', preLayoutCellArray.length);
                var layer = 0;
                var tt = preLayoutCellArray[0];
                for (var j = 0, ll = preLayoutCellArray.length; j < ll; j++) {
                  var targetCell = $(opts.targetClass).eq(preLayoutCellArray[j]);
                  var targetParent = targetCell.closest(".layout-container");
                  var t = targetParent.attr("data-layer");
                  if (t > layer) {
                    layer = t;
                    tt = preLayoutCellArray[j];
                  }
                }
                //to do 
                var fixLayer = function(layoutElem) {
                  $(layoutElem).each(function() {
                    var originLayer = 0;
                    originLayer = $(this).parent() && $(this).parent().closest(".layout-container").attr('data-layer');
                    $(this).attr('data-layer', +originLayer + 1);
                  });
                  return $(layoutElem);
                };
                var target = $(opts.targetClass).eq(tt);
                if (target.closest('.layout-container') == $(that)) {
                  return;
                }
                var layout = null;
                var layoutHtml = buildDraggableLayout($(that).attr('data-layout-template'));
                layout = $(layoutHtml);
                target.append(layout);
                fixLayer(layout);
                var aOper = target.find("*[operable]");
                aOper.each(function() {
                  $(this).smartMenu(menuData);
                });
              }
            }
            //$(o).remove();
            $(document).off('mousemove').off('mouseup');
            $('.widgetPlaceHolder').remove();
          } else {
            // for widget
            var pos = Drag.calcPosition();
            var p = -1;
            var x = ev.pageX,
              y = ev.pageY,
              ol = $(that).offset().left,
              ot = $(that).offset().top,
              so = { //self container
                left: ol,
                top: ot,
                right: ol + $(that).outerWidth(),
                bottom: ot + $(that).outerHeight()
              };

            if (x >= so.left && x <= so.right && y >= so.top && y <= so.bottom) {
              $(document).off('mousemove').off('mouseup');
              $('.widgetPlaceHolder').length && $('.widgetPlaceHolder').remove();
              return;
            }

            var preLayoutCellArray = [];
            for (var ii = 0, len = pos.length; ii < len; ii++) {
              var c = pos[ii];
              if (x >= c.left && x <= c.right && y >= c.top && y <= c.bottom) {
                preLayoutCellArray.push(ii);
                p = ii;
              }
            }

            if (p != -1) {
              if (preLayoutCellArray.length) {
                var layer = 0;
                var tt = preLayoutCellArray[0];
                for (var j = 0, ll = preLayoutCellArray.length; j < ll; j++) {
                  var targetCell = $(opts.targetClass).eq(preLayoutCellArray[j]);
                  var targetParent = targetCell.closest(".layout-container");
                  var t = targetParent.attr("data-layer");
                  if (t > layer) {
                    layer = t;
                    tt = preLayoutCellArray[j];
                  }
                }
                var targetElem = $(opts.targetClass).eq(tt);
                if ($(that).data("widget")) {
                  var data = $(that).data('widget');
                  var params = $.parseJSON(unescape(data));
                  var attributes = jsonToString(params);
                  attributes = StringUtil.Base64Encode(attributes);
                  $.ajax({
                    url: params.filename,
                    type: "POST",
                    cache: false,
                    async: true,
                    dataType: "json",
                    data: {
                      "params": attributes
                    },
                    success: function(json) {
                      var $dom = $(json.html);
                      var widgetId = generatorId(10, null, params.control, 'Generated');
                      $dom.attr('id', widgetId).attr('data-widget-id', widgetId);
                      // Check if the wrapper contains some styles/links/scripts
                      var extLib = json.css;
                      if (extLib) {
                        var importLibs = null,
                          jsArr = [],
                          cssArr = [],
                          jsRe = /(.js)$/gi,
                          cssRe = /(.css)$/gi;

                        if (extLib.indexOf(',') >= 0) {
                          importLibs = extLib.split(',');
                        } else {
                          importLibs = [extLib];
                        }
                        $.each(importLibs, function() {
                          if (jsRe.test(this.toString())) {
                            jsArr.push(this.toString());
                          } else if (cssRe.test(this.toString())) {
                            cssArr.push(this.toString());
                          }
                        });
                        if (cssArr.length) {
                          //Check the wrapper header
                          var $cb = $.Callbacks();
                          for (var i = 0, l = cssArr.length; i < l; i++) {
                            var fn = (function(c) {
                              var css = cssArr[c];
                              if (!Drag.existsInWrapper('link', css)) {
                                Drag.pushIntoWrapper('link', css);
                              }
                            })(i);
                            $cb.add(fn);
                          }
                          $cb.fire();
                        }

                        if (jsArr.length) {
                          //Check the wrapper header
                          var $cb = $.Callbacks();
                          for (var i = 0, l = jsArr.length; i < l; i++) {
                            var fn = (function(c) {
                              var script = jsArr[c];
                              if (!Drag.existsInWrapper('script', script)) {
                                Drag.pushIntoWrapper('script', script);
                              }
                            })(i);
                            $cb.add(fn);
                          }
                          $cb.fire();
                        }
                      }

                      if ($dom.attr('operable')) {
                        $dom.smartMenu(menuData);
                        $dom.addClass('widgetHighLight');
                        if ($dom.attr('operable') == 'navbar-list') {
                          if ($dom.hasClass('nav-vert')){
                            // stacked navigation
                            var parentUl = $dom.children('ul.navlist');
                            var parentAl = parentUl.children('li.navlist-item');
                           
                            parentUl.on('mouseover', 'li', function (){
                              var index = $(this).index();
                              $(this).addClass('active').siblings().removeClass('active');
                              $dom.find('.menu-content').hide();
                              $dom.find('.menu-content').eq(index).show();
                            });

                          } else {
                            var parentUl = $dom.children('ul.navlist[data-level=0]');
                            var parentAl = parentUl.children('li.navlist-item');

                            parentAl.each(function() {
                              $(this).children('ul.navlist').hide();
                            });

                            parentUl.on('mouseover', 'li', function() {
                              $(this).siblings().removeClass('active').children('ul.navlist').hide();;
                              $(this).addClass('active').children('ul.navlist').show();
                            });

                          }
                        } else if ($dom.hasClass('topic-slider')) {
                          var oTopicList = $dom.find('ul.topic-list'),
                            aTopicListItem = oTopicList.children('li'),
                            oBtnList = $dom.find('ul.btn-list'),
                            aBtnListItem = oBtnList.find('li.btn-list-item');
                          aBtnListItem.on('mouseover', function() {
                            var idx = $(this).index();
                            aBtnListItem.removeClass('active');
                            $(this).addClass('active');
                            aTopicListItem.css({
                              'z-index': -1
                            });
                            aTopicListItem.eq(idx).css({
                              'z-index': 0
                            });
                          });


                          $dom.find('*[operable]').each(function() {
                            $(this).addClass('widgetHighLight');
                            $(this).smartMenu(menuData);
                          });
                        } else if ($dom.hasClass('multi-panel')) {
                          var aPanel = $dom.find('.widget-panel');

                          aPanel.each(function(idx) {
                            var widgetId = generatorId(10, null, params.control, 'Generated');
                            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);

                            $(this).closest('.tab-list-item').on('mouseover', function() {
                              $(this).addClass('active').siblings().removeClass('active');
                              $dom.find('.contents').hide().eq(idx).show()
                            });
                          });

                          if ($dom.find('.tab-list-item').length) {
                            $dom.find('.tab-list-item').first().trigger('mouseover');
                          }
                        } else if ($dom.hasClass('widget-chunk')) {
                          var aPanel = $dom.find('.widget-panel');

                          aPanel.each(function(idx) {
                            var widgetId = generatorId(10, null, params.control, 'Generated');
                            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
                          });

                          // fix multiple site-list item
                          var aSList =  $dom.find('a[operable="site-list"]');
                          aSList.each(function (){
                            var widgetId = generatorId(10, null, params.control, 'Generated');
                            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
                          });
                        }
                      }

                      $dom.find('*[operable]').each(function() {
                        $(this).addClass('widgetHighLight');
                        $(this).smartMenu(menuData);
                      });


                      var placeHolder = $('.widgetPlaceHolder');
                      if (placeHolder.length) {
                        placeHolder.replaceWith($dom);
                      } else {
                        targetElem.append($dom);
                        $('.widgetPlaceHolder').remove();
                      }
                      $dom.johnDraggable();
                    }
                  }).done(function() {
                    if (opts.fnDragEnd && $.isFunction(opts.fnDragEnd)) {
                      opts.fnDragEnd();
                    }
                  });
                } else {
                  $clone = $(that).clone();
                  if ($('.widgetPlaceHolder').length) {
                    $('.widgetPlaceHolder').replaceWith($clone);
                    $(that).remove();
                    //Destroy last event;
                    $clone.off('mousedown').removeData('disX').removeData('disY');
                    $clone.johnDraggable(opts);
                    $clone.smartMenu(menuData);

                    if ($clone.hasClass('widget-nav')) {
                      if ($clone.hasClass('nav-vert')){
                        // stacked navigation
                        var parentUl = $clone.children('ul.navlist');
                        var parentAl = parentUl.children('li.navlist-item');
                        parentUl.on('mouseover', 'li', function (){
                          var index = $(this).index();
                          var menuContents = $clone.find('.menu-content');
                          $(this).addClass('active').siblings().removeClass('active');
                          menuContents.hide();
                          menuContents.eq(index).show();
                        });
                      } else {
                        var parentUl = $clone.children('ul.navlist[data-level=0]');
                        var parentAl = parentUl.children('li.navlist-item');

                        parentAl.each(function() {
                          $(this).children('ul.navlist').hide();
                          $(this).smartMenu(menuData);
                        });

                        parentUl.on('mouseover', 'li', function() {
                          $(this).siblings().removeClass('active').children('ul.navlist').hide();;
                          $(this).addClass('active').children('ul.navlist').show();
                        });
                      }
                    }

                    if ($clone.hasClass('topic-slider')) {
                      var oTopicList = $clone.find('ul.topic-list'),
                        aTopicListItem = oTopicList.children('li'),
                        oBtnList = $clone.find('ul.btn-list'),
                        aBtnListItem = oBtnList.find('li.btn-list-item');

                      aBtnListItem.on('mouseover', function() {
                        var idx = $(this).index();
                        aBtnListItem.removeClass('active');
                        $(this).addClass('active');
                        aTopicListItem.css({
                          'z-index': -1
                        });
                        aTopicListItem.eq(idx).css({
                          'z-index': 0
                        });
                      });
                    }

                    if ($clone.hasClass('multi-panel')) {
                      var aPanel = $clone.find('.widget-panel');

                      aPanel.each(function(idx) {
                        $(this).closest('.tab-list-item').on('mouseover', function() {
                          $(this).addClass('active').siblings().removeClass('active');
                          $clone.find('.contents').hide().eq(idx).show()
                        });
                      });
                    }

                    if ($clone.attr('operable')) {
                      $clone.addClass('widgetHighLight');
                    }
                    if ($clone.find('*[operable]').length) {
                      $clone.find('*[operable]').each(function() {
                        $(this).addClass('widgetHighLight');
                        $(this).smartMenu(menuData);
                      });
                    }
                  }

                }
              }
            }
          }
          return false;
        },
        calcPosition: function() {
          var arr = [];
          (function() {
            $(opts.targetClass).each(function() {
              var os = $(this).offset();
              var w = $(this).outerWidth();
              var h = $(this).outerHeight();
              var offset = {
                left: os.left,
                top: os.top,
                right: os.left + w,
                bottom: os.top + h,
                height: h
              };
              arr.push(offset);
            });
          })();
          return arr;
        },
        _checkMouseOver: function(ev) {
          var r = {
            x: ev.pageX,
            y: ev.pageY
          };
          var posArray = buildPosArray();
          var p = -1;
          for (var i = 0, len = posArray.length; i < len; i++) {
            var elem = posArray[i];
            if (r.x > elem.left && r.x < elem.right && r.y > elem.top && r.y < elem.bottom) {
              p = i;
              break;
            }
          }
          return p;

        },
        existsInWrapper: function(type, link) {
          var aElem = $(opts.targetWrapperClass).find(type);
          var retVal = false;
          if (aElem.length) {
            $.each(aElem, function() {
              if ($(this).prop('outerHTML').indexOf(link) >= 0) {
                retVal = true;
              }
            });
          }
          return retVal;
        },
        pushIntoWrapper: function(type, link) {
          var $domElem = null;
          switch (type) {
            case 'link':
              $domElem = $('<link>').attr({
                rel: "stylesheet",
                type: "text/css",
                href: link
              });
              break;
            case 'script':
              $domElem = $('<script><\/script>').attr({
                type: 'text/javascript',
                src: link
              });
              break;
            default:
              log(type);
          }
          if ($domElem) {
            $(opts.targetWrapperClass).prepend($domElem);
          }
        }
      };
      Drag.init(this);
      widgetList.push(Drag);
    });

    return this;
  };

  $.fn.johnDraggable.defaluts = {
    context: 'body',
    placeholder: '.placeholder',
    targetWrapperClass: '.wrapper',
    targetClass: '.layout-cell'
  };


  function throttle(obj, callback) {
    clearTimeout(obj.timeoutId);
    obj.timeoutId = setInterval(function() {
      if ($.isFunction(callback)) {
        callback();
      }
    }, 50);
  }
})(jQuery);