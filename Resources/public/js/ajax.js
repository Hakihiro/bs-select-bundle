var AxiolabBootstrapSelect = {
    timer: null,
    searchValue: null,
    currentRequest: null,
    initAjaxSearching: function(inputId, inputName, config) {
        var traductions = {
            fr: {
                search_start: '3 caractères minimum pour lancer la recherche.'
            },
            en: {
                search_start: 'Search start after 3 characters'
            }
        }

        $select    = $("body " + inputId);
        $container = $select.parent();
        $form      = $container.closest('form');
        $searchbox = $container.find('.bs-searchbox');
        $searchbar = $container.find("input[type='text']");
        $loader    = "<div class='text-center'><i class='fa fa-refresh fa-spin'></i></div>";
        $searchstart = "<div class='text-center'>"+traductions[config.locale].search_start+"</div>";
        $noresult = $("body").find('.dropdown-menu .no-results');

        $searchbox.on('input propertychange', function(e) {
            e.stopPropagation();
        });

        $searchbar.on('keyup', function() {
            var search_pattern = $(this).val();
            
            if (search_pattern.length < config.search_start) {
                $("body").find('.dropdown-menu .no-results').html($searchstart);
            } else if (search_pattern != AxiolabBootstrapSelect.searchValue) {
                $("body").find('.dropdown-menu .no-results').html($loader);

                if (AxiolabBootstrapSelect.timer != null) {
                    clearTimeout(AxiolabBootstrapSelect.timer);
                }

                if (AxiolabBootstrapSelect.currentRequest != null) {
                    AxiolabBootstrapSelect.currentRequest.abort();
                }

                AxiolabBootstrapSelect.timer = setTimeout(
                    function() {
                        AxiolabBootstrapSelect.currentRequest = $.ajax({
                            url : $form.attr('action'),
                            type: $form.attr('method'),
                            data : {
                                bsselect_search: search_pattern,
                                search_input_id: inputId.replace('#', ''),
                                search_input_name: inputName
                            },
                            success: function(html) {
                                AxiolabBootstrapSelect.currentRequest = null;
                                clearTimeout(AxiolabBootstrapSelect.timer);

                                $newSelect = $(html).find(inputId);
                                if ($newSelect.find("option").size() > 0) {
                                    $("body " + inputId).html($newSelect.html());
                                    $("body " + inputId).selectpicker('refresh');
                                    $("body " + inputId).selectpicker('setSize');
                                } else {
                                    $("body").find('.dropdown-menu .no-results').html($.fn.selectpicker.defaults.noneResultsText.replace('{0}', '"' + AxiolabBootstrapSelect.htmlEscape(search_pattern) + '"')).show();
                                }

                                AxiolabBootstrapSelect.searchValue = search_pattern;
                            }
                        });
                    },
                    300
                );
            }
        });
    },
    htmlEscape: function(html) {
        var escapeMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;'
        };
        var source = '(?:' + Object.keys(escapeMap).join('|') + ')',
            testRegexp = new RegExp(source),
            replaceRegexp = new RegExp(source, 'g'),
            string = html == null ? '' : '' + html;
        return testRegexp.test(string) ? string.replace(replaceRegexp, function (match) {
            return escapeMap[match];
        }) : string;
    }
};
