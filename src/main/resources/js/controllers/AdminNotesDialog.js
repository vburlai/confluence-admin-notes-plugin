/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Dialog for editing plugin notes
 *
 */
var AdminNotesDialog = {
    $: AJS.$,
    OVERWRITE: "Overwrite",
    OVERWRITEC: "Overwrite (#)",
    COUNTDOWN: 5,
    elem: null,
    dialog: null,
    pluginkey: '',
    plugintitle: '',
    pluginnotes: '',
    pluginnew: false,
    overwrite: null,
    counter: 0,
    timer: null,
    isShown: false,
    init: function () {
        if (this.elem === null) {
            this.elem = $('<section role="dialog" id="admin-notes-dialog" '+
                          'class="aui-layer aui-dialog2 aui-dialog2-medium" aria-hidden="true"></section>');
            $('BODY').append(this.elem);

            this.render();

            this.dialog = AJS.dialog2('#admin-notes-dialog');

            this.elem.find('#dialog-submit-button, #dialog-overwrite-button').on('click', function () { AdminNotesDialog.save(); });
            this.elem.find('#dialog-close-button').on('click', function () { AdminNotesDialog.hide(); });

            this.$(document).on('admin-notes-collection-updated', this.$.proxy(this.collectionUpdated, this));
        }
    },
    collectionUpdated: function () {
        if (this.isShown) {
            var notes = AdminNotesCollection.getNotes(this.pluginkey);
            if (this.pluginnotes != notes) {
                this.showConflict(notes);
            }
        }
    },
    render: function () {
        var html = '';
        html += '<header class="aui-dialog2-header">';
        html += '  <h2 class="aui-dialog2-header-main">Admin Notes</h2>';
        html += '  <a class="aui-dialog2-header-close"><span class="aui-icon aui-icon-small aui-iconfont-close-dialog">Close</span></a>';
        html += '</header>';
        html += '<div class="aui-dialog2-content">';
        html += '  <div class="conflict">';
        html += '  Warning! While you were editing, the notes were updated to the following:<br>';
        html += '  <textarea name="prevnotes" readonly="readonly"></textarea>';
        html += '  </div>';
        html += '  <p class="title">Plugin: <span class="plugintitle"></span></p>';
        html += '  <input type="hidden" name="pluginkey" value="">';
        html += '  <input type="hidden" name="plugintitle" value="">';
        html += '  <textarea name="notes"></textarea>';
        html += '</div>';
        html += '<footer class="aui-dialog2-footer">';
        html += '<div class="aui-dialog2-footer-actions">';
        html += '  <button id="dialog-submit-button" class="aui-button aui-button-primary">Save</button>';
        html += '  <button id="dialog-overwrite-button" class="aui-button aui-button-primary">Overwrite</button>';
        html += '  <button id="dialog-close-button" class="aui-button aui-button-close">Close</button>';
        html += '</div>';
        html += '<div class="aui-dialog2-footer-hint">There was a conflict while saving, but you can overwrite</div>';
        html += '</footer>';

        this.elem.html(html);
        this.overwrite = this.elem.find('#dialog-overwrite-button');
    },
    show: function (key) {
        this.hideConflict();
        AdminNotesView.hideList();

        this.pluginkey = key;
        this.plugintitle = AdminNotesCollection.getTitle(key);
        this.pluginnotes = AdminNotesCollection.getNotes(key);
        this.pluginnew = false;

        if (this.elem === null) {
            this.init();
        }

        this.refresh();

        this.dialog.show();
        this.isShown = true;
    },
    add: function (key, title) {
        this.hideConflict();
        AdminNotesView.hideList();

        this.pluginkey = key;
        this.plugintitle = title;
        this.pluginnotes = '';
        this.pluginnew = true;

        if (this.elem === null) {
            this.init();
        }

        this.refresh();

        this.dialog.show();
        this.isShown = true;
    },
    hide: function () {
        this.isShown = false;
        this.dialog.hide();
        // reset
        this.pluginkey = '';
        this.plugintitle = '';
        this.pluginnotes = '';
        this.refresh();
    },
    refresh: function () {
        this.elem.find('.plugintitle').text(this.plugintitle);

        this.elem.find('[name=pluginkey]').val(this.pluginkey);
        this.elem.find('[name=plugintitle]').val(this.plugintitle);
        this.elem.find('[name=notes]').val(this.pluginnotes);
    },
    save: function () {
        var key = this.elem.find('[name=pluginkey]').val(),
            title = this.elem.find('[name=plugintitle]').val(),
            notes = this.elem.find('[name=notes]').val(),
            deferred;

        if (this.pluginnew) {
            if (notes.trim().length) {
                deferred = AdminNotesCollection.add(key, title, notes);
            } else {
                deferred = this.$.Deferred().resolve();
            }
        } else {
            if (notes.trim().length) {
                deferred = AdminNotesCollection.save(key, notes);
            } else {
                deferred = AdminNotesCollection.remove(key);
            }
        }
        deferred.done(
            this.$.proxy(
                function () {
                    this.hide();
                }, this) ).fail(
            this.$.proxy(
                function (notes) {
                    this.showConflict(notes);
                }, this) );
    },
    showConflict: function (notes) {
        this.pluginnotes = notes;
        this.elem.find('[name=prevnotes]').val(notes);
        this.elem.addClass('has-conflict');
        this.startCountDown();
    },
    startCountDown: function () {
        this.overwrite.prop('disabled', true);
        this.counter = this.COUNTDOWN;
        this.overwrite.text(this.OVERWRITEC.replace('#', this.counter));

        this.timer = window.setInterval(this.$.proxy(
            function () {
                if (--this.counter <= 0) {
                    window.clearInterval(this.timer);
                    this.timer = null;
                    this.overwrite.text(this.OVERWRITE);
                    this.overwrite.prop('disabled', false);
                } else {
                    this.overwrite.text(this.OVERWRITEC.replace('#', this.counter));
                }
            }
        , this), 1000);
    },
    hideConflict: function () {
        this.elem.removeClass('has-conflict');
    }
};

