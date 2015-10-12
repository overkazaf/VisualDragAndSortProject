/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:32:49
 * @update  2015-06-25 17:09:12
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

    var items = [],
        opts = $.extend({}, $.fn.johnDraggable.defaluts, options),
        ctx = opts.context,
        wrapper = $(ctx).find(opts.targetWrapperClass),
        targetClass = opts.targetClass,
        targetElements = $(opts.targetClass);

    // Build a position arry that records the bound of every targetted elements
    var buildPosArray = function() {
      var posArray = [];
      (function() {
        var targetElements = $(opts.targetClass);
        $.each(targetElements, function(i) {
          var _self = this,
              pOL = 0,
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
      var makeExternalRequire = function (extLib){
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
            (function (cssArray){
              var $cb = $.Callbacks();
              $.each(cssArray, function (i, css) {
                  var fn = function () {
                    if (!Drag.existsInWrapper('link', css)) {
                      Drag.pushIntoWrapper('link', css);
                    }
                  };
                  $cb.add(fn);
              });
              $cb.fire();
            })(cssArr);
          }

          if (jsArr.length) {
            //Check the wrapper header
            (function (jsArr){
              var $cb = $.Callbacks();
              $.each(jsArr, function (i, script) {
                var fn = function (){
                  if (!Drag.existsInWrapper('script', script)) {
                    Drag.pushIntoWrapper('script', script);
                  }
                };
                $cb.add(fn);
              });
              $cb.fire();
            })(jsArr);
          }
        }
      };
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

          // 移除布局高亮
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
              
              if (type && type == 'drag-widget') {
                $(Drag.obj).empty();
              }

              $(o).css({
                position: 'absolute',
                left: $(that).offset().left,
                top: $(that).offset().top,
                width: $(that).outerWidth(),
                height: $(that).outerHeight() || 120,
                'background': '#aaa',
                'border' : '1px solid #ff0',
                'z-index' : 99999,
                opacity: 0.5,
                cursor: "move"
              }).fadeIn().attr('data-mousemove', 'move');

              // cache the offset distance
              $(o).data('disX', ev.pageX - $(o).offset().left).data('disY', ev.pageY - $(o).offset().top);
              $(document).on('mousemove', Drag.drag);
              $(document).on('mouseup', Drag.end);
          return false;
        },
        drag: function(ev) {

          $(Drag.obj).css({
            left: ev.pageX - $(Drag.obj).data('disX'),
            top: ev.pageY - $(Drag.obj).data('disY')
          });

          var pos = Drag.calcPosition(),
              p = -1,
              x = ev.pageX,
              y = ev.pageY,
              os = $(that).offset(),
              w = $(that).outerWidth(),
              h = $(that).outerHeight();

          //construct the potential targetted cell array
          var preLayoutCellArray = []; // 测试看命中哪些单元
          $.each(pos, function (i, c){
            if (x > c.left && x < c.right && y > c.top && y < c.bottom) {
              preLayoutCellArray.push(i); // 将命中的布局索引压入数组
              p = i;
            }
          });

          if (preLayoutCellArray.length) {
              // 如果存在命中的单元
              $('.widgetPlaceHolder').remove();
              var layer = 0,
                  tt = preLayoutCellArray[0];
              
              $.each(preLayoutCellArray, function (j, layoutIndex){
                var targetCell = $(opts.targetClass).eq(layoutIndex),
                    targetParent = targetCell.closest(".layout-container"),
                    t = +targetParent.attr("data-layer");
                
                if (t > layer) {
                  // take the highest level targetted layout
                  layer = t;
                  tt = layoutIndex;
                }
              });
              
              var target = $(opts.targetClass).eq(tt),
                  aWidgets = target.children('div[class*=widget]'),
                  sortArray = [],
                  sal;

              if (sal = aWidgets.length) {
                // 如果存在部件，且类型为部件,要对其进行排序
                if (!$(that).attr('data-type')) {
                  aWidgets.each(function() {
                    var of = $(this).offset(),
                        oH = $(this).width(),
                        oW = $(this).height(),
                        po = {
                          left: of.left,
                          top: of.top,
                          right: of.left + oW,
                          bottom: of.top + oH,
                          width: oW,
                          height: oH
                        };
                      // 把当前部件的位置信息压入数组
                     sortArray.push(po);
                  });

                  var
                      placeHolder = ($('.widgetPlaceHolder').length && $('.widgetPlaceHolder')) || $(that).clone().removeClass('widgetHighLight').css({
                      width: $(that).width(),
                      height: $(that).height(),
                      'background': '#ff0',
                      'border' : '1px solid #f00',
                      'z-index' : 99999,
                      opacity: 0.5
                    }).addClass('widgetPlaceHolder');

                  if (sal == 1) {
                      // fix only one item's bug
                      var c = sortArray[0];
                      if (y < c.top + c.height / 2) {
                        placeHolder.prependTo(target);
                      } else if(y >= c.top + c.height/2) {
                        // check offset y
                        placeHolder.appendTo(target);
                      } else {
                        placeHolder.appendTo(target);
                      }
                  } else {
                      //find a place to insert
                      var p = -1,
                          fixed = false,
                          breakFlag = false;

                      $.each(sortArray, function (i, c){
                        if(!breakFlag) {
                          if (x >= c.left && x <= c.right) {
                            var half = c.top + c.height / 2;
                            if (y >= half && ((i + 1 < sal && y < (sortArray[i + 1].top + sortArray[i + 1].height / 2)) || y < c.bottom)) {
                              p = i;
                              breakFlag = true;
                            } else if (y < half) {
                              p = i;
                              fixed = true;
                              breakFlag = true;
                            }
                          }
                        }
                      });

                      if (p != -1) {
                        if (!fixed) {
                          placeHolder.insertAfter(aWidgets.eq(p));
                        } else {
                          placeHolder.insertBefore(aWidgets.eq(p));
                        }
                      }
                  }
                }
              }
                // If there is no target in this layout container
                
              
              if (!$('.widgetPlaceHolder').length) {
                  // Find if there contains more than 1 target layout
                  var potentialLayout = target.children('.layout-container'),
                      defaultHeight = 120,
                      newDiv = $('<div>').css({
                      'width': target.width(),
                      'height': defaultHeight,
                      'margin-top' : '10px',
                      'margin-bottom' : '10px',
                      'opacity' : 0.5
                    }).addClass('widgetPlaceHolder');
                  
                  if (!potentialLayout.length) {
                    newDiv.appendTo(target);
                  } else {
                    // reposition it
                    var sortLayout = [];
                    target.children('.layout-container').each(function (){
                      var offset = $(this).offset(),
                          oW = $(this).outerWidth(),
                          oH = $(this).outerHeight(),
                          os = {
                            left : offset.left,
                            right : offset.left + oW,
                            top : offset.top,
                            bottom : offset.top + oH,
                            width : oW,
                            height : oH
                          };
                      sortLayout.push(os);
                    });

                    if (sortLayout.length == 1) {
                      if (y < sortLayout[0].top) {
                        newDiv.prependTo(target);
                      } else {
                        newDiv.appendTo(target);
                      }
                    } else {
                      var p = -1,
                          fixed = false,
                          breakFlag = false,
                          l = sortLayout.length;

                      $.each(sortLayout, function (i, sl){
                        if(!breakFlag) {
                          if (x >= sl.left && x <= sl.right) {
                            var half = sl.top + sl.height / 2;
                            if (i == l-1) {
                              if (y >= half) {
                                newDiv.insertAfter(potentialLayout.eq(p));
                              } else {
                                newDiv.insertBefore(potentialLayout.eq(p));
                              }
                            } else {
                              if (y >= half && ((i + 1 < l && y < (sortLayout[i + 1].top + sortLayout[i + 1].height / 2)) || y < sl.bottom)) {
                                p = i;
                                breakFlag = true;
                              } else if (y < half) {
                                p = i;
                                fixed = true;
                                breakFlag = true;
                              }
                            }
                          }
                        }
                      });
                     
                      if (p != -1) {
                        if (fixed) {
                          newDiv.insertBefore(potentialLayout.eq(p));
                        } else {
                          newDiv.insertAfter(potentialLayout.eq(p));
                        }
                      }
                    }
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
          $(document).off('mousemove', Drag.drag);
          $(document).off('mouseup', Drag.end);
          $(o).fadeOut().removeAttr('data-mousemove');

          var type = $(that).attr('data-type');
          if (type && type == 'drag-layout') {
            // for layout
            var pos = Drag.calcPosition(),
                p = -1,
                x = ev.pageX,
                y = ev.pageY,
                os = $(that).offset(),
                w = $(that).outerWidth(),
                h = $(that).outerHeight(),
                preLayoutCellArray = [];

            $.each(pos, function (i, c) {
              if (x > c.left && x < c.right && y > c.top && y < c.bottom) {
                preLayoutCellArray.push(i);
                p = i;
              }
            });

            if (p != -1) {
                //log('layoutcell : ', preLayoutCellArray.length);
                var layer = 0,
                    tt = preLayoutCellArray[0];
                $.each(preLayoutCellArray, function (j, targetLayoutCell) {
                  var targetCell = $(opts.targetClass).eq(targetLayoutCell),
                      targetParent = targetCell.closest(".layout-container"),
                      t = targetParent.attr("data-layer");
                    if (t > layer) {
                      layer = t;
                      tt = targetLayoutCell;
                    }
                });
                
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
                var layout = null,
                    layoutHtml = buildDraggableLayout($(that).attr('data-layout-template'));
                
                layout = $(layoutHtml);
                
                if ($('.widgetPlaceHolder').length) {
                  $('.widgetPlaceHolder').replaceWith(layout);
                } else {
                  target.append(layout);
                }

                fixLayer(layout);
                target.find("*[operable]").each(function() {
                  $(this).smartMenu(menuData);
                });
            }
            $(document).off('mousemove', Drag.drag).off('mouseup', Drag.end);
            $('.widgetPlaceHolder').remove();
          } else {
            // for widget
            var pos = Drag.calcPosition(),
                p = -1,
                x = ev.pageX,
                y = ev.pageY,
                ol = $(that).offset().left,
                ot = $(that).offset().top,
                so = { //self container
                  left: ol,
                  top: ot,
                  right: ol + $(that).outerWidth(),
                  bottom: ot + $(that).outerHeight()
                };

            if (x > so.left && x < so.right && y > so.top && y < so.bottom) {
              $(document).off('mousemove', Drag.drag).off('mouseup', Drag.end);
              $('.widgetPlaceHolder').length && $('.widgetPlaceHolder').remove();
              return;
            }

            var preLayoutCellArray = [];
            $.each(pos, function (i, c){
              if (x > c.left && x < c.right && y > c.top && y < c.bottom) {
                preLayoutCellArray.push(i);
                p = i;
              }
            });
            

            if (p != -1) {
                var layer = 0,
                    tt = preLayoutCellArray[0];
                for (var j = 0, ll = preLayoutCellArray.length; j < ll; j++) {
                  var targetCell = $(opts.targetClass).eq(preLayoutCellArray[j]),
                      targetParent = targetCell.closest(".layout-container"),
                      t = +targetParent.attr("data-layer");
                    if (t > layer) {
                      layer = t;
                      //log(preLayoutCellArray.length, j);
                      tt = preLayoutCellArray[j];
                    }
                }

                var targetElem = $(opts.targetClass).eq(tt);
                
                if ($(that).data("widget")) {
                  var data = $(that).data('widget'),
                      params = $.parseJSON(unescape(data)),
                      attributes = jsonToString(params);
                  
                  attributes = StringUtil.Base64Encode(attributes);
                  $.ajax({
                    url: params.filename,
                    type: "POST",
                    cache: true,
                    async: true,
                    dataType: "json",
                    data: {"params": attributes},
                    success: function(json) {
                      var $dom = $(json.html),
                          widgetId = generatorId(10, null, params.control, 'Generated');
                      
                      $dom.attr('id', widgetId).attr('data-widget-id', widgetId);
                      // Check if the wrapper contains some styles/links/scripts
                      makeExternalRequire(json.css);

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
                        }else if ($dom.hasClass('navbox')) {
                          $dom.on('mouseover', '.subNav', function (){
                            var index = $(this).index();
                            $(this).addClass('currentDd currentDt').siblings().removeClass('currentDd currentDt');
                            if ($(this).next().is(':visible') == 'true') {
                            } else {
                              $(this).next().siblings().filter(function (){
                                return $(this).hasClass('navContent');
                              }).hide();
                              $(this).next().show('slow');
                            }
                          });
                        } else if ($dom.hasClass('multi-panel')) {
                          var aPanel = $dom.find('.widget-panel');

                          aPanel.each(function(idx) {
                            var widgetId = generatorId(10, null, params.control, 'Generated');
                            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
                          });

                          var tabList = $dom.find('.tab-list');
                          tabList.on('mouseover', '.tab-list-item', function (){
                            var index = $(this).index();
                            $(this).addClass('active').siblings().removeClass('active');
                            $dom.find('.widget-panel').hide().eq(index).show()
                          });

                         $dom.find('.tab-list-item').first().trigger('mouseover');

                        } else if ($dom.hasClass('widget-chunk')) {
                          var aWidgets = $dom.find('div[class*=widget]');

                          aWidgets.each(function(idx) {
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


                        // Choice card widget
                        if ($dom.hasClass('choice-card')) {
                          $('.tab-list', $dom).on('mouseover', '.tab-item', function (){
                            var index = $(this).index();
                            $(this).addClass('active').siblings().removeClass('active');
                            $('.tab-content', $dom).hide().eq(index).show();
                          });

                          $('.tab-item', $dom).first().trigger('mouseover');
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
                      var panels = $clone.find('.widget-panel');
                      var tabList = $clone.find('.tab-list');
                      tabList.on('mouseover', '.tab-list-item', function (){
                          var index = $(this).index();
                          $(this).addClass('active').siblings().removeClass('active');
                          panels.hide().eq(index).show();
                      });
                    }

                    if ($clone.hasClass('choice-card')) {
                      $('.tab-list', $clone).on('mouseover', '.tab-item', function (){
                        var index = $(this).index();
                        $(this).addClass('active').siblings().removeClass('active');
                        $('.tab-content', $clone).hide().eq(index).show();
                      });

                      $('.tab-item', $clone).first().trigger('mouseover');
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

                    if ($clone.hasClass('navbox')) {
                      $clone.on('mouseover', '.subNav', function (){
                          var index = $(this).index();
                          $(this).addClass('currentDd currentDt').siblings().removeClass('currentDd currentDt');
                          if ($(this).next().is(':visible') == 'true') {
                          } else {
                            $(this).next().siblings().filter(function (){
                              return $(this).hasClass('navContent');
                            }).hide();
                            $(this).next().show('slow');
                          }

                        });
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
})(jQuery);