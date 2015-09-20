/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Button with indication of the number of plugins
 *
 * @type {{$: jQuery, count: number, countSpan: null, elem: null, checkbox: null, init: Function, setCount: Function, getCount: Function}}
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
    },
    hideList: function () {
        this.checkbox.prop('checked', false);
    },
    showList: function () {
        this.checkbox.prop('checked', true);
    }
};

