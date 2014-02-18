// TODO: JSUnit test this
jQuery(function($) {
	
    $("#user_id").change(function() {  $("form#user_switch").submit();  });
    $("#ajax-indicator").ajaxStart(function(){ $(this).show();  });
    $("#ajax-indicator").ajaxStop(function(){ $(this).hide();  });

    $("#filter").change(function() {
	    $.ajax({
	        type: "GET",
	        url: 'stuff_to_do/available_issues.js',
	        dataType: 'html',
	        data: { filter : $('#filter').val(), user_id : $('#user_id').val(), project_id : $('#project_id').val() },
	        success: function(response) {
	            $('#available-pane').html(response);
	            attachSortables();
	        },
	        error: function(response) {
	            $("div.error").html("Error filtering pane.  Please refresh the page.").show();
	            }});
	});
    
    $("#project_id").change(function() {
        $.ajax({
            type: "GET",
            url: 'stuff_to_do/available_issues.js',
            dataType: 'html',
            data: { filter : $('#filter').val(), user_id : $('#user_id').val(), project_id : $('#project_id').val() },
            success: function(response) {
                $('#available-pane').html(response);
                attachSortables();
            },
            error: function(response) {
                $("div.error").html("Error filtering pane.  Please refresh the page.").show();
            }});
	});

  attachSortables = function() {
    $("#available").sortable({
        cancel: 'a',
        connectWith: ["#doing-now", "#recommended", ".day_grid_day"],
        placeholder: 'drop-accepted',
        dropOnEmpty: true,
        tolerance: 'pointer',
        update : function (event, ui) {
            if ($('#available li.issue').length > 0) {
                $("#available li.empty-list").hide();
            } else {
                $("#available li.empty-list").show();
            }
        },
        helper: function (event, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          return li.clone();
        },
        stop: function (event, ui) {
          var copied = $(this).data('copied');
          if (!copied) {
            this.copyHelper.remove();
          }
          this.copyHelper = null;
        }
    });

    $("#doing-now").sortable({
        cancel: 'a',
        connectWith: ["#available", "#recommended", ".day_grid_day"],
        dropOnEmpty: true,
        placeholder: 'drop-accepted',
        tolerance: 'pointer',
        update : function (event, ui) {},
        helper: function (event, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          return li.clone();
        },
        stop: function (event, ui) {
          var copied = $(this).data('copied');
          if (!copied) {
            this.copyHelper.remove();
          }
          this.copyHelper = null;
          saveOrder(ui);
        }
    });

    $("#recommended").sortable({
        cancel: 'a',
        connectWith: ["#available", "#doing-now", ".day_grid_day"],
        dropOnEmpty: true,
        placeholder: 'drop-accepted',
        tolerance: 'pointer',
        update : function (event, ui) {},
        helper: function (event, li) {
          this.copyHelper = li.clone().insertAfter(li);
          $(this).data('copied', false);
          return li.clone();
        },
        stop: function (event, ui) {
          var copied = $(this).data('copied');
          if (!copied) {
            this.copyHelper.remove();
          }
          this.copyHelper = null;
          saveOrder(ui);
        }
    });

    $(".day_grid_day").sortable({
        cancel: 'a',
        connectWith: ["#available", "#doing-now", "#recommended", ".day_grid_day"],
        dropOnEmpty: true,
        placeholder: 'drop-accepted',
        tolerance: 'pointer',
        update: function(event, ui) {
          var project = ui.item.find('[data-project]').data('project');

          calculateHeight(ui.item);
          ui.item.css('background', generateCssSeriesColor(project));

          ui.item.resizable({
            handles: 's',
            stop: function(event, ui) {
              var newHeight = ui.element.height();
              calculateHeight(ui.element, newHeight);
            }
          });
        },
        receive: function (e, ui) {
          ui.sender.data('copied', true);
        }
        //update : function (event, ui) { saveOrder(ui); },
    });

  },

  calculateHeight = function(el, height) {
    var parent = el.parent(),
        parentHeight = parent.height(),
        padding = 12,
        otherHours = 0,
        hours,
        dayHours,
        newHeight;

    parent.find('[data-hours]').not(el).each( function(i, otherEl) {
      otherHours += parseFloat($(otherEl).data('hours'));
    });

    // Calculate height based on estimated hours
    if (typeof height === 'undefined') {
      hours = parseFloat(el.find('.estimate').text()) || 2;
      dayHours = Math.min(8-otherHours, hours);

    // Use current height to calculate hours
    } else {
      dayHours = height / parentHeight * 8;
    }

    height = dayHours / 8 * parentHeight - padding;
    el.height(height).attr('data-hours', dayHours);

    console.log(padding, hours, otherHours, dayHours, height)
  },

  saveOrder = function() {
    data = 'user_id=' + user_id + '&' + $("#doing-now").sortable('serialize') + '&' + $("#recommended").sortable('serialize');
    if (filter != null) {
        data = data + '&filter=' + filter;
    }
    
    if (project_id != null) {
    	data = data + '&project_id=' + project_id;
    }

    data = addAuthenticityToken(data);

    $.ajax({
        type: "POST",
        url: 'stuff_to_do/reorder.js',
        dataType: 'html',
        data: data,
        success: function(response) {
            $('#panes').html(response);
            attachSortables();
        },
        error: function(response) {
            $("div#stuff-to-do-error").html("Error saving lists.  Please refresh the page and try again.").show();
        }});

  },

    isProjectItem = function(element) {
        return element.attr('id').match(/project/);
    },

    getRecordId = function(jqueryElement) {
        return jqueryElement.attr('id').split('_').last();
    },

    parseIssueId = function(jqueryElement) {
        return jqueryElement.attr('id').split('_')[1];
    },

    addAuthenticityToken = function(data) {
      return data + '&authenticity_token=' + encodeURIComponent(window._token);
    },

  attachSortables();

    // Fix the image paths in facebox
    $.extend($.facebox.settings, {
        loadingImage: '../images/loading.gif',
        closeImage: '../plugin_assets/stuff_to_do_plugin/images/closelabel.gif',
        faceboxHtml  : '\
    <div id="facebox" style="display:none;"> \
      <div class="popup"> \
        <table> \
          <tbody> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td class="body"> \
                <div class="content"> \
                </div> \
                <div class="footer"> \
                  <a href="#" class="close"> \
                    <img src="../plugin_assets/stuff_to_do_plugin/images/closelabel.gif" title="close" class="close_image" /> \
                  </a> \
                </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'

    });

});

var projectColors = {},
    saturation = 0.08,
    value = 0.98; // aka brightness
    hue = 0.65; // or mix it up with Math.random()

var GOLDEN_RATIO = 0.618033988749895;

// HSV values in [0..1[
// returns [r, g, b] values from 0 to 255
// See http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
function hsvToRgb(h, s, v) {
  var h_i, f, p, q, t, r, g, b;
  h_i = parseInt(h*6);
  f = h*6 - h_i;
  p = v * (1 - s);
  q = v * (1 - f*s);
  t = v * (1 - (1 - f) * s);
  if (h_i==0) { r = v; g = t; b = p; }
  if (h_i==1) { r = q; g = v; b = p; }
  if (h_i==2) { r = p; g = v; b = t; }
  if (h_i==3) { r = p; g = q; b = v; }
  if (h_i==4) { r = t; g = p; b = v; }
  if (h_i==5) { r = v; g = p; b = q; }
  return [parseInt(r*256), parseInt(g*256), parseInt(b*256)];
}

function generateCssSeriesColor(project) {
  var color;
  if (projectColors[project]) {
    color = projectColors[project];
  } else {
    hue += GOLDEN_RATIO;
    hue %= 1;
    projectColors[project] = color = "rgb(" + hsvToRgb(hue, saturation, value) + ")";
  }
  return color;
}
