/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Integration with Universal Plugin Manager's 'Manage add-ons' list of plugins
 *
 */
var AdminNotesManagePluginsView = {
    $: AJS.$,
    PLUGINS: '#upm-content .upm-plugin',
    REFRESH_RATE: 500,
    // path to icons
    PATH: AJS.contextPath() + '/download/resources'+
          '/name.vitaly.burlai.confluence-admin-notes:confluence-admin-notes-resources/images/',
    // 'Edit notes' icon
    ICON: 'notes.png',
    // 'Add notes' icon
    ICON_ADD: 'addNotes.png',
    // buttons that are already attached
    buttons: {},
    timer: undefined,

    init: function () {
        if (typeof this.timer == 'undefined') {
            this.timer = window.setInterval($.proxy(this.lookForUpdates, this), this.REFRESH_RATE);

            // Listen to collection updates
            this.$(document).on('admin-notes-collection-updated', this.$.proxy( this.collectionUpdated, this ));
        }
    },

    /**
     * Triggered when collection is updated
     */
    collectionUpdated: function () {
        this.lookForUpdates();
    },

    /**
     * Scans DOM and compares with the list of buttons that should be there
     */
    lookForUpdates: function() {
        var els = this.$(this.PLUGINS),
            self = this;

        this.$.each(els, function (ind, el) {
            // get data from DOM and from Collection to build button object
            var obj = self.createButtonObject(el);

            // plugin key
            var pluginKey = obj.pluginKey;

            // create button if button object was not created or button was removed from DOM
            if (typeof self.buttons[pluginKey] == 'undefined' ||
                self.$('#' + obj.buttonId).length === 0) {

                self.createButton(el, obj);
                self.buttons[pluginKey] = obj;
            } else {
                // update button if notes status or plugin name was updated
                if (self.objectUpdated(obj, self.buttons[pluginKey])) {
                    self.buttons[pluginKey] = obj;

                    self.updateButton(self.$('#'+obj.buttonId), obj);
                }
            }
        });
    },

    /**
     * Gets data from DOM and from Collection to build the button object
     * @returns { pluginKey: '', pluginName: '', buttonId: '', hasNotes: true/false }
     */
    createButtonObject: function (el) {
        // Different UPM versions put plugin key in different places:
        //   older versions use hidden input .upm-plugin-key
        //   newer versions use 'data-key' attribute
        var pluginKey = this.$(el).attr('data-key') || this.$(el).find('.upm-plugin-key').val();

        return {
            pluginKey: pluginKey,
            pluginName: this.$(el).find('.upm-plugin-name').text(),
            buttonId: 'admin-notes-btn-'+pluginKey.replace(/[^a-zA-Z]/g, ''),
            hasNotes: AdminNotesCollection.hasNotes(pluginKey)
        };
    },

    /**
     * Checks two button objects and compares plugin names and notes status
     * @returns true if objects differ
     */
    objectUpdated: function (obj1, obj2) {
        return obj1.hasNotes != obj2.hasNotes ||
               obj1.pluginName != obj2.pluginName;
    },

    /**
     * Create button and attach it to the Universal Plugin Manager list
     */
    createButton: function (el, obj) {
        var btn = this.$('<img src=""' +
                         ' title="Admin Notes"' +
                         ' class="admin-notes-action"' +
                         ' id="' + obj.buttonId + '"' +
                         ' data-plugin-key="' + obj.pluginKey + '">');
        // Event handlers
        btn.on('click', this.$.proxy(this.clickHandler, this));
        btn.on('mouseenter', this.$.proxy(this.hoverHandler, this));
        btn.on('mouseleave', function () { AdminNotesTooltipView.hide(); });

        // Set other fields
        this.updateButton (btn, obj);

        // Attach before '#upm-container .upm-plugin .clearer'
        var clearer = this.$(el).find('.clearer');
        clearer.before(btn);
    },

    /**
     * Update existing button with data from button object
     *
     * Sets data attributes and the icon to 'Add notes' or 'Edit notes'.
     */
    updateButton: function (btn, obj) {
        btn.attr('src', this.PATH + (obj.hasNotes ?  this.ICON : this.ICON_ADD));
        btn.attr('data-plugin-name', obj.pluginName);
        btn.attr('data-has-notes', obj.hasNotes ? "yes" : "no");
    },

    /**
     * Opens add or edit notes dialog
     */
    clickHandler: function (event) {
        var target = this.$(event.target),
            key = target.attr('data-plugin-key'),
            title = target.attr('data-plugin-name');

        event.stopPropagation();

        AdminNotesTooltipView.hide();

        if (AdminNotesCollection.hasNotes(key)) {
            AdminNotesDialog.show(key);
        } else {
            AdminNotesDialog.add(key, title);
        }
    },

    /**
     * Shows tooltip for elements with 'data-has-notes'='yes'
     */
    hoverHandler: function (event) {
        var target = this.$(event.target),
            key = target.attr('data-plugin-key'),
            hasNotes = target.attr('data-has-notes') === 'yes';

        if (hasNotes) {
            AdminNotesTooltipView.show(target, key);
        }
    }
};

