/**
 * Created by marcel on 10.06.14.
 */


function initNotes() {
    "use strict";



    Core.addEvent('onBeforeShow', function(win) {
        win.disableMaximize();
    });


    $('#' + Win.windowID).addClass('notepad nopadding');

    var currenntNoteContent = null, a = $('textarea#note', $('#' + Win.windowID)).get(0), e = document.documentElement;
    $('textarea#note', $('#' + Win.windowID)).scroll(function () {
        var b = Math.max(e.scrollTop, a.scrollTop);
        a.style.backgroundPosition = "0px " + -b + "px"
    });


    var cornerHeight = parseInt($('#' + Win.windowID).find('.paper-torns').outerHeight(true)) + parseInt($('#' + Win.windowID).find('.paper-bottom').outerHeight(true));


    $(window).bind('resize.notepad', function () {
        if ($('#notes', $('#' + Win.windowID)).length) {
            var width = $('#' + Win.windowID).find('.right-side:first').width();
            $('#' + Win.windowID).find('.side-wrapper').height($('#' + Win.windowID).height());
            var height = $('#' + Win.windowID).find('.side-wrapper').height();
            height -= cornerHeight;
            $('#scrollcontainer', $('#' + Win.windowID)).height(height - $('#scrollcontainer', $('#' + Win.windowID)).next().outerHeight(true));
            $('#' + Win.windowID).find('#note').height(height).parents('.paper:first').height(height);

            if ($('#' + Win.windowID).find('#note').parent().hasClass('doscroll')) {
                Tools.scrollBar($('#' + Win.windowID).find('#note').parent(), $('textarea#note', $('#' + Win.windowID)).get(0).scrollTop);
            }

            Tools.scrollBar($('#notes', $('#' + Win.windowID)), $('textarea#note', $('#' + Win.windowID)).get(0).scrollTop);
        }
    });


    $(window).trigger('resize');
    $('li:eq(0)', $('#notes', $('#' + Win.windowID))).addClass('active');


    $('#' + Win.windowID).find('button.add-note').bind('click.note', function (e) {

        if ($('textarea#note', $('#' + Win.windowID)).attr('rel') == 0) {
            return;
        }

        removeActiveNodeClass();

        var self = this;
        var to = $('#notes', $('#' + Win.windowID)).find('li:first');

        var li = $('<li/>').hide()
            .attr('rel', 0).addClass('new-note').addClass('active')
            .append(
                $('<strong/>').append('Neue Notiz...')
            )
            .append(
                $('<span/>').append()
            );


        if ($('textarea#note', $('#' + Win.windowID)).attr('rel') != 'none') {
            saveCurrentNote(false, function () {

                if (to.length) {
                    li.insertBefore(to);
                }
                else {
                    $('#notes').append(li);
                }

                li.css({position: 'relative', height: 0, top: 0}).show();
                li.animate({height: 41}, 300, function () {
                    $(this).css({position: '', top: ''}).height('');
                });

                $('textarea#note', $('#' + Win.windowID)).removeClass('empty').attr('rel', 0).val('').get(0).focus();
                bindNoteListClick();
            });
        }
        else {
            if (to.length) {
                li.insertBefore(to);
            }
            else {
                $('#notes', $('#' + Win.windowID)).append(li);
            }

            li.css({position: 'relative', height: 0, top: 0}).show();
            li.animate({height: 41}, 300, function () {
                $(this).css({position: '', top: ''}).height('');
            });
            $('textarea#note', $('#' + Win.windowID)).removeClass('empty').attr('rel', 0).val('').get(0).focus();
            bindNoteListClick();
            currenntNoteContent = null;

            Tools.scrollBar($('#scrollcontainer #notes', $('#' + Win.windowID)));
        }
    });


    $('textarea#note', $('#' + Win.windowID)).bind('blur.note', function (e) {
        if (($(this).val().trim() == '' && ($(this).attr('rel') == 0) || $('textarea#note').attr('rel') == 'none')) {
            if (currenntNoteContent != $(this).val()) {
                $('#notes').find('li[rel=0]').animate({height: 0}, 300, function () {
                    $(this).remove();

                    $('textarea#note').attr('rel', 'none').addClass('empty');
                    bindNoteListClick();

                });
            }
        }
        else {
            if ($('textarea#note', $('#' + Win.windowID)).attr('rel') != 'none') {
                if (currenntNoteContent != $(this).val()) {
                    if ($(this).attr('rel') == 0) {
                        saveCurrentNote(false);
                    }
                    else {
                        saveCurrentNote(true);
                    }
                }

                bindNoteListClick();
            }
        }
    });
}

function removeActiveNodeClass() {
    $('#notes', $('#' + Win.windowID)).find('li.active').each(function () {
        $(this).removeClass('active');
    });
}

function bindNoteListClick() {
    $('.paper-bottom span', $('#' + Win.windowID)).hide();
    if ($('#notes', $('#' + Win.windowID)).find('li').length == 0) {
        $('textarea#note', $('#' + Win.windowID)).attr('rel', 'none').addClass('empty');
    }

    Tools.scrollBar($('#scrollcontainer #notes', $('#' + Win.windowID)));

    var isEmpty = true;
    if ($('textarea#note', $('#' + Win.windowID)).val().trim()) {
        $('#notes li[rel=' + $('textarea#note').attr('rel') + ']', $('#' + Win.windowID)).addClass('active');
        $('.paper-bottom span', $('#' + Win.windowID)).show();
        isEmpty = false;
    }

    var tout, deleteItem = $('<div class="delete-btn"/>').hide();
    $('#notes', $('#' + Win.windowID)).find('li:not(.add-note)').each(function () {
        var self = $(this);
        $(this).unbind().bind('dblclick.note', function (e) {
            //$('textarea#note').attr('rel', $(this).attr('rel'));
            var self = this;
            setTimeout(function () {

                currenntNoteContent = getNote($(self).attr('rel'));

            }, 50);
        });


        $(this).mouseenter(function () {
            clearTimeout(tout);
            if ($(self).find('div.delete-btn').length == 0) {
                $(self).append(deleteItem);
            }
            deleteItem.fadeIn(150);
            deleteItem.unbind().click(function (e) {
                var id = $(e.target).parents('li:first').attr('rel');
                deleteNote(id, self);
            }).fadeIn(100);
        });


        $(this).mouseleave(function () {

            tout = setTimeout(function () {
                var btn = self.find('.delete-btn');
                if (btn.length) {
                    btn.fadeOut(100, function () {
                        btn.remove();
                    });
                }
            }, 300);
        });
    });


    $('.paper-bottom span', $('#' + Win.windowID)).unbind('click.note').click(function (e) {
        var id = parseInt($('textarea#note', $('#' + Win.windowID)).attr('rel'), 0);
        if (id > 0) {
            deleteNote(id, $('#notes', $('#' + Win.windowID)).find('[rel=' + id + ']'));
            $('#notes', $('#' + Win.windowID)).find('[rel=' + id + ']').removeClass('active');
        }
    });
    //removeScroll();

    if (!isEmpty) {
        addScroll();
    }

    $('textarea#note', $('#' + Win.windowID)).tabby();
}

function removeScroll() {
    return;
}


function addScroll() {
    //return;
    ScrollPaneTextArea('textarea#note', {
        showArrows: false,
        scrollbarWidth: 15,
        arrowSize: 16
    });
}


function updateScrollPaneTextArea(textareaSelector, settings) {
    $('#' + Win.windowID).find(textareaSelector).css('overflow', 'hidden');
    var area = $(textareaSelector);
    var areaDom = area.get(0);
    //  var range = areaDom.getSelection();
    var textareaClone = $('<div style="word-wrap:break-word"/>').appendTo($('#' + Win.windowID).find(textareaSelector).parent());
    var copyAttributes = ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'word-spacing', 'line-height', 'width'];
    for (var i = 0; i < copyAttributes.length; i++) {
        textareaClone.css(copyAttributes[i], $('#' + Win.windowID).find(textareaSelector).css(copyAttributes[i]));
    }

    textareaClone.html('A');
    var heightPerRow = textareaClone.height();
    textareaClone.html($('#' + Win.windowID).find(textareaSelector).val().replace(/\n/g, '<br />'));
    var overallHeight = textareaClone.height();
    $('#' + Win.windowID).find(textareaSelector).attr('rows', Math.round(overallHeight / heightPerRow)).css('height', '').parent().css('height', overallHeight);

    textareaClone.html($('#' + Win.windowID).find(textareaSelector).val().substring(0, areaDom.selectionEnd).replace(/\n/g, '<br />') + '&nbsp;');

    var cursorPosition = textareaClone.get(0).scrollHeight - heightPerRow; // - heightPerRow;
    textareaClone.remove();

    //$(textareaSelector).height('100%').parent();
    var scrollBarDiv = $('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first');
    scrollBarDiv.removeAttr('style');

    var to = 0, scrollTop = scrollBarDiv.get(0).scrollTop;
    if ((cursorPosition + heightPerRow) >= (scrollTop + scrollBarDiv.height())) {
        to = (scrollTop + cursorPosition + heightPerRow - scrollBarDiv.height());
    }

    if (cursorPosition <= scrollTop) {
        to = cursorPosition;
    }
    // Tools.scrollBar(scrollBarDiv);
    Tools.scrollBar(scrollBarDiv, to);
}

function ScrollPaneTextArea(textareaSelector, settings) {
    var areaRight = $('#' + Win.windowID).find(textareaSelector).parents('.right-side:first');
    var height = areaRight.height();
    var width = areaRight.width();

    if (!$('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first').length) {
        height -= parseInt(areaRight.find('.paper-torns').outerHeight(true));
        height -= parseInt(areaRight.find('.paper-bottom').outerHeight(true));

        areaRight.find('div.paper:first').height(height);
        $('#' + Win.windowID).find(textareaSelector).wrap('<div class="doscroll"/>');
        $('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first').css('height', ''); //.css('overflow', 'auto');
        $('#' + Win.windowID).find(textareaSelector).css('minHeight', height);

        Tools.scrollBar($('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first'));
        //$(textareaSelector).parent().jScrollPane(settings);
    }
    else {
        height -= parseInt(areaRight.find('.paper-torns').outerHeight(true));
        height -= parseInt(areaRight.find('.paper-bottom').outerHeight(true));


        areaRight.find('.paper:first').css('height', height);

        $('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first').css('height', '');

        $('#' + Win.windowID).find(textareaSelector).css('minHeight', height);

        Tools.scrollBar($('#' + Win.windowID).find(textareaSelector).parents('.doscroll:first'));

    }

    $('#' + Win.windowID).find(textareaSelector).unbind('keyup.note');
    $('#' + Win.windowID).find(textareaSelector).on('keyup.note', function (e) {
        //if (e.keyCode == 13 || e.keyCode == 8 || e.keyCode == 38 || e.keyCode == 40) {

        updateScrollPaneTextArea(textareaSelector, settings);


        return true;

        //}
    });


    updateScrollPaneTextArea(textareaSelector, settings);
}


function saveCurrentNote(animate, callback) {
    removeActiveNodeClass();

    var id = parseInt($('textarea#note', $('#' + Win.windowID)).attr('rel'), 0);
    var post = {
        adm: 'notes',
        action: 'add',
        text: $('textarea#note').val(),
        id: id
    };

    if (id > 0) {
        post.action = 'edit';
    }


    $.post('admin.php', post, function (data) {
        if (!Tools.responseIsOk(data)) {
            jAlert(data.msg);
        }
        else {
            if (post.action == 'add') {
                removeActiveNodeClass();

                var li = $('#notes', $('#' + Win.windowID)).find('li[rel=0]').addClass('active');
                li.attr('rel', data.id);
                li.find('strong').html(data.label);
                li.find('span').html(data.date);
                $('textarea#note').attr('rel', data.id);
                $('.paper-bottom span').show();


                bindNoteListClick();
            }
            else {
                removeActiveNodeClass();

                var li = $('#notes', $('#' + Win.windowID)).find('li[rel=' + id + ']').addClass('active');

                li.find('strong').html(data.label);
                li.find('span').html(data.date);
                if (li && animate && ($('#notes').find('li').length > 1 && li.position().top > 0)) {
                    var _offset = $(li).css({position: 'relative'}).position();
                    var height = li.outerHeight();
                    li.css({position: 'absolute', top: _offset.top});
                    $('#notes', $('#' + Win.windowID)).animate({paddingTop: 41}, 300, 'linear', function () {
                    });
                    li.animate({top: 0}, 300, 'linear', function () {
                        $(this).insertBefore($('#notes').find('li:first'));
                        $('#notes', $('#' + Win.windowID)).css({paddingTop: ''});
                        $(this).css({position: '', top: '', height: ''});
                    });
                    $('.paper-bottom span').show();
                    bindNoteListClick();
                }
                else {
                    bindNoteListClick();
                }
            }


            if (typeof callback === 'function') {
                callback();
            }
        }
    });
}

function getNote(id) {
    var post = {
        adm: 'notes',
        action: 'get',
        id: id
    };
    $.post('admin.php', post, function (data) {

        if (Tools.responseIsOk(data)) {
            removeActiveNodeClass();

            var flipit = $('textarea#note').parent();

            $('textarea#note', $('#' + Win.windowID)).attr('rel', id).val('');
            $('textarea#note', $('#' + Win.windowID)).removeClass('empty').val(data.notedata.value);
            $('.paper-bottom span', $('#' + Win.windowID)).show();

            bindNoteListClick();

            $('#notes li[rel=' + id + ']', $('#' + Win.windowID)).addClass('active');


            return data.notedata.value;
        }
        else {
            jAlert(data.msg);

            return null;
        }

    }, 'json');
}


function deleteNote(id, el) {
    var post = {
        adm: 'notes',
        action: 'delete',
        id: id
    };

    $.post('admin.php', post, function (data) {

        if (!Tools.responseIsOk(data)) {
            jAlert(data.msg);
        }
        else {
            if ($('textarea#note', $('#' + Win.windowID)).attr('rel') == id) {
                $('textarea#note', $('#' + Win.windowID)).val('').attr('rel', 'none').addClass('empty');
            }

            if ($('#notes').find('li').length == 0) {
                $('textarea#note', $('#' + Win.windowID)).addClass('empty').attr('rel', 'none').val('');
            }

            $('.paper-bottom span', $('#' + Win.windowID)).hide();
            el.animate({
                height: 0, opacity: '0'
            }, 300, function () {
                $(this).remove();
                bindNoteListClick();
            });
        }
    }, 'json');
}

