/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

var AdminNotesView = {
    $: AJS.$,
    count: 0,
    countSpan: null,
    elem: null,
    checkbox: null,
    init: function () {
        if (this.elem === null) {
            this.countSpan = this.$('<div class="count">' + this.getCount() + '</div>');
            if (this.getCount() === 0) {
                this.countSpan.addClass('invisible');
            }
            this.elem = this.$('<label for="confluence-admin-notes-list-shown" id="confluence-admin-notes" title="Admin Notes" />');
            this.elem.append(this.countSpan);
            this.elem.appendTo('#upm-content .upm-more-actions');

            this.checkbox = AJS.$('<input type="checkbox" id="confluence-admin-notes-list-shown" />');
            this.elem.after(this.checkbox);
        }
    },
    setCount: function (c) {
        this.count = c;
        if (this.countSpan) {
            if (c === 0) {
                this.countSpan.addClass('invisible');
            } else {
                this.countSpan.removeClass('invisible');
            }
            this.countSpan.text(c);
        }

    },
    getCount: function () {
        return this.count;
    }
};

var AdminNotesListView = {
    $: AJS.$,
    elem: null,
    list: [],
    listDiv: null,
    init: function () {
        if (this.elem === null) {
            this.listDiv = this.$('<div class="list"></div>');
            this.elem = this.$('<div id="confluence-admin-notes-list" class="ldng"><span class="loading">Loading...</span></div>');
            this.elem.append(this.listDiv);

            AdminNotesView.init();
            AdminNotesView.checkbox.after(this.elem);
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

(function($){
    $(window).bind('upmready', function() {
        AdminNotesView.init();
        AdminNotesListView.init();

        AdminNotesListView.setList([{key: '123', title: '123 123'}, {key: '456', title: '456 456'}]);
    });
})(AJS.$);

