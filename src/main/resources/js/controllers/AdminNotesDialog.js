/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Dialog for editing plugin notes
 *
 */
var AdminNotesDialog = {
    $: AJS.$,
    elem: null,
    dialog: null,
    pluginkey: '',
    plugintitle: '',
    pluginnotes: '',
    init: function () {
        if (this.elem === null) {
            this.elem = $('<section role="dialog" id="admin-notes-dialog" '+
                          'class="aui-layer aui-dialog2 aui-dialog2-medium" aria-hidden="true"></section>');
            $('BODY').append(this.elem);

            this.render();

            this.dialog = AJS.dialog2('#admin-notes-dialog');

            this.elem.find('#dialog-submit-button').on('click', function () { AdminNotesDialog.save(); });
            this.elem.find('#dialog-close-button').on('click', function () { AdminNotesDialog.hide(); });
        }
    },
    render: function () {
        var html = '';
        html += '<header class="aui-dialog2-header">';
        html += '  <h2 class="aui-dialog2-header-main">Admin Notes</h2>';
        html += '  <a class="aui-dialog2-header-close"><span class="aui-icon aui-icon-small aui-iconfont-close-dialog">Close</span></a>';
        html += '</header>';
        html += '<div class="aui-dialog2-content">';
        html += '  <p>Plugin: <span class="plugintitle"></span></p>';
        html += '  <input type="hidden" name="pluginkey" value="">';
        html += '  <textarea name="notes"></textarea>';
        html += '</div>';
        html += '<footer class="aui-dialog2-footer">';
        html += '<div class="aui-dialog2-footer-actions">';
        html += '  <button id="dialog-submit-button" class="aui-button aui-button-primary">Save</button>';
        html += '  <button id="dialog-close-button" class="aui-button aui-button-close">Close</button>';
        html += '</div>';
        // html += '<div class="aui-dialog2-footer-hint">Hint</div>';
        html += '</footer>';

        this.elem.html(html);
    },
    show: function (key) {
        AdminNotesView.hideList();

        this.pluginkey = key;
        this.plugintitle = AdminNotesCollection.getTitle(key);
        this.pluginnotes = AdminNotesCollection.getNotes(key);

        if (this.elem === null) {
            this.init();
        }

        this.refresh();

        this.dialog.show();
    },
    hide: function () {
        this.dialog.hide();
    },
    refresh: function () {
        this.elem.find('[name=pluginkey]').val(this.pluginkey);
        this.elem.find('.plugintitle').text(this.plugintitle);
        this.elem.find('[name=notes]').text(this.pluginnotes);
    },
    save: function () {
        var key = this.elem.find('[name=pluginkey]').val(),
            notes = this.elem.find('[name=notes]').val();

        AdminNotesCollection.save(key, notes).done(
            this.$.proxy(
                function () {
                    this.hide();
                }, this) ).fail(
            this.$.proxy(
                function () {
                    // TODO: conflict resolution
                    alert('Failed to save, try again');
                }, this) );
    }
};

