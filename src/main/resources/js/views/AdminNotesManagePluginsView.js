/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Integration with Universal Plugin Manager's 'Manage add-ons' list of plugins
 *
 */
var AdminNotesManagePluginsView = {
    $: AJS.$,
    PLUGINS: '.upm-manage-type .upm-plugin',
    REFRESHRATE: 1000,
    PATH: AJS.contextPath() + '/download/resources'+
          '/name.vitaly.burlai.confluence-admin-notes:confluence-admin-notes-resources/images/',
    ICON: 'notes.png',
    ICON_ADD: 'addNotes.png',
    // buttons that are already attached
    buttons: {},
    timer: null,
    init: function () {
        if (this.timer === null) {
            this.timer = window.setInterval($.proxy(this.lookForUpdates, this));
        }
    },
    // checks DOM for new plugin listings
    lookForUpdates: function() {
        var els = this.$(this.PLUGINS),
            self = this;
        this.$.each(els, function (ind, el) {
            var obj = self.createButtonObject(el);
            var pluginkey = obj.pluginkey;
            if (typeof self.buttons[pluginkey] == 'undefined') {
                self.createButton(el, obj);
                self.buttons[pluginkey] = obj;
            }
        });
    },
    createButtonObject: function (el) {
        var pluginkey = this.$(el).find('.upm-plugin-key').val();
        return {
            pluginkey: pluginkey,
            pluginname: this.$(el).find('.upm-plugin-name').text(),
            elemId: this.$(el).attr('id'),
            buttonId: 'admin-notes-btn-'+pluginkey.replace(/[^a-zA-Z]/g, ''),
            hasNotes: AdminNotesCollection.hasNotes(pluginkey)
        };
    },
    objectUpdated: function (obj1, obj2) {
        return obj1.hasNotes != obj2.hasNotes ||
               obj1.pluginname != obj2.pluginname;
    },
    createButton: function (el, obj) {
        var btn = this.$('<img src=""' +
                         ' class="admin-notes-action"' +
                         ' id="' + obj.buttonId + '"' +
                         ' data-pluginkey="' + obj.pluginkey + '">');
        this.updateButton (btn, obj);
        this.$(el).find('.upm-plugin-action-buttons').append(btn);
    },
    updateButton: function (btn, obj) {
        btn.attr('src', this.PATH + (obj.hasNotes ?  this.ICON : this.ICON_ADD));
        btn.attr('title', 'Admin Notes');
        btn.attr('data-pluginname', obj.pluginname);
        btn.on('click', this.$.proxy(this.clickHandler, this));
    },
    clickHandler: function (event) {
        var key = this.$(event.target).attr('data-pluginkey'),
            title = this.$(event.target).attr('data-pluginname');
        event.stopPropagation();
        if (AdminNotesCollection.hasNotes(key)) {
            AdminNotesDialog.show(key);
        } else {
            AdminNotesDialog.add(key, title);
        }
    }
};

