/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Drop-down list of entries which have notes
 *
 */
var AdminNotesListView = {
    $: AJS.$,
    elem: null,
    list: [],
    listDiv: null,
    // title depending on context
    titles: {
      'plugins': 'plugin',
      'macros': 'macro'
    },
    // context, 'plugins' or 'macros'
    context: 'plugins',

    init: function (context) {
        if (this.elem === null) {
            this.context = context;
            this.listDiv = this.$('<div class="list"></div>');
            this.elem = this.$('<div id="confluence-admin-notes-list" class="ldng">'+
                               '<span class="loading">Loading...</span>'+
                                '</div>');
            this.elem.append(this.listDiv);
            this.elem.append('<div class="add">Click \'Notes\' button next to<br> a ' + (this.titles[this.context] || '') + ' name to add notes.</div>');

            // Depends on AdminNotesView
            // @TODO: Maybe combine two views into one
            AdminNotesView.init();
            AdminNotesView.checkbox.after(this.elem);

            // Event listeners
            this.elem.on('click', '.list-item', this.clickHandler);

            // Listen to collection updates
            this.$(document).on('admin-notes-collection-updated', this.$.proxy( this.collectionUpdated, this ));
        }
    },

    /**
     * Triggered on collection updates, view gets refreshed
     */
    collectionUpdated: function () {
        var l = AdminNotesCollection.getEntries();

        this.resetList(l);
    },

    /**
     * Click on .list-item (which has 'data-key' attribute)
     */
    clickHandler: function (event) {
        var key = $(event.target).attr('data-key');

        if (key) {
            AdminNotesDialog.show(key);
        }
    },

    /**
     * Replaces the list with the data from collection
     * @param list data from AdminNotesCollection
     */
    resetList: function (list) {
        this.elem.removeClass('ldng');

        this.list = list;

        // @TODO: Maybe combine two views into one
        AdminNotesView.setCount(list.length);

        this.render();
    },

    /**
     * Update inner HTML
     */
    render: function () {
        var html = "";
        for (var i = 0, l = this.list.length; i < l; i++) {
            html += this.renderElement(this.list[i]);
        }
        this.listDiv.html(html);
    },

    /**
     * HTML code for .list-item
     * @param el object of {key: '' , title: ''}
     */
    renderElement: function (el) {
        return '<div class="list-item" data-key="' + el.key + '">' + el.title + '</div>';
    }
};

