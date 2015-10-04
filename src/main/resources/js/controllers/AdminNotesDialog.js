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
    // Current plugin key
    pluginkey: '',
    // Current plugin title
    plugintitle: '',
    // Current plugin notes
    pluginnotes: '',
    // Adding notes (true) or editing (false)
    pluginnew: false,
    // Overwrite button (show countdown)
    overwrite: null,
    // Countdown
    counter: 0,
    // Countdown timer
    timer: null,
    // Dialog visible or hidden
    isShown: false,

    init: function () {
        if (this.elem === null) {
            // setup element
            this.elem = this.$('<section role="dialog" id="admin-notes-dialog" '+
                          'class="aui-layer aui-dialog2 aui-dialog2-medium" aria-hidden="true"></section>');

            this.render();

            this.overwrite = this.elem.find('#dialog-overwrite-button');

            this.$('BODY').append(this.elem);

            // Apply AJS.dialog2
            this.dialog = AJS.dialog2('#admin-notes-dialog');

            // Add handlers
            this.elem.find('#dialog-submit-button, #dialog-overwrite-button').on('click', this.$.proxy( this.save, this ));
            this.elem.find('#dialog-close-button').on('click', this.$.proxy( this.hide, this ));

            // Listen to collection updates
            this.$(document).on('admin-notes-collection-updated', this.$.proxy( this.collectionUpdated, this ));
        }
    },

    /**
     * Triggered when collection gets new data
     */
    collectionUpdated: function () {
        if (this.isShown) {
            var notes = AdminNotesCollection.getNotes(this.pluginkey);
            if (this.pluginnotes != notes) {
                this.showConflict(notes);
            }
        }
    },

    /**
     * Sets inner HTML for the dialog
     */
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
    },

    /**
     * Shows/opens a dialog for editing notes for specified plugin key
     */
    show: function (key) {
        this.add(key, undefined);
    },

    /**
     * Shows/opens a dialog for adding notes for specified plugin key
     */
    add: function (key, title) {
        this.hideConflict();
        AdminNotesView.hideList();

        this.pluginkey = key;

        if (typeof title == 'undefined') {
            // Editing existing notes
            this.plugintitle = AdminNotesCollection.getTitle(key);
            this.pluginnotes = AdminNotesCollection.getNotes(key);
            this.pluginnew = false;
        } else {
            // Add new notes
            this.plugintitle = title;
            this.pluginnotes = '';
            this.pluginnew = true;
        }

        if (this.elem === null) {
            this.init();
        }

        this.refresh();

        this.dialog.show();
        this.isShown = true;
    },

    /**
     * Hide dialog and reset values
     */
    hide: function () {
        this.isShown = false;
        this.dialog.hide();
        // reset
        this.pluginkey = '';
        this.plugintitle = '';
        this.pluginnotes = '';
        this.refresh();
    },

    /**
     * Refresh dialog fields
     */
    refresh: function () {
        this.elem.find('.plugintitle').text(this.plugintitle);

        this.elem.find('[name=pluginkey]').val(this.pluginkey);
        this.elem.find('[name=plugintitle]').val(this.plugintitle);
        this.elem.find('[name=notes]').val(this.pluginnotes);
    },

    /**
     * Save/submit values
     */
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
            this.$.proxy( this.hide, this )
        ).fail(
            this.$.proxy( this.showConflict, this )
        );
    },

    /**
     * Shows 'Notes were updated' banner and data
     */
    showConflict: function (notes) {
        this.pluginnotes = notes;
        this.elem.find('[name=prevnotes]').val(notes);
        this.elem.addClass('has-conflict');
        this.startCountDown();
    },

    /**
     * Starts 'Overwrite' button countdown
     */
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

    /**
     * Hides 'Notes were updated' block
     */
    hideConflict: function () {
        this.elem.removeClass('has-conflict');
    }
};

