/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Drop-down list of plugins which have notes
 *
 * @type {{$: jQuery, elem: null, list: Array, listDiv: null, init: Function, setList: Function, render: Function, renderElement: Function}}
 */
var AdminNotesListView = {
    $: AJS.$,
    elem: null,
    list: [],
    listDiv: null,
    init: function () {
        if (this.elem === null) {
            this.listDiv = this.$('<div class="list"></div>');
            this.elem = this.$('<div id="confluence-admin-notes-list" class="ldng">'+
                               '<span class="loading">Loading...</span>'+
                                '</div>');
            this.elem.append(this.listDiv);
            this.elem.append('<div class="add">Click \'Notes\' button next to<br> a plugin name to add notes.</div>');

            AdminNotesView.init();
            AdminNotesView.checkbox.after(this.elem);

            this.elem.on('click', '.list-item', this.clickHandler);
        }
    },
    clickHandler: function (event) {
        var key = $(event.target).attr('data-pluginkey');

        if (key) {
            AdminNotesDialog.show(key);
        }
    },
    setList: function (list) {
        this.elem.removeClass('ldng');

        this.list = list;

        AdminNotesView.setCount(list.length);

        this.render();
    },
    render: function () {
        var html = "";
        for (var i = 0, l = this.list.length; i < l; i++) {
            html += this.renderElement(this.list[i]);
        }
        this.listDiv.html(html);
    },
    renderElement: function (el) {
        return '<div class="list-item" data-pluginkey="' + el.key + '">' + el.title + '</div>';
    }
};

